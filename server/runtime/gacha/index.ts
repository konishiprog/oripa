"use strict";

export {};

const messages = require("../../constants/messages.json");

let db: any;
let gachaCache: Map<number, any> = new Map();

const toPlain = (gacha: any) => gacha?.get({ plain: true }) || null;

/**
 * Initialize gacha module with database connection
 * @param {*} _db - Sequelize database instance
 */
async function init(_db: any) {
  db = _db;
  await refreshCache();
}

/**
 * Refresh gacha cache from database
 */
async function refreshCache() {
  const gachas = await db.Gacha.findAll({
    include: [{ model: db.Card, as: "cards" }],
  });
  gachaCache.clear();
  gachas.forEach((gacha: any) => {
    const plainGacha = toPlain(gacha);
    gachaCache.set(plainGacha.id, plainGacha);
  });
}

/**
 * Create a new gacha
 * @param {object} payload - Gacha attributes with optional file
 * @returns {Promise<any>} - Created gacha object
 */
async function create(payload: {
  name: string;
  cost: number;
  publishStart: Date | string;
  publishEnd: Date | string;
  isPublic: boolean;
  headerImageFile?: any;
}) {
  if (
    Array.from(gachaCache.values()).some(
      (gacha: any) => gacha.name === payload.name,
    )
  ) {
    throw new Error(messages.errors.GACHA_NAME_EXISTS);
  }

  let headerImageBase64 = "";
  if (payload.headerImageFile) {
    headerImageBase64 = `data:${payload.headerImageFile.mimetype};base64,${payload.headerImageFile.buffer.toString("base64")}`;
  }

  const gacha = await db.Gacha.create({
    name: payload.name,
    headerImage: headerImageBase64,
    cost: payload.cost,
    publishStart: payload.publishStart,
    publishEnd: payload.publishEnd,
    isPublic: payload.isPublic,
  });
  const plainGacha = { ...toPlain(gacha), cards: [] };
  gachaCache.set(plainGacha.id, plainGacha);
  return { ...plainGacha, cardsCount: 0 };
}

/**
 * Get all gachas from cache with cards count
 * @returns {Promise<any[]>} - Array of gacha objects
 */
async function getAll() {
  return Array.from(gachaCache.values()).map((gacha: any) => ({
    ...gacha,
    cardsCount: gacha.cards?.length ?? 0,
  }));
}

/**
 * Update an existing gacha
 * @param {number} id - Gacha id to update
 * @param {object} payload - Gacha attributes with optional new image file
 * @returns {Promise<any>} - Updated gacha object
 */
async function update(
  id: number,
  payload: {
    name: string;
    cost: number;
    publishStart: Date | string;
    publishEnd: Date | string;
    isPublic: boolean;
    headerImageFile?: any;
  },
) {
  const gacha = await db.Gacha.findByPk(id);
  if (!gacha) {
    throw new Error(messages.errors.GACHA_NOT_FOUND);
  }

  if (
    Array.from(gachaCache.values()).some(
      (cached: any) => cached.name === payload.name && cached.id !== id,
    )
  ) {
    throw new Error(messages.errors.GACHA_NAME_EXISTS);
  }

  let headerImageBase64 = gacha.headerImage;
  if (payload.headerImageFile) {
    headerImageBase64 = `data:${payload.headerImageFile.mimetype};base64,${payload.headerImageFile.buffer.toString("base64")}`;
  }

  await gacha.update({
    name: payload.name,
    headerImage: headerImageBase64,
    cost: payload.cost,
    publishStart: payload.publishStart,
    publishEnd: payload.publishEnd,
    isPublic: payload.isPublic,
  });

  const cached = gachaCache.get(id);
  const plainGacha = { ...toPlain(gacha), cards: cached?.cards ?? [] };
  gachaCache.set(id, plainGacha);
  return { ...plainGacha, cardsCount: plainGacha.cards.length };
}

/**
 * Delete an existing gacha by id
 * @param {number} id - Gacha id to delete
 */
async function deleteById(id: number) {
  const gacha = await db.Gacha.findByPk(id);
  if (!gacha) {
    throw new Error(messages.errors.GACHA_NOT_FOUND);
  }
  await db.Card.destroy({ where: { gachaId: id } });
  await gacha.destroy();
  gachaCache.delete(id);
}

/**
 * Append a newly created card into the gacha cache so cardsCount stays current
 * @param {number} gachaId - Target gacha id
 * @param {*} card - Plain card object
 */
function addCardToCache(gachaId: number, card: any) {
  const cached = gachaCache.get(gachaId);
  if (!cached) return;
  cached.cards = [...(cached.cards ?? []), card];
  gachaCache.set(gachaId, cached);
}

/**
 * Replace an existing card inside the gacha cache so subsequent reads
 * return the updated card values without reloading from the database.
 * @param {number} gachaId - Target gacha id
 * @param {*} card - Plain card object with updated values
 */
function updateCardInCache(gachaId: number, card: any) {
  const cached = gachaCache.get(gachaId);
  if (!cached) return;
  cached.cards = (cached.cards ?? []).map((cardInCache: any) =>
    cardInCache.id === card.id ? card : cardInCache,
  );
  gachaCache.set(gachaId, cached);
}

/**
 * Remove a card from the gacha cache so cardsCount stays current
 * @param {number} gachaId - Target gacha id
 * @param {number} cardId - Card id to remove
 */
function removeCardFromCache(gachaId: number, cardId: number) {
  const cached = gachaCache.get(gachaId);
  if (!cached) return;
  cached.cards = (cached.cards ?? []).filter(
    (cardInCache: any) => cardInCache.id !== cardId,
  );
  gachaCache.set(gachaId, cached);
}

module.exports = {
  init,
  create,
  getAll,
  update,
  deleteById,
  addCardToCache,
  updateCardInCache,
  removeCardFromCache,
};
