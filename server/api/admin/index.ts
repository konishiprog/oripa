/**
 * 'api/admin': Project API for Admin Management
 */
export {};

import express, { Request, Response, Router } from "express";

let runtime: any;

const validateCredentials = (req: Request, res: Response): boolean => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return false;
  }
  return true;
};

const handleError = (
  error: any,
  context: string,
): { status: number; message: string } => {
  console.error(`${context} error:`, error);
  if (error.message === "Email already exists") {
    return { status: 409, message: "Email already exists" };
  }
  if (error.message === "Admin not found") {
    return { status: 404, message: "Admin not found" };
  }
  return { status: 500, message: error.message };
};

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
     * Login admin user
     * POST /api/admin/login
     */
    router.post("/login", async (req: Request, res: Response) => {
      if (!validateCredentials(req, res)) return;

      try {
        const { email, password } = req.body;
        const admin = await runtime.admin.verifyCredentials(email, password);
        if (!admin) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        return res.status(200).json({
          message: "Login successful",
          data: admin,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Login");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Create a new admin user
     * POST /api/admin
     */
    router.post("/", async (req: Request, res: Response) => {
      if (!validateCredentials(req, res)) return;

      try {
        const { email, password } = req.body;
        const admin = await runtime.admin.create(email, password);
        return res.status(201).json({
          message: "Admin created successfully",
          data: admin,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Admin creation");
        return res.status(status).json({ error: message });
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
        const { status, message } = handleError(error, "Admin retrieval");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Get an admin user by id
     * GET /api/admin/:id
     */
    router.get("/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const admins = await runtime.admin.getAll();
        const admin = admins.find((a: any) => a.id === id);
        if (!admin) {
          return res.status(404).json({ error: "Admin not found" });
        }
        return res.status(200).json({
          message: "Admin retrieved successfully",
          data: admin,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Admin retrieval");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Update an existing admin user
     * PUT /api/admin/:id
     */
    router.put("/:id", async (req: Request, res: Response) => {
      if (!validateCredentials(req, res)) return;

      try {
        const { id } = req.params;
        const { email, password } = req.body;
        const admin = await runtime.admin.update(id, email, password);
        return res.status(200).json({
          message: "Admin updated successfully",
          data: admin,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Admin update");
        return res.status(status).json({ error: message });
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
        const { status, message } = handleError(error, "Admin delete");
        return res.status(status).json({ error: message });
      }
    });

    return router;
  },
};
