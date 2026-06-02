/**
 * 'api/effect': Project API for Effect Management
 */
export {};

import express, { Request, Response, Router } from "express";

let runtime: any;

const validateEffectPayload = (req: Request, res: Response): boolean => {
  const { name, url } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "Name is required" });
    return false;
  }

  if (!url || typeof url !== "string" || url.trim() === "") {
    res.status(400).json({ error: "URL is required" });
    return false;
  }

  return true;
};

module.exports = {
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  app: function () {
    const router: Router = express.Router();

    router.get("/", async (_req: Request, res: Response) => {
      try {
        const effects = await runtime.effect.getAll();
        res.status(200).json({ message: "Success", data: effects });
      } catch (error: any) {
        console.error("Failed to fetch effects:", error);
        res.status(500).json({ error: "Failed to fetch effects" });
      }
    });

    router.post("/", async (req: Request, res: Response) => {
      if (!validateEffectPayload(req, res)) return;

      try {
        const { name, url } = req.body;
        const effect = await runtime.effect.create(name.trim(), url.trim());
        res.status(201).json({ message: "Effect created", data: effect });
      } catch (error: any) {
        console.error("Failed to create effect:", error);
        if (error.message.includes("already exists")) {
          return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to create effect" });
      }
    });

    router.put("/:id", async (req: Request, res: Response) => {
      if (!validateEffectPayload(req, res)) return;

      try {
        const { id } = req.params;
        const { name, url } = req.body;
        const effect = await runtime.effect.update(
          id,
          name.trim(),
          url.trim(),
        );
        res.status(200).json({ message: "Effect updated", data: effect });
      } catch (error: any) {
        console.error("Failed to update effect:", error);
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("already exists")) {
          return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to update effect" });
      }
    });

    router.delete("/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await runtime.effect.deleteById(id);
        res.status(200).json({ message: "Effect deleted" });
      } catch (error: any) {
        console.error("Failed to delete effect:", error);
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to delete effect" });
      }
    });

    return router;
  },
};
