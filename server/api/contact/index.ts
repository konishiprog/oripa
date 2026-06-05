/**
 * 'api/contact': Project API for Contact Inquiries
 */
export {};

import express, { Request, Response, Router } from "express";
const messages = require("../../constants/messages.json");

let runtime: any;

module.exports = {
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  app: function () {
    const router: Router = express.Router();

    /**
     * Send a contact inquiry to all admins
     * POST /api/contact
     * Headers: x-user-id
     * Body: { title, content }
     */
    router.post("/", async (req: Request, res: Response) => {
      const userId = req.headers["x-user-id"] as string;
      const { title, content } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ error: messages.errors.USER_NOT_FOUND });
      }

      if (!title || !content) {
        return res
          .status(400)
          .json({ error: messages.errors.MISSING_REQUIRED_FIELDS });
      }

      try {
        const user = await runtime.user.getById(userId);
        if (!user) {
          return res
            .status(404)
            .json({ error: messages.errors.USER_NOT_FOUND });
        }

        const allAdmins = await runtime.admin.getAll();
        const adminEmails = allAdmins.map((admin: any) => admin.email);
        if (adminEmails.length === 0) {
          return res
            .status(500)
            .json({ error: messages.errors.SERVER_ERROR });
        }

        await runtime.email.sendContactEmail(
          adminEmails,
          user.nickname || user.name,
          user.email,
          title,
          content,
        );

        return res
          .status(200)
          .json({ message: messages.success.CONTACT_EMAIL_SENT });
      } catch (error) {
        console.error("Failed to send contact email:", error);
        return res
          .status(500)
          .json({ error: messages.errors.SERVER_ERROR });
      }
    });

    return router;
  },
};
