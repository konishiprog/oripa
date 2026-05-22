/**
 * 'api/user': Project API for User Management
 */
export {};

import express, { Request, Response, Router } from "express";
const messages = require("../../constants/messages.json");

let runtime: any;

const isValidPhone = (phone: string): boolean => {
  return /^\d+$/.test(phone);
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
     * Create a new user (signup)
     * POST /api/user
     */
    router.post("/", async (req: Request, res: Response) => {
      const { email, password, name, address, phone } = req.body;
      if (!email || !password || !name || !address || !phone) {
        return res
          .status(400)
          .json({ error: messages.errors.USER_FIELDS_REQUIRED });
      }

      if (!isValidPhone(phone)) {
        return res
          .status(400)
          .json({ error: messages.errors.PHONE_INVALID_FORMAT });
      }

      try {
        const user = await runtime.user.create({
          email,
          password,
          name,
          address,
          phone,
        });
        return res.status(201).json({
          message: messages.success.USER_CREATED,
          data: user,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "User creation");
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
      const { email, password, name, address, phone, coin } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ error: messages.errors.USER_ID_REQUIRED });
      }

      try {
        const user = await runtime.user.update(id, {
          email,
          password,
          name,
          address,
          phone,
          coin,
        });
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
        return res
          .status(401)
          .json({ error: messages.errors.UNAUTHORIZED });
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
          rate.point,
          rate.specialPoint,
        );

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
