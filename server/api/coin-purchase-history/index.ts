/**
 * 'api/coin-purchase-history': Project API for Coin Purchase History
 */
export {};

import express, { Request, Response, Router, raw } from "express";
import messages from "../../constants/messages.json";
import {
  verifyWebhookSignature,
  retrievePaymentIntent,
} from "../../utils/stripeService";

let runtime: any;

module.exports = {
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  app: function () {
    const router: Router = express.Router();

    /**
     * Get all coin purchase histories (admin only)
     * GET /api/coin-purchase-history?limit=100&offset=0
     */
    router.get("/", async (req: Request, res: Response) => {
      try {
        const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
        const offset = parseInt(req.query.offset as string) || 0;
        const histories = await runtime.coinPurchaseHistory.getAll(limit, offset);
        res.status(200).json({
          message: messages.success.RETRIEVED,
          data: histories,
        });
      } catch (error) {
        console.error("Failed to get coin purchase histories:", error);
        res.status(500).json({ message: messages.errors.SERVER_ERROR });
      }
    });

    /**
     * Get purchase histories for a specific user
     * GET /api/coin-purchase-history/user/:userId
     */
    router.get("/user/:userId", async (req: Request, res: Response) => {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          message: messages.errors.USER_ID_REQUIRED,
        });
      }

      try {
        const histories = await runtime.coinPurchaseHistory.getByUserId(userId);
        res.status(200).json({
          message: messages.success.RETRIEVED,
          data: histories,
        });
      } catch (error) {
        console.error("Failed to get user purchase histories:", error);
        res.status(500).json({ message: messages.errors.SERVER_ERROR });
      }
    });

    /**
     * Create a new coin purchase history
     * POST /api/coin-purchase-history
     */
    router.post("/", async (req: Request, res: Response) => {
      const { userId, price, point, specialPoint } = req.body;

      if (!userId || price === undefined || point === undefined) {
        return res.status(400).json({
          message: messages.errors.MISSING_REQUIRED_FIELDS,
        });
      }

      try {
        const history = await runtime.coinPurchaseHistory.create(
          userId,
          price,
          point,
          specialPoint || 0,
        );
        res.status(201).json({
          message: messages.success.CREATED,
          data: history,
        });
      } catch (error) {
        console.error("Failed to create coin purchase history:", error);
        res.status(500).json({ message: messages.errors.SERVER_ERROR });
      }
    });

    /**
     * Create payment intent for Stripe charge
     * POST /api/coin-purchase-history/charge/create-payment-intent
     */
    router.post(
      "/charge/create-payment-intent",
      async (req: Request, res: Response) => {
        try {
          const { userId, amount, point, specialPoint } = req.body;

          if (!userId || !amount || !point) {
            return res.status(400).json({
              message: messages.errors.MISSING_REQUIRED_FIELDS,
            });
          }

          const result = await runtime.coinPurchaseHistory.createCharge(
            userId,
            amount,
            point,
            specialPoint || 0,
          );

          res.status(200).json({
            message: "Payment intent created",
            data: result,
          });
        } catch (error: any) {
          console.error("Failed to create payment intent:", error);
          res.status(500).json({
            message: messages.errors.SERVER_ERROR,
            error: error.message,
          });
        }
      },
    );

    /**
     * Get charge history for a specific user
     * GET /api/coin-purchase-history/charge/history/:userId?limit=50&offset=0
     */
    router.get(
      "/charge/history/:userId",
      async (req: Request, res: Response) => {
        try {
          const { userId } = req.params;

          if (!userId) {
            return res.status(400).json({
              message: messages.errors.USER_ID_REQUIRED,
            });
          }

          const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
          const offset = parseInt(req.query.offset as string) || 0;

          const histories =
            await runtime.coinPurchaseHistory.getChargeHistory(userId, limit, offset);

          res.status(200).json({
            message: messages.success.RETRIEVED,
            data: histories,
          });
        } catch (error: any) {
          console.error("Failed to get charge history:", error);
          res.status(500).json({
            message: messages.errors.SERVER_ERROR,
          });
        }
      },
    );

    /**
     * Confirm payment intent status and update points
     * POST /api/coin-purchase-history/confirm-payment
     */
    router.post("/confirm-payment", async (req: Request, res: Response) => {
      try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
          return res.status(400).json({
            message: messages.errors.MISSING_REQUIRED_FIELDS,
          });
        }

        const paymentIntent = await retrievePaymentIntent(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
          await runtime.coinPurchaseHistory.updateChargeStatus(
            paymentIntentId,
            "succeeded",
            paymentIntent.payment_method_types?.[0],
          );
        }

        const chargeHistory =
          await runtime.coinPurchaseHistory.getByPaymentIntentId(
            paymentIntentId,
          );

        res.status(200).json({
          message: messages.success.RETRIEVED,
          data: {
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            point: chargeHistory?.point || 0,
            specialPoint: chargeHistory?.specialPoint || 0,
          },
        });
      } catch (error: any) {
        console.error("Failed to confirm payment:", error);
        res.status(500).json({
          message: messages.errors.SERVER_ERROR,
          error: error.message,
        });
      }
    });

    /**
     * Stripe webhook for payment events
     * POST /api/coin-purchase-history/webhooks/stripe
     */
    router.post(
      "/webhooks/stripe",
      raw({ type: "application/json" }),
      async (req: Request, res: Response) => {
        const signature = req.headers["stripe-signature"] as string;
        const body = req.body;

        try {
          const event = verifyWebhookSignature(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || "",
          );

          switch (event.type) {
            case "payment_intent.succeeded":
              await handlePaymentIntentSucceeded(event.data.object as any);
              break;
            case "payment_intent.payment_failed":
              await handlePaymentIntentFailed(event.data.object as any);
              break;
            case "payment_intent.canceled":
              await handlePaymentIntentCancelled(event.data.object as any);
              break;
          }

          res.json({ received: true });
        } catch (error: any) {
          console.error("Webhook error:", error);
          res.status(400).json({ error: error.message });
        }
      },
    );

    async function handlePaymentIntentSucceeded(paymentIntent: any) {
      await runtime.coinPurchaseHistory.updateChargeStatus(
        paymentIntent.id,
        "succeeded",
        paymentIntent.payment_method_types?.[0],
      );
    }

    async function handlePaymentIntentFailed(paymentIntent: any) {
      await runtime.coinPurchaseHistory.updateChargeStatus(
        paymentIntent.id,
        "failed",
        undefined,
        paymentIntent.last_payment_error?.message,
      );
    }

    async function handlePaymentIntentCancelled(paymentIntent: any) {
      await runtime.coinPurchaseHistory.updateChargeStatus(
        paymentIntent.id,
        "cancelled",
      );
    }

    return router;
  },
};
