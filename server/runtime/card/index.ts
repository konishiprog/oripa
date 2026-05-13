"use strict";

export {};

const messages = require("../../constants/messages.json");

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
 * Get the next unique card id across all gachas
 * @returns {Promise<number>} - Next available card id
 */
async function getNextCardId(): Promise<number> {
  const maxCard = await db.Card.findOne({
    order: [["id", "DESC"]],
  });
  return maxCard ? maxCard.id + 1 : 1;
}

/**
 * Create a new card for a gacha
 * @param {object} payload - Card attributes with optional image files
 * @returns {Promise<any>} - Created card object
 */
async function create(payload: {
  gachaId: number;
  name: string;
  cardType: string;
  exchangeType: string;
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

  const id = await getNextCardId();

  const card = await db.Card.create({
    id,
    gachaId: payload.gachaId,
    name: payload.name,
    cardType: payload.cardType,
    exchangeType: payload.exchangeType,
    imageFront: imageFrontBase64,
    imageBack: imageBackBase64,
    isDrawn: false,
  });

  return toPlain(card);
}

/**
 * Get all cards for a specific gacha
 * @param {number} gachaId - Gacha id
 * @returns {Promise<any[]>} - Array of card objects
 */
async function getByGachaId(gachaId: number) {
  const cards = await db.Card.findAll({
    where: { gachaId },
    order: [["id", "ASC"]],
  });
  return cards.map(toPlain);
}

module.exports = {
  init,
  create,
  getByGachaId,
};
