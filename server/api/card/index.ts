/**
 * 'api/card': Project API for Card Management
 */
export {};

import express, { Request, Response, Router } from "express";
import multer from "multer";

const messages = require("../../constants/messages.json");
const { CARD_STATUS, EXCHANGE_TYPE } = require("../../constants/card");

let runtime: any;
let gacha: any;
let user: any;
let email: any;
let admin: any;
const upload = multer({ storage: multer.memoryStorage() });

const validateCardPayload = (req: Request, res: Response): boolean => {
  const { gachaId, name, cardType, exchangeType, exchangeCoins } = req.body;
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

  if (
    exchangeType === EXCHANGE_TYPE.BOTH ||
    exchangeType === EXCHANGE_TYPE.COIN_ONLY
  ) {
    const coins = Number(exchangeCoins);
    if (!Number.isInteger(coins) || coins <= 0) {
      res.status(400).json({ error: messages.errors.CARD_FIELDS_REQUIRED });
      return false;
    }
  }

  return true;
};

const validateCardUpdatePayload = (req: Request, res: Response): boolean => {
  const { name, cardType, exchangeType, exchangeCoins } = req.body;
  const files = (req as any).files;
  const imageFrontFile = files?.imageFront?.[0];
  const imageBackFile = files?.imageBack?.[0];

  if (!name || !cardType || !exchangeType) {
    res
      .status(400)
      .json({ error: messages.errors.CARD_UPDATE_FIELDS_REQUIRED });
    return false;
  }

  if (imageFrontFile && !imageFrontFile.mimetype.startsWith("image/")) {
    res.status(400).json({ error: messages.errors.INVALID_IMAGE_FORMAT });
    return false;
  }
  if (imageBackFile && !imageBackFile.mimetype.startsWith("image/")) {
    res.status(400).json({ error: messages.errors.INVALID_IMAGE_FORMAT });
    return false;
  }

  if (
    exchangeType === EXCHANGE_TYPE.BOTH ||
    exchangeType === EXCHANGE_TYPE.COIN_ONLY
  ) {
    const coins = Number(exchangeCoins);
    if (!Number.isInteger(coins) || coins <= 0) {
      res
        .status(400)
        .json({ error: messages.errors.CARD_UPDATE_FIELDS_REQUIRED });
      return false;
    }
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
  if (error.message === messages.errors.CARD_NOT_FOUND) {
    return { status: 404, message: messages.errors.CARD_NOT_FOUND };
  }
  if (error.message === messages.errors.LAST_CARD_ALREADY_EXISTS) {
    return { status: 400, message: messages.errors.LAST_CARD_ALREADY_EXISTS };
  }
  return { status: 500, message: error.message };
};

module.exports = {
  /**
   * Initialize card API with runtime
   * @param {*} _runtime - Runtime instance containing card and gacha modules
   */
  init: function (_runtime: any) {
    runtime = _runtime;
    gacha = _runtime.gacha;
    user = _runtime.user;
    email = _runtime.email;
    admin = _runtime.admin;
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
          const {
            gachaId,
            name,
            cardType,
            exchangeType,
            exchangeCoins,
            effectId,
          } = req.body;
          const files = (req as any).files;
          const imageFrontFile = files.imageFront[0];
          const imageBackFile = files.imageBack[0];

          const card = await runtime.card.create({
            gachaId,
            name,
            cardType,
            exchangeType,
            exchangeCoins:
              exchangeType === EXCHANGE_TYPE.BOTH ||
              exchangeType === EXCHANGE_TYPE.COIN_ONLY
                ? Number(exchangeCoins)
                : null,
            effectId: effectId || null,
            imageFrontFile,
            imageBackFile,
          });
          await gacha.refreshGachaCards(gachaId);
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
     * Update an existing card
     * PUT /api/card/:id
     */
    router.put(
      "/:id",
      upload.fields([
        { name: "imageFront", maxCount: 1 },
        { name: "imageBack", maxCount: 1 },
      ]),
      async (req: Request, res: Response) => {
        if (!validateCardUpdatePayload(req, res)) return;

        const id = req.params.id as string;
        if (!id || typeof id !== "string" || id.trim() === "") {
          return res
            .status(400)
            .json({ error: messages.errors.CARD_NOT_FOUND });
        }

        try {
          const { name, cardType, exchangeType, exchangeCoins, effectId } =
            req.body;
          const files = (req as any).files;
          const imageFrontFile = files?.imageFront?.[0];
          const imageBackFile = files?.imageBack?.[0];

          const card = await runtime.card.update(id, {
            name,
            cardType,
            exchangeType,
            exchangeCoins:
              exchangeType === EXCHANGE_TYPE.BOTH ||
              exchangeType === EXCHANGE_TYPE.COIN_ONLY
                ? Number(exchangeCoins)
                : null,
            effectId: effectId || null,
            imageFrontFile,
            imageBackFile,
          });
          await gacha.refreshGachaCards(card.gachaId);
          return res.status(200).json({
            message: messages.success.CARD_UPDATED,
            data: card,
          });
        } catch (error: any) {
          const { status, message } = handleError(error, "Card update");
          return res.status(status).json({ error: message });
        }
      },
    );

    /**
     * Delete an existing card
     * DELETE /api/card/:id
     */
    router.delete("/:id", async (req: Request, res: Response) => {
      const id = req.params.id as string;
      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({ error: messages.errors.CARD_NOT_FOUND });
      }

      try {
        const gachaId = await runtime.card.deleteById(id);
        await gacha.refreshGachaCards(gachaId);
        return res.status(200).json({
          message: messages.success.CARD_DELETED,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Card deletion");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Exchange a card for coins (mark as exchanged)
     * PATCH /api/card/:id/exchange
     */
    router.patch("/:id/exchange", async (req: Request, res: Response) => {
      const id = req.params.id as string;
      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({ error: messages.errors.CARD_NOT_FOUND });
      }

      try {
        await runtime.card.update(id, { isDrawn: CARD_STATUS.REFUNDED });
        const allCards = await runtime.card.getAll();
        const card = allCards.find((foundCard: any) => foundCard.id === id);
        if (card) {
          await gacha.refreshGachaCards(card.gachaId);
        }
        return res
          .status(200)
          .json({ message: messages.success.CARD_EXCHANGED });
      } catch (error: any) {
        const { status, message } = handleError(error, "Card exchange");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Update card status
     * PATCH /api/card/:id/status
     */
    router.patch("/:id/status", async (req: Request, res: Response) => {
      const id = req.params.id as string;
      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({ error: messages.errors.CARD_NOT_FOUND });
      }

      const { isDrawn } = req.body;
      if (!isDrawn || typeof isDrawn !== "string") {
        return res.status(400).json({ error: messages.errors.CARD_NOT_FOUND });
      }

      try {
        const allCards = await runtime.card.getAll();
        const card = allCards.find((foundCard: any) => foundCard.id === id);

        if (!card) {
          return res
            .status(404)
            .json({ error: messages.errors.CARD_NOT_FOUND });
        }

        const cardOwner = await user?.getById(card.userId);

        await runtime.card.update(id, { isDrawn });

        if (card) {
          await gacha.refreshGachaCards(card.gachaId);
        }
        return res.status(200).json({
          message: messages.success.CARD_UPDATED,
          data: card,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "Card status update");
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Get all cards
     * GET /api/card
     */
    router.get("/", async (_req: Request, res: Response) => {
      try {
        const cards = await runtime.card.getAll();
        return res.status(200).json({
          message: messages.success.CARDS_RETRIEVED,
          data: cards,
        });
      } catch (error: any) {
        const { status, message } = handleError(error, "All cards retrieval");
        return res.status(status).json({ error: message });
      }
    });

    return router;
  },
};
