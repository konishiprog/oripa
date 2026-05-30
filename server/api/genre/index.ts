/**
 * 'api/genre': Project API for Genre Management
 */
export {};

import express, { Request, Response, Router } from "express";

let runtime: any;

const validateGenrePayload = (req: Request, res: Response): boolean => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "Name is required" });
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
        const genres = await runtime.genre.getAll();
        res.status(200).json({ message: "Success", data: genres });
      } catch (error: any) {
        console.error("Failed to fetch genres:", error);
        res.status(500).json({ error: "Failed to fetch genres" });
      }
    });

    router.post("/", async (req: Request, res: Response) => {
      if (!validateGenrePayload(req, res)) return;

      try {
        const { name } = req.body;
        const genre = await runtime.genre.create(name.trim());
        res.status(201).json({ message: "Genre created", data: genre });
      } catch (error: any) {
        console.error("Failed to create genre:", error);
        if (error.message.includes("already exists")) {
          return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to create genre" });
      }
    });

    router.put("/:id", async (req: Request, res: Response) => {
      if (!validateGenrePayload(req, res)) return;

      try {
        const { id } = req.params;
        const { name } = req.body;
        const genre = await runtime.genre.update(id, name.trim());
        res.status(200).json({ message: "Genre updated", data: genre });
      } catch (error: any) {
        console.error("Failed to update genre:", error);
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("already exists")) {
          return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to update genre" });
      }
    });

    router.delete("/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await runtime.genre.deleteById(id);
        res.status(200).json({ message: "Genre deleted" });
      } catch (error: any) {
        console.error("Failed to delete genre:", error);
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to delete genre" });
      }
    });

    return router;
  },
};
