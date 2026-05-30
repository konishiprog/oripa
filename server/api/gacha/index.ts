/**
 * 'api/gacha': Project API for Gacha Management
 */
export {};

import express, { Request, Response, Router } from "express";
import multer, { Multer } from "multer";

const messages = require("../../constants/messages.json");

let runtime: any;
const upload = multer({ storage: multer.memoryStorage() });

const validateGachaPayload = (req: Request, res: Response): boolean => {
  const { name, cost, publishStart, publishEnd, isPublic } = req.body;
  const headerImageFile = (req as any).file;

  if (
    !name ||
    !headerImageFile ||
    cost === undefined ||
    cost === null ||
    !publishStart ||
    !publishEnd ||
    isPublic === undefined ||
    isPublic === null
  ) {
    res.status(400).json({ error: messages.errors.GACHA_FIELDS_REQUIRED });
    return false;
  }

  if (!headerImageFile.mimetype.startsWith("image/")) {
    res.status(400).json({ error: messages.errors.INVALID_IMAGE_FORMAT });
    return false;
  }

  return true;
};

const validateGachaUpdatePayload = (req: Request, res: Response): boolean => {
  const { name, cost, publishStart, publishEnd, isPublic } = req.body;
  const headerImageFile = (req as any).file;

  if (
    !name ||
    cost === undefined ||
    cost === null ||
    !publishStart ||
    !publishEnd ||
    isPublic === undefined ||
    isPublic === null
  ) {
    res
      .status(400)
      .json({ error: messages.errors.GACHA_UPDATE_FIELDS_REQUIRED });
    return false;
  }

  if (headerImageFile && !headerImageFile.mimetype.startsWith("image/")) {
    res.status(400).json({ error: messages.errors.INVALID_IMAGE_FORMAT });
    return false;
  }

  return true;
};

const handleError = (
  error: any,
  context: string,
): { status: number; message: string } => {
  console.error(`${context} error:`, error);
  if (error.message === messages.errors.GACHA_NAME_EXISTS) {
    return { status: 409, message: messages.errors.GACHA_NAME_EXISTS };
  }
  if (error.message === messages.errors.GACHA_NOT_FOUND) {
    return { status: 404, message: messages.errors.GACHA_NOT_FOUND };
  }
  if (error.message === messages.errors.USER_NOT_FOUND) {
    return { status: 404, message: messages.errors.USER_NOT_FOUND };
  }
  if (error.message === messages.errors.GACHA_OUT_OF_STOCK) {
    return { status: 409, message: messages.errors.GACHA_OUT_OF_STOCK };
  }
  if (error.message === messages.errors.INSUFFICIENT_COIN) {
    return { status: 402, message: messages.errors.INSUFFICIENT_COIN };
  }
  if (error.message === messages.errors.INSUFFICIENT_SPECIAL_POINT) {
    return { status: 402, message: messages.errors.INSUFFICIENT_SPECIAL_POINT };
  }
  if (error.message === messages.errors.GACHA_ALREADY_DRAWN) {
    return { status: 409, message: messages.errors.GACHA_ALREADY_DRAWN };
  }
  if (error.message === messages.errors.DRAW_COUNT_INVALID) {
    return { status: 400, message: messages.errors.DRAW_COUNT_INVALID };
  }
  return { status: 500, message: error.message };
};

module.exports = {
  /**
   * Initialize gacha API with runtime
   * @param {*} _runtime - Runtime instance containing gacha module
   */
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  /**
   * Create and return Express router with gacha endpoints
   * @returns {Router} Express router with gacha routes
   */
  app: function () {
    const router: Router = express.Router();

    /**
     * Create a new gacha with image upload
     * POST /api/gacha
     */
    router.post(
      "/",
      upload.single("headerImage"),
      async (req: Request, res: Response) => {
        if (!validateGachaPayload(req, res)) return;

        try {
          const {
            name,
            genreId,
            consumptionType,
            cost,
            oncePerUser,
            publishStart,
            publishEnd,
            isPublic,
          } = req.body;
          const headerImageFile = (req as any).file;

          const gacha = await runtime.gacha.create({
            name,
            genreId: genreId || null,
            consumptionType,
            cost,
            oncePerUser: oncePerUser === "true" || oncePerUser === true,
            publishStart,
            publishEnd,
            isPublic: isPublic === "true" || isPublic === true,
            headerImageFile,
          });
          return res.status(201).json({
            message: messages.success.GACHA_CREATED,
            data: gacha,
          });
        } catch (error: any) {
          const { status, message } = handleError(error, "Gacha creation");
          return res.status(status).json({ error: message });
        }
      },
    );

    /**
     * Update an existing gacha
     * PUT /api/gacha/:id
     */
    router.put(
      "/:id",
      upload.single("headerImage"),
      async (req: Request, res: Response) => {
        if (!validateGachaUpdatePayload(req, res)) return;

        const id = req.params.id as string;
        if (!id || typeof id !== "string" || id.trim() === "") {
          return res
            .status(400)
            .json({ error: messages.errors.GACHA_NOT_FOUND });
        }

        try {
          const {
            name,
            genreId,
            consumptionType,
            cost,
            oncePerUser,
            publishStart,
            publishEnd,
            isPublic,
          } = req.body;
          const headerImageFile = (req as any).file;

          const gacha = await runtime.gacha.update(id, {
            name,
            genreId: genreId !== undefined ? genreId || null : undefined,
            consumptionType,
            cost,
            oncePerUser: oncePerUser === "true" || oncePerUser === true,
            publishStart,
            publishEnd,
            isPublic: isPublic === "true" || isPublic === true,
            headerImageFile,
          });
          return res.status(200).json({
            message: messages.success.GACHA_UPDATED,
            data: gacha,
          });
        } catch (error: any) {
          const { status, message } = handleError(error, "Gacha update");
          return res.status(status).json({ error: message });
        }
      },
    );

    /**
     * Delete an existing gacha
     * DELETE /api/gacha/:id
     */
    router.delete("/:id", async (req: Request, res: Response) => {
      const id = req.params.id as string;
      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({ error: messages.errors.GACHA_NOT_FOUND });
      }

      try {
        await runtime.gacha.deleteById(id);
        return res.status(200).json({
          message: messages.success.GACHA_DELETED,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Gacha deletion");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Get all gachas
     * GET /api/gacha
     */
    router.get("/", async (req: Request, res: Response) => {
      try {
        const userId =
          typeof req.query.userId === "string" ? req.query.userId : undefined;
        const gachas = await runtime.gacha.getAll(userId);
        return res.status(200).json({
          message: messages.success.GACHAS_RETRIEVED,
          data: gachas,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Gacha retrieval");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Get a single gacha by id with remaining count
     * GET /api/gacha/:id
     */
    router.get("/:id", async (req: Request, res: Response) => {
      const id = req.params.id as string;
      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({ error: messages.errors.GACHA_NOT_FOUND });
      }

      try {
        const userId =
          typeof req.query.userId === "string" ? req.query.userId : undefined;
        const gacha = await runtime.gacha.getById(id, userId);
        if (!gacha) {
          return res
            .status(404)
            .json({ error: messages.errors.GACHA_NOT_FOUND });
        }
        return res.status(200).json({
          message: messages.success.GACHAS_RETRIEVED,
          data: gacha,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Gacha retrieval");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Draw cards from a gacha for a user
     * POST /api/gacha/:id/draw
     */
    router.post("/:id/draw", async (req: Request, res: Response) => {
      const gachaId = req.params.id as string;
      if (!gachaId || typeof gachaId !== "string" || gachaId.trim() === "") {
        return res.status(400).json({ error: messages.errors.GACHA_NOT_FOUND });
      }

      const { userId, drawCount } = req.body;
      if (
        !userId ||
        typeof userId !== "string" ||
        userId.trim() === "" ||
        !Number.isInteger(Number(drawCount)) ||
        Number(drawCount) <= 0
      ) {
        return res
          .status(400)
          .json({ error: messages.errors.DRAW_COUNT_INVALID });
      }

      try {
        const result = await runtime.gacha.draw({
          gachaId,
          userId,
          drawCount: Number(drawCount),
        });
        return res.status(200).json({
          message: messages.success.GACHA_DRAWN,
          data: result,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Gacha draw");
        return res.status(status).json({ error: message });
      }
    });

    return router;
  },
};
