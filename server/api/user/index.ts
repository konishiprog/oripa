/**
 * 'api/user': Project API for User Management
 */
export {};

import express, { Request, Response, Router } from "express";
const https = require("https");
const messages = require("../../constants/messages.json");

let runtime: any;

const isValidPhone = (phone: string): boolean => {
  return /^\d+$/.test(phone);
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getAddressByPostalCode = (
  postalCode: string,
): Promise<{ address: string; prefcode: string } | null> => {
  return new Promise((resolve) => {
    const cleanedPostalCode = postalCode.replace(/-/g, "");
    const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedPostalCode}`;

    https
      .get(url, (res: any) => {
        let data = "";
        res.on("data", (chunk: string) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const result = JSON.parse(data);
            if (result.results && result.results.length > 0) {
              const r = result.results[0];
              const address = `${r.address1}${r.address2}${r.address3}`;
              resolve({ address, prefcode: r.prefcode });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error("Error parsing zipcloud response:", error);
            resolve(null);
          }
        });
      })
      .on("error", (error: any) => {
        console.error("Error fetching from zipcloud:", error);
        resolve(null);
      });
  });
};

const handleError = (
  error: any,
  context: string,
): { status: number; message: string } => {
  console.error(`${context} error:`, error);
  if (error.message === messages.errors.EMAIL_ALREADY_EXISTS) {
    return { status: 409, message: messages.errors.EMAIL_ALREADY_EXISTS };
  }
  if (error.message === messages.errors.PHONE_ALREADY_EXISTS) {
    return { status: 409, message: messages.errors.PHONE_ALREADY_EXISTS };
  }
  return { status: 500, message: error.message };
};

module.exports = {
  /**
   * Initialize user API with runtime
   * @param {*} _runtime - Runtime instance containing user module
   */
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  /**
   * Create and return Express router with user endpoints
   * @returns {Router} Express router with user routes
   */
  app: function () {
    const router: Router = express.Router();

    /**
     * Login a user (by email or phone)
     * POST /api/user/login
     */
    router.post("/login", async (req: Request, res: Response) => {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res
          .status(400)
          .json({ error: messages.errors.IDENTIFIER_PASSWORD_REQUIRED });
      }

      try {
        const user = await runtime.user.verifyCredentials(identifier, password);
        if (!user) {
          return res
            .status(401)
            .json({ error: messages.errors.INVALID_CREDENTIALS });
        }
        return res.status(200).json({
          message: messages.success.LOGIN_SUCCESSFUL,
          data: user,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "User login");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Create a pending verification (send verification email)
     * POST /api/user
     */
    router.post("/", async (req: Request, res: Response) => {
      const { email, password, name, address, phone, postalCode } = req.body;
      if (!email || !password || !name || !address || !phone || !postalCode) {
        return res
          .status(400)
          .json({ error: messages.errors.USER_FIELDS_REQUIRED });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (!isValidPhone(phone)) {
        return res
          .status(400)
          .json({ error: messages.errors.PHONE_INVALID_FORMAT });
      }

      try {
        const pending = await runtime.user.createPending({
          email,
          password,
          name,
          address,
          phone,
          postalCode,
        });

        // Generate verification URL
        const clientUrl = process.env.CLIENT_URL || "http://localhost:4200";
        const verifyUrl = `${clientUrl}/verify-email?token=${pending.token}`;

        await runtime.email.sendSignupEmail(email, verifyUrl, name);

        return res.status(200).json({
          message: messages.success.SIGNUP_EMAIL_SENT,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "User creation");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Verify email and create user
     * GET /api/user/verify-email?token=xxx
     */
    router.get("/verify-email", async (req: Request, res: Response) => {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res
          .status(400)
          .json({ error: "Verification token is required" });
      }

      try {
        const user = await runtime.user.verifyEmail(token);
        return res.status(201).json({
          message: messages.success.ACCOUNT_CREATED,
          data: user,
        });
      } catch (error: any) {
        if (error.status === 404) {
          return res
            .status(404)
            .json({ error: messages.errors.INVALID_VERIFICATION_LINK });
        }
        if (error.status === 410) {
          return res
            .status(410)
            .json({ error: messages.errors.VERIFICATION_LINK_EXPIRED });
        }
        const { status, message } = handleError(error, "Email verification");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Verify email change
     * GET /api/user/verify-email-change?token=xxx
     */
    router.get("/verify-email-change", async (req: Request, res: Response) => {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res
          .status(400)
          .json({ error: "Verification token is required" });
      }

      try {
        const user = await runtime.user.verifyEmailChange(token);
        return res.status(200).json({
          message: messages.success.USER_UPDATED,
          data: user,
        });
      } catch (error: any) {
        if (error.status === 404) {
          return res
            .status(404)
            .json({ error: messages.errors.INVALID_VERIFICATION_LINK });
        }
        if (error.status === 410) {
          return res
            .status(410)
            .json({ error: messages.errors.VERIFICATION_LINK_EXPIRED });
        }
        const { status, message } = handleError(
          error,
          "Email change verification",
        );
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Get all users
     * GET /api/user
     */
    router.get("/", async (_req: Request, res: Response) => {
      try {
        const users = await runtime.user.getAll();
        return res.status(200).json({
          message: messages.success.USERS_RETRIEVED,
          data: users,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "User retrieval");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Get address by postal code
     * GET /api/user/postal-code/:postalCode
     */
    router.get(
      "/postal-code/:postalCode",
      async (req: Request, res: Response) => {
        const postalCode = req.params.postalCode as string;

        if (!postalCode || typeof postalCode !== "string") {
          return res.status(400).json({ error: "Postal code is required" });
        }

        try {
          const result = await getAddressByPostalCode(postalCode);
          if (result) {
            return res.status(200).json({
              message: messages.success.ADDRESS_FOUND,
              data: result,
            });
          } else {
            return res.status(404).json({
              error: "Address not found for the given postal code",
            });
          }
        } catch (error: any) {
          const { status, message } = handleError(error, "Postal code lookup");
          return res.status(status).json({ error: message });
        }
      },
    );

    /**
     * Get a single user by id
     * GET /api/user/:id
     */
    router.get("/:id", async (req: Request, res: Response) => {
      const { id } = req.params;
      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({ error: messages.errors.USER_NOT_FOUND });
      }

      try {
        const user = runtime.user.getById(id);
        if (!user) {
          return res
            .status(404)
            .json({ error: messages.errors.USER_NOT_FOUND });
        }
        return res.status(200).json({
          message: messages.success.USERS_RETRIEVED,
          data: user,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "User retrieval");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Update a user
     * PUT /api/user/:id
     */
    router.put("/:id", async (req: Request, res: Response) => {
      const { id } = req.params;
      const { email, password, name, address, phone, postalCode, coin } =
        req.body;

      if (!id) {
        return res
          .status(400)
          .json({ error: messages.errors.USER_ID_REQUIRED });
      }

      if (email && !isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      try {
        const oldUser = await runtime.user.getById(id);
        const updateData: any = {
          password,
          name,
          address,
          phone,
          postalCode,
          coin,
        };

        if (!email || email === oldUser.email) {
          updateData.email = email;
        }

        const user = await runtime.user.update(id, updateData);

        if (oldUser && oldUser.phone !== phone && phone) {
          await runtime.email.sendPhoneChangeEmail(
            user.email,
            user.name,
            oldUser.phone,
            phone,
          );
        }

        if (oldUser && oldUser.address !== address && address) {
          await runtime.email.sendAddressChangeEmail(
            user.email,
            user.name,
            oldUser.address,
            address,
          );
        }

        if (oldUser && oldUser.password !== password && password) {
          await runtime.email.sendPasswordChangeEmail(user.email, user.name);
        }

        if (oldUser && email && oldUser.email !== email) {
          const clientUrl = process.env.CLIENT_URL || "http://localhost:4200";
          const pending = await runtime.user.createPendingEmailChange(
            id,
            email,
          );
          const verifyUrl = `${clientUrl}/verify-email-change?token=${pending.token}`;

          await runtime.email.sendEmailChangeEmail(email, verifyUrl, user.name);

          return res.status(200).json({
            message: messages.success.USER_UPDATED,
            data: user,
          });
        }

        return res.status(200).json({
          message: messages.success.USER_UPDATED,
          data: user,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "User update");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Charge a user's coin balance
     * POST /api/user/charge
     * Body: { rateId }
     * Headers: x-user-id
     */
    router.post("/charge", async (req: Request, res: Response) => {
      const { rateId } = req.body;
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: messages.errors.UNAUTHORIZED });
      }

      if (!rateId) {
        return res
          .status(400)
          .json({ error: messages.errors.RATE_ID_REQUIRED });
      }

      try {
        const rate = runtime.coinExchangeRate.getById(rateId);
        if (!rate) {
          return res
            .status(404)
            .json({ error: messages.errors.RATE_NOT_FOUND });
        }

        const result = await runtime.user.charge(
          userId,
          rate.price,
          rate.point,
          rate.specialPoint,
        );

        const user = runtime.user.getById(userId);
        if (user?.email) {
          await runtime.email.sendCoinPurchaseEmail(
            user.email,
            user.name,
            rate.price,
            result.addedPoint,
            result.addedSpecialPoint,
            result.newCoin,
          );
        }

        return res.status(200).json({
          message: messages.success.CHARGE_SUCCESSFUL,
          data: result,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "User charge");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Notify a user that their cards were exchanged for coins
     * POST /api/user/notify-card-exchange
     * Body: { cardIds: string[] }
     * Headers: x-user-id
     */
    router.post(
      "/notify-card-exchange",
      async (req: Request, res: Response) => {
        const userId = req.headers["x-user-id"] as string;
        const { cardIds } = req.body as { cardIds: string[] };

        if (!userId) {
          return res.status(401).json({ error: messages.errors.UNAUTHORIZED });
        }

        if (!Array.isArray(cardIds) || cardIds.length === 0) {
          return res
            .status(400)
            .json({ error: messages.errors.MISSING_REQUIRED_FIELDS });
        }

        try {
          const user = runtime.user.getById(userId);
          if (!user?.email) {
            return res
              .status(404)
              .json({ error: messages.errors.USER_NOT_FOUND });
          }

          const allCards = await runtime.card.getAll();
          const ownedCards = allCards.filter(
            (card: any) => cardIds.includes(card.id) && card.userId === userId,
          );

          const gainedPoint = ownedCards.reduce(
            (sum: number, card: any) => sum + (card.exchangePoints || 0),
            0,
          );

          await runtime.email.sendCardExchangeEmail(
            user.email,
            user.name,
            ownedCards.length,
            gainedPoint,
            user.coin || 0,
          );

          return res.status(200).json({ message: messages.success.RETRIEVED });
        } catch (error: any) {
          const { status, message } = handleError(
            error,
            "Card exchange notification",
          );
          return res.status(status).json({ error: message });
        }
      },
    );

    /**
     * Reset user password by email and phone
     * POST /api/user/forgot-password
     */
    router.post("/forgot-password", async (req: Request, res: Response) => {
      const { email, phone } = req.body;
      if (!email || !phone) {
        return res
          .status(400)
          .json({ error: messages.errors.EMAIL_PHONE_REQUIRED });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      try {
        const { user, newPassword } = await runtime.user.forgotPassword(
          email,
          phone,
        );
        await runtime.email.sendPasswordResetEmail(
          user.email,
          user.name,
          newPassword,
        );
        return res.status(200).json({
          message: messages.success.PASSWORD_RESET_EMAIL_SENT,
        });
      } catch (error: any) {
        if (error.message === messages.errors.EMAIL_PHONE_NOT_FOUND) {
          return res.status(404).json({ error: error.message });
        }
        const { status, message } = handleError(error, "Password reset");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Delete a user
     * DELETE /api/user/:id
     */
    router.delete("/:id", async (req: Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ error: messages.errors.USER_ID_REQUIRED });
      }

      try {
        await runtime.user.delete(id);
        return res.status(200).json({
          message: messages.success.USER_DELETED,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "User deletion");
        return res.status(status).json({ error: message });
      }
    });

    return router;
  },
};
