/**
 * 'api/card': Project API for Card Management
 */
export {};

import express, { Request, Response, Router } from "express";
import multer from "multer";

const messages = require("../../constants/messages.json");

let runtime: any;
const upload = multer({ storage: multer.memoryStorage() });

const validateCardPayload = (req: Request, res: Response): boolean => {
  const { gachaId, name, cardType, exchangeType } = req.body;
  const files = (req as any).files;
  const imageFrontFile = files?.imageFront?.[0];
  const imageBackFile = files?.imageBack?.[0];

  if (
    !gachaId ||
    !name ||
    !cardType ||
    !exchangeType ||
    !imageFrontFile ||
    !imageBackFile
  ) {
    res.status(400).json({ error: messages.errors.CARD_FIELDS_REQUIRED });
    return false;
  }

  if (
    !imageFrontFile.mimetype.startsWith("image/") ||
    !imageBackFile.mimetype.startsWith("image/")
  ) {
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
  if (error.message === messages.errors.GACHA_NOT_FOUND) {
    return { status: 404, message: messages.errors.GACHA_NOT_FOUND };
  }
  return { status: 500, message: error.message };
};

module.exports = {
  /**
   * Initialize card API with runtime
   * @param {*} _runtime - Runtime instance containing card module
   */
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  /**
   * Create and return Express router with card endpoints
   * @returns {Router} Express router with card routes
   */
  app: function () {
    const router: Router = express.Router();

    /**
     * Create a new card for a gacha
     * POST /api/card
     */
    router.post(
      "/",
      upload.fields([
        { name: "imageFront", maxCount: 1 },
        { name: "imageBack", maxCount: 1 },
      ]),
      async (req: Request, res: Response) => {
        if (!validateCardPayload(req, res)) return;

        try {
          const { gachaId, name, cardType, exchangeType } = req.body;
          const files = (req as any).files;
          const imageFrontFile = files.imageFront[0];
          const imageBackFile = files.imageBack[0];

          const card = await runtime.card.create({
            gachaId: Number(gachaId),
            name,
            cardType,
            exchangeType,
            imageFrontFile,
            imageBackFile,
          });
          return res.status(201).json({
            message: messages.success.CARD_CREATED,
            data: card,
          });
        } catch (error: any) {
          const { status, message } = handleError(error, "Card creation");
          return res.status(status).json({ error: message });
        }
      },
    );

    /**
     * Get all cards for a specific gacha
     * GET /api/card/gacha/:gachaId
     */
    router.get("/gacha/:gachaId", async (req: Request, res: Response) => {
      const gachaId = Number(req.params.gachaId);
      if (!Number.isInteger(gachaId) || gachaId <= 0) {
        return res.status(400).json({ error: messages.errors.GACHA_NOT_FOUND });
      }

      try {
        const cards = await runtime.card.getByGachaId(gachaId);
        return res.status(200).json({
          message: messages.success.CARDS_RETRIEVED,
          data: cards,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Cards retrieval");
        return res.status(status).json({ error: message });
      }
    });

    return router;
  },
};
