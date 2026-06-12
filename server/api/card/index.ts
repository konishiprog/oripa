/**
 * 'api/card': Project API for Card Management
 */
export {};

import express, { Request, Response, Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const messages = require("../../constants/messages.json");
const { CARD_STATUS, EXCHANGE_TYPE } = require("../../constants/card");

let runtime: any;
let gacha: any;
let user: any;
let email: any;
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

const escapeCsvField = (field: any): string => {
  const fieldStr = String(field || "");
  if (
    fieldStr.includes(",") ||
    fieldStr.includes('"') ||
    fieldStr.includes("\n")
  ) {
    return `"${fieldStr.replace(/"/g, '""')}"`;
  }
  return fieldStr;
};

const generatePendingShippingCSV = async (
  pendingCards: any[],
): Promise<string> => {
  const csvRows: string[] = [];

  const templatePath = path.join(
    __dirname,
    "../../runtime/trackingNumber_Template.csv",
  );

  try {
    if (fs.existsSync(templatePath)) {
      const templateBuffer = fs.readFileSync(templatePath);
      let templateContent: string;
      try {
        const iconv = require("iconv-lite");
        templateContent = iconv.decode(templateBuffer, "shiftjis");
      } catch {
        templateContent = templateBuffer.toString("utf-8");
        if (templateContent.charCodeAt(0) === 0xfeff) {
          templateContent = templateContent.slice(1);
        }
      }
      const lines = templateContent.split("\n");
      if (lines.length > 0 && lines[0].trim()) {
        csvRows.push(lines[0].trim());
      }
    } else {
      console.warn("Template file not found at:", templatePath);
    }
  } catch (error) {
    console.warn("Failed to read template file:", error);
  }

  for (const card of pendingCards) {
    let lastName = "";
    let firstName = "";
    let postalCode = "";
    let prefecture = "";
    let address = "";
    let buildingName = "";
    let phone = "";

    if (card.userId) {
      const cardOwner = await user?.getById(card.userId);
      if (cardOwner) {
        lastName = cardOwner.lastName || "";
        firstName = cardOwner.firstName || "";
        postalCode = cardOwner.postalCode || "";
        prefecture = cardOwner.prefecture || "";
        address = cardOwner.address || "";
        buildingName = cardOwner.buildingName || "";
        phone = cardOwner.phone || "";
      }
    }

    const drawnDate = card.drawnDate
      ? new Date(card.drawnDate).toISOString().split("T")[0]
      : "";

    const row = [
      escapeCsvField(""),
      escapeCsvField(postalCode),
      escapeCsvField(prefecture),
      escapeCsvField(address),
      escapeCsvField(buildingName),
      escapeCsvField(phone),
      escapeCsvField(lastName),
      escapeCsvField(firstName),
      escapeCsvField(card.userId || ""),
      escapeCsvField(card.name || ""),
      escapeCsvField(card.exchangeCoins || ""),
      escapeCsvField(drawnDate),
    ];
    csvRows.push(row.join(","));
  }

  return csvRows.join("\n");
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
     * Complete shipping for multiple cards (store tracking number + notify users)
     * PATCH /api/card/ship-complete
     */
    router.patch("/ship-complete", async (req: Request, res: Response) => {
      const { shipments } = req.body;
      if (!Array.isArray(shipments) || shipments.length === 0) {
        return res.status(400).json({ error: messages.errors.CARD_NOT_FOUND });
      }

      const hasInvalid = shipments.some(
        (shipment: any) =>
          !shipment ||
          typeof shipment.cardId !== "string" ||
          shipment.cardId.trim() === "" ||
          typeof shipment.trackingNumber !== "string" ||
          shipment.trackingNumber.trim() === "",
      );
      if (hasInvalid) {
        return res
          .status(400)
          .json({ error: messages.errors.TRACKING_NUMBER_REQUIRED });
      }

      try {
        const allCards = await runtime.card.getAll();
        const affectedGachaIds = new Set<string>();
        const groupsByUser = new Map<
          string,
          { userId: string; trackingNumber: string; cardNames: string[] }
        >();

        for (const shipment of shipments) {
          const card = allCards.find(
            (foundCard: any) => foundCard.id === shipment.cardId,
          );
          if (!card) {
            return res
              .status(404)
              .json({ error: messages.errors.CARD_NOT_FOUND });
          }

          await runtime.card.update(shipment.cardId, {
            isDrawn: CARD_STATUS.SHIPPED,
            trackingNumber: shipment.trackingNumber,
          });
          affectedGachaIds.add(card.gachaId);

          if (card.userId) {
            const existingGroup = groupsByUser.get(card.userId);
            if (existingGroup) {
              existingGroup.cardNames.push(card.name);
            } else {
              groupsByUser.set(card.userId, {
                userId: card.userId,
                trackingNumber: shipment.trackingNumber,
                cardNames: [card.name],
              });
            }
          }
        }

        for (const gachaId of affectedGachaIds) {
          await gacha.refreshGachaCards(gachaId);
        }

        for (const group of groupsByUser.values()) {
          const cardOwner = await user?.getById(group.userId);
          if (cardOwner?.email) {
            await email.sendShippingCompleteEmail(
              cardOwner.email,
              `${cardOwner.lastName || ""} ${cardOwner.firstName || ""}`.trim(),
              group.cardNames.join("、"),
              group.trackingNumber,
            );
          }
        }

        return res.status(200).json({
          message: messages.success.CARDS_SHIPPED,
        });
      } catch (error: any) {
        const { status, message } = handleError(
          error,
          "Card shipping completion",
        );
        return res.status(status).json({ error: message });
      }
    });

    /**
     * Get pending shipping CSV
     * GET /api/card/pending-shipping-csv
     */
    router.get(
      "/pending-shipping-csv",
      async (_req: Request, res: Response) => {
        try {
          const allCards = await runtime.card.getAll();
          const pendingCards = allCards.filter(
            (card: any) => card.isDrawn === "発送待ち",
          );

          const csvData = await generatePendingShippingCSV(pendingCards);
          const bom = "﻿";
          const csvDataWithBom = bom + csvData;
          const csvBase64 = Buffer.from(csvDataWithBom, "utf-8").toString(
            "base64",
          );

          return res.status(200).json({
            message: "Pending shipping CSV generated",
            csvData: csvBase64,
          });
        } catch (error: any) {
          const { status, message } = handleError(
            error,
            "Pending shipping CSV generation",
          );
          return res.status(status).json({ error: message });
        }
      },
    );

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
