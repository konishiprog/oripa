"use strict";

export {};

const messages = require("../../constants/messages.json");
const gachaRuntime = require("../gacha");

let db: any;

const toPlain = (card: any) => card?.get({ plain: true }) || null;

/**
 * Initialize card module with database connection
 * @param {*} _db - Sequelize database instance
 */
async function init(_db: any) {
  db = _db;
}

/**
 * Create a new card for a gacha
 * @param {object} payload - Card attributes with optional image files
 * @returns {Promise<any>} - Created card object
 */
async function create(payload: {
  gachaId: string;
  name: string;
  cardType: string;
  exchangeType: string;
  exchangePoints?: number | null;
  imageFrontFile?: any;
  imageBackFile?: any;
}) {
  const gacha = await db.Gacha.findByPk(payload.gachaId);
  if (!gacha) {
    throw new Error(messages.errors.GACHA_NOT_FOUND);
  }

  let imageFrontBase64 = "";
  if (payload.imageFrontFile) {
    imageFrontBase64 = `data:${payload.imageFrontFile.mimetype};base64,${payload.imageFrontFile.buffer.toString("base64")}`;
  }

  let imageBackBase64 = "";
  if (payload.imageBackFile) {
    imageBackBase64 = `data:${payload.imageBackFile.mimetype};base64,${payload.imageBackFile.buffer.toString("base64")}`;
  }

  const card = await db.Card.create({
    gachaId: payload.gachaId,
    name: payload.name,
    cardType: payload.cardType,
    exchangeType: payload.exchangeType,
    exchangePoints:
      payload.exchangeType === "BOTH" ? (payload.exchangePoints ?? null) : null,
    imageFront: imageFrontBase64,
    imageBack: imageBackBase64,
    isDrawn: false,
  });

  const plainCard = toPlain(card);
  gachaRuntime.addCardToCache(payload.gachaId, plainCard);
  return plainCard;
}

/**
 * Get all cards for a specific gacha
 * @param {string} gachaId - Gacha id
 * @returns {Promise<any[]>} - Array of card objects
 */
async function getByGachaId(gachaId: string) {
  const cards = await db.Card.findAll({
    where: { gachaId },
    order: [["id", "ASC"]],
  });
  return cards.map(toPlain);
}

/**
 * Update an existing card. Images are optional — kept if not provided.
 * @param {string} id - Card id to update
 * @param {object} payload - Card attributes with optional image files
 * @returns {Promise<any>} - Updated card object
 */
async function update(
  id: string,
  payload: {
    name: string;
    cardType: string;
    exchangeType: string;
    exchangePoints?: number | null;
    imageFrontFile?: any;
    imageBackFile?: any;
  },
) {
  const card = await db.Card.findByPk(id);
  if (!card) {
    throw new Error(messages.errors.CARD_NOT_FOUND);
  }

  let imageFrontBase64 = card.imageFront;
  if (payload.imageFrontFile) {
    imageFrontBase64 = `data:${payload.imageFrontFile.mimetype};base64,${payload.imageFrontFile.buffer.toString("base64")}`;
  }

  let imageBackBase64 = card.imageBack;
  if (payload.imageBackFile) {
    imageBackBase64 = `data:${payload.imageBackFile.mimetype};base64,${payload.imageBackFile.buffer.toString("base64")}`;
  }

  await card.update({
    name: payload.name,
    cardType: payload.cardType,
    exchangeType: payload.exchangeType,
    exchangePoints:
      payload.exchangeType === "BOTH" ? (payload.exchangePoints ?? null) : null,
    imageFront: imageFrontBase64,
    imageBack: imageBackBase64,
  });

  const plainCard = toPlain(card);
  gachaRuntime.updateCardInCache(plainCard.gachaId, plainCard);
  return plainCard;
}

/**
 * Delete an existing card by id
 * @param {string} id - Card id to delete
 */
async function deleteById(id: string) {
  const card = await db.Card.findByPk(id);
  if (!card) {
    throw new Error(messages.errors.CARD_NOT_FOUND);
  }
  const gachaId = card.gachaId;
  await card.destroy();
  gachaRuntime.removeCardFromCache(gachaId, id);
}

module.exports = {
  init,
  create,
  getByGachaId,
  update,
  deleteById,
};
