/**
 * 'api/coin-purchase-history': Project API for Coin Purchase History
 */
export {};

import express, { Request, Response, Router } from 'express';
import messages from '../../constants/messages.json';

let runtime: any;

module.exports = {
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  app: function () {
    const router: Router = express.Router();

    /**
     * Get all coin purchase histories (admin only)
     * GET /api/coin-purchase-history
     */
    router.get('/', async (_req: Request, res: Response) => {
      try {
        const histories = await runtime.coinPurchaseHistory.getAll();
        res.status(200).json({
          message: messages.success.RETRIEVED,
          data: histories,
        });
      } catch (error) {
        console.error('Failed to get coin purchase histories:', error);
        res
          .status(500)
          .json({ message: messages.errors.SERVER_ERROR });
      }
    });

    /**
     * Get purchase histories for a specific user
     * GET /api/coin-purchase-history/user/:userId
     */
    router.get('/user/:userId', async (req: Request, res: Response) => {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          message: messages.errors.USER_ID_REQUIRED,
        });
      }

      try {
        const histories = await runtime.coinPurchaseHistory.getByUserId(
          userId,
        );
        res.status(200).json({
          message: messages.success.RETRIEVED,
          data: histories,
        });
      } catch (error) {
        console.error('Failed to get user purchase histories:', error);
        res
          .status(500)
          .json({ message: messages.errors.SERVER_ERROR });
      }
    });

    /**
     * Create a new coin purchase history
     * POST /api/coin-purchase-history
     */
    router.post('/', async (req: Request, res: Response) => {
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
        console.error('Failed to create coin purchase history:', error);
        res
          .status(500)
          .json({ message: messages.errors.SERVER_ERROR });
      }
    });

    return router;
  },
};
