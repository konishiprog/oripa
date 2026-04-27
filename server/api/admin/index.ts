/**
 * 'api/admin': Project API for Admin Management
 */
export {};

import express, { Request, Response, Router } from "express";

let runtime: any;

module.exports = {
  /**
   * Initialize admin API with runtime
   * @param {*} _runtime - Runtime instance containing admin module
   */
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  /**
   * Create and return Express router with admin endpoints
   * @returns {Router} Express router with admin routes
   */
  app: function () {
    const router: Router = express.Router();

    /**
     * Create a new admin user
     * POST /api/admin
     */
    router.post("/", async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res
            .status(400)
            .json({ error: "Email and password are required" });
        }

        const admin = await runtime.admin.create(email, password);
        return res.status(201).json({
          message: "Admin created successfully",
          data: admin,
        });
      } catch (error: any) {
        console.error("Admin creation error:", error);
        if (error.message === "Email already exists") {
          return res.status(409).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: error.message });
      }
    });

    return router;
  },
};
