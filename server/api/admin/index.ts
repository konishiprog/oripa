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

    /**
     * Update an existing admin user
     * PUT /api/admin/:id
     */
    router.put("/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { email, password } = req.body;

        if (!email || !password) {
          return res
            .status(400)
            .json({ error: "Email and password are required" });
        }

        const admin = await runtime.admin.update(id, email, password);
        return res.status(200).json({
          message: "Admin updated successfully",
          data: admin,
        });
      } catch (error: any) {
        console.error("Admin update error:", error);
        if (error.message === "Email already exists") {
          return res.status(409).json({ error: "Email already exists" });
        }
        if (error.message === "Admin not found") {
          return res.status(404).json({ error: "Admin not found" });
        }
        return res.status(500).json({ error: error.message });
      }
    });

    /**
     * Delete an admin user
     * DELETE /api/admin/:id
     */
    router.delete("/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        await runtime.admin.deleteAdmin(id);
        return res.status(200).json({
          message: "Admin deleted successfully",
        });
      } catch (error: any) {
        console.error("Admin delete error:", error);
        if (error.message === "Admin not found") {
          return res.status(404).json({ error: "Admin not found" });
        }
        return res.status(500).json({ error: error.message });
      }
    });

    /**
     * Get all admin users
     * GET /api/admin
     */
    router.get("/", async (_req: Request, res: Response) => {
      try {
        const admins = await runtime.admin.getAll();
        const data = admins.map((admin: any) => admin.get({ plain: true }));
        return res.status(200).json({
          message: "Admins retrieved successfully",
          data,
        });
      } catch (error: any) {
        console.error("Admin retrieval error:", error);
        return res.status(500).json({ error: error.message });
      }
    });

    return router;
  },
};
