"use strict";

export {};

const messages = require("../../constants/messages.json");
const userRuntime = require("../user");

let db: any;
let gachaCache: Map<string, any> = new Map();

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
 * Get all gachas from cache with cards count and remaining count
 * @returns {Promise<any[]>} - Array of gacha objects sorted by publishStart descending
 */
async function getAll() {
  return Array.from(gachaCache.values())
    .sort((gachaA: any, gachaB: any) => {
      const dateA = new Date(gachaA.publishStart).getTime();
      const dateB = new Date(gachaB.publishStart).getTime();
      return dateB - dateA;
    })
    .map((gacha: any) => {
      const cards = gacha.cards ?? [];
      const notDrawnCards = cards.filter((card: any) => !card.isDrawn);
      return {
        ...gacha,
        cardsCount: notDrawnCards.length,
        remainingCount: notDrawnCards.length,
      };
    });
}

/**
 * Get a single gacha by id with cards and remaining count
 * @param {number} id - Gacha id
 * @returns {any | null} - Gacha object or null
 */
function getById(id: string) {
  const gacha = gachaCache.get(id);
  if (!gacha) return null;
  const cards = gacha.cards ?? [];
  const remainingCount = cards.filter((card: any) => !card.isDrawn).length;
  return {
    ...gacha,
    cardsCount: cards.length,
    remainingCount,
  };
}

/**
 * Draw cards from a gacha for a user.
 * - Picks min(drawCount, remaining) random not-yet-drawn cards.
 * - Validates user coin balance against cost * actualDrawCount.
 * - Marks picked cards as drawn and deducts coin.
 * @param {object} payload - { gachaId, userId, drawCount }
 * @returns {Promise<{drawnCards: any[], remainingCount: number, userCoin: number, actualDrawCount: number}>}
 */
async function draw(payload: {
  gachaId: string;
  userId: string;
  drawCount: number;
}) {
  if (!Number.isInteger(payload.drawCount) || payload.drawCount <= 0) {
    throw new Error(messages.errors.DRAW_COUNT_INVALID);
  }

  const user = userRuntime.getById(payload.userId);
  if (!user) {
    throw new Error(messages.errors.USER_NOT_FOUND);
  }

  const gacha = gachaCache.get(payload.gachaId);
  if (!gacha) {
    throw new Error(messages.errors.GACHA_NOT_FOUND);
  }

  const availableCards = (gacha.cards ?? []).filter(
    (card: any) => !card.isDrawn,
  );
  if (availableCards.length === 0) {
    throw new Error(messages.errors.GACHA_OUT_OF_STOCK);
  }

  const actualDrawCount = Math.min(payload.drawCount, availableCards.length);
  const totalCost = gacha.cost * actualDrawCount;

  if (user.coin < totalCost) {
    throw new Error(messages.errors.INSUFFICIENT_COIN);
  }

  const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
  const drawnCards = shuffled.slice(0, actualDrawCount);
  const drawnIds = drawnCards.map((card: any) => card.id);

  await db.Card.update(
    { isDrawn: true, userId: payload.userId },
    { where: { id: drawnIds } },
  );

  gacha.cards = (gacha.cards ?? []).map((card: any) =>
    drawnIds.includes(card.id)
      ? { ...card, isDrawn: true, userId: payload.userId }
      : card,
  );
  gachaCache.set(payload.gachaId, gacha);

  const updatedUser = await userRuntime.updateCoin(
    payload.userId,
    user.coin - totalCost,
  );

  const remainingCount = gacha.cards.filter(
    (card: any) => !card.isDrawn,
  ).length;

  return {
    drawnCards: drawnCards.map((card: any) => ({ ...card, isDrawn: true, userId: payload.userId })),
    remainingCount,
    userCoin: updatedUser.coin,
    actualDrawCount,
  };
}

/**
 * Update an existing gacha
 * @param {number} id - Gacha id to update
 * @param {object} payload - Gacha attributes with optional new image file
 * @returns {Promise<any>} - Updated gacha object
 */
async function update(
  id: string,
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
async function deleteById(id: string) {
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
function addCardToCache(gachaId: string, card: any) {
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
function updateCardInCache(gachaId: string, card: any) {
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
function removeCardFromCache(gachaId: string, cardId: string) {
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
  getById,
  update,
  deleteById,
  draw,
  addCardToCache,
  updateCardInCache,
  removeCardFromCache,
};
