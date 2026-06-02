"use strict";

export {};

const messages = require("../../constants/messages.json");
const { CARD_STATUS } = require("../../constants/card");
const { CONSUMPTION_TYPE } = require("../../constants/gacha");
const userRuntime = require("../user");
const cardRuntime = require("../card");
const genreRuntime = require("../genre");
const effectRuntime = require("../effect");

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
    include: [
      { model: db.Card, as: "cards" },
      { model: db.Genre, as: "genre" },
    ],
  });
  gachaCache.clear();
  gachas.forEach((gacha: any) => {
    const plainGacha = toPlain(gacha);
    const cards = (gacha.cards || []).map((card: any) => {
      const plainCard = toPlain(card);
      const effect = plainCard.effectId
        ? effectRuntime.getById(plainCard.effectId)
        : null;
      return {
        ...plainCard,
        effectName: effect?.name ?? null,
        effectUrl: effect?.url ?? null,
      };
    });
    const genreName = gacha.genre ? gacha.genre.name : null;
    gachaCache.set(plainGacha.id, { ...plainGacha, cards, genreName });
  });
}

/**
 * Create a new gacha
 * @param {object} payload - Gacha attributes with optional file
 * @returns {Promise<any>} - Created gacha object
 */
async function create(payload: {
  name: string;
  genreId?: string | null;
  consumptionType?: string;
  cost: number;
  oncePerUser?: boolean;
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
    genreId: payload.genreId ?? null,
    headerImage: headerImageBase64,
    consumptionType: payload.consumptionType ?? CONSUMPTION_TYPE.COIN,
    cost: payload.cost,
    oncePerUser: payload.oncePerUser ?? false,
    publishStart: payload.publishStart,
    publishEnd: payload.publishEnd,
    isPublic: payload.isPublic,
  });
  const genreName = payload.genreId
    ? (genreRuntime.getById(payload.genreId)?.name ?? null)
    : null;
  const plainGacha = { ...toPlain(gacha), cards: [], genreName };
  gachaCache.set(plainGacha.id, plainGacha);
  return { ...plainGacha, cardsCount: 0 };
}

/**
 * Get the set of gacha ids a user has already drawn (for once-per-user gachas)
 * @param {string} userId
 * @returns {Promise<Set<string>>}
 */
async function getDrawnGachaIds(userId: string): Promise<Set<string>> {
  const draws = await db.GachaUserDraw.findAll({ where: { userId } });
  return new Set(draws.map((draw: any) => draw.gachaId));
}

/**
 * Get all gachas from cache with cards count and remaining count
 * @param {string} [userId]
 * @returns {Promise<any[]>} - Array of gacha objects sorted by publishStart descending
 */
async function getAll(userId?: string) {
  const drawnGachaIds = userId
    ? await getDrawnGachaIds(userId)
    : new Set<string>();
  return Array.from(gachaCache.values())
    .sort((gachaA: any, gachaB: any) => {
      const dateA = new Date(gachaA.publishStart).getTime();
      const dateB = new Date(gachaB.publishStart).getTime();
      return dateB - dateA;
    })
    .map((gacha: any) => {
      const cards = gacha.cards ?? [];
      const notDrawnCards = cards.filter(
        (card: any) => card.isDrawn === CARD_STATUS.NOT_DRAWN,
      );
      return {
        ...gacha,
        cardsCount: notDrawnCards.length,
        remainingCount: notDrawnCards.length,
        alreadyDrawn: gacha.oncePerUser ? drawnGachaIds.has(gacha.id) : false,
      };
    });
}

/**
 * Get a single gacha by id with cards and remaining count
 * @param {string} id - Gacha id
 * @param {string} [userId]
 * @returns {Promise<any | null>}
 */
async function getById(id: string, userId?: string) {
  const gacha = gachaCache.get(id);
  if (!gacha) return null;
  const cards = gacha.cards ?? [];
  const notDrawnCards = cards.filter(
    (card: any) => card.isDrawn === CARD_STATUS.NOT_DRAWN,
  );
  const alreadyDrawn =
    gacha.oncePerUser && userId
      ? (await getDrawnGachaIds(userId)).has(id)
      : false;
  return {
    ...gacha,
    cardsCount: notDrawnCards.length,
    remainingCount: notDrawnCards.length,
    alreadyDrawn,
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

  if (gacha.oncePerUser) {
    const existingDraw = await db.GachaUserDraw.findOne({
      where: { gachaId: payload.gachaId, userId: payload.userId },
    });
    if (existingDraw) {
      throw new Error(messages.errors.GACHA_ALREADY_DRAWN);
    }
  }

  const availableCards = (gacha.cards ?? []).filter(
    (card: any) => card.isDrawn === CARD_STATUS.NOT_DRAWN,
  );
  if (availableCards.length === 0) {
    throw new Error(messages.errors.GACHA_OUT_OF_STOCK);
  }

  const requestedDrawCount = gacha.oncePerUser ? 1 : payload.drawCount;
  const actualDrawCount = Math.min(requestedDrawCount, availableCards.length);
  const totalCost = gacha.cost * actualDrawCount;
  const usesSpecialPoint =
    gacha.consumptionType === CONSUMPTION_TYPE.SPECIAL_POINT;

  if (usesSpecialPoint) {
    if ((user.specialPoint ?? 0) < totalCost) {
      throw new Error(messages.errors.INSUFFICIENT_SPECIAL_POINT);
    }
  } else if (user.coin < totalCost) {
    throw new Error(messages.errors.INSUFFICIENT_COIN);
  }

  const nonLastCards = availableCards.filter(
    (card: any) => card.cardType !== "LAST",
  );

  let drawnCards: any[] = [];

  if (availableCards.length === 1) {
    drawnCards = availableCards;
  } else {
    const shuffledNonLast = [...nonLastCards].sort(() => Math.random() - 0.5);
    drawnCards = shuffledNonLast.slice(0, actualDrawCount);
  }
  const drawnIds = drawnCards.map((card: any) => card.id);

  await db.Card.update(
    { isDrawn: CARD_STATUS.DRAWN, userId: payload.userId },
    { where: { id: drawnIds } },
  );

  await cardRuntime.update(drawnIds, {
    isDrawn: CARD_STATUS.DRAWN,
    userId: payload.userId,
  });

  gacha.cards = (gacha.cards ?? []).map((card: any) =>
    drawnIds.includes(card.id)
      ? { ...card, isDrawn: CARD_STATUS.DRAWN, userId: payload.userId }
      : card,
  );
  gachaCache.set(payload.gachaId, gacha);

  let updatedUser;
  if (usesSpecialPoint) {
    updatedUser = await userRuntime.update(payload.userId, {
      specialPoint: (user.specialPoint ?? 0) - totalCost,
    });
  } else {
    updatedUser = await userRuntime.updateCoin(
      payload.userId,
      user.coin - totalCost,
    );
  }

  if (gacha.oncePerUser) {
    await db.GachaUserDraw.create({
      gachaId: payload.gachaId,
      userId: payload.userId,
    });
  }

  const remainingCount = gacha.cards.filter(
    (card: any) => card.isDrawn === CARD_STATUS.NOT_DRAWN,
  ).length;

  return {
    drawnCards: drawnCards.map((card: any) => {
      const effect = card.effectId
        ? effectRuntime.getById(card.effectId)
        : null;
      return {
        ...card,
        effectName: effect?.name ?? null,
        effectUrl: effect?.url ?? null,
        isDrawn: CARD_STATUS.DRAWN,
        userId: payload.userId,
      };
    }),
    remainingCount,
    userCoin: updatedUser.coin,
    userSpecialPoint: updatedUser.specialPoint,
    consumptionType: gacha.consumptionType ?? CONSUMPTION_TYPE.COIN,
    oncePerUser: !!gacha.oncePerUser,
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
    genreId?: string | null;
    consumptionType?: string;
    cost: number;
    oncePerUser?: boolean;
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

  const genreId =
    payload.genreId !== undefined ? payload.genreId : gacha.genreId;

  await gacha.update({
    name: payload.name,
    genreId,
    headerImage: headerImageBase64,
    consumptionType: payload.consumptionType ?? gacha.consumptionType,
    cost: payload.cost,
    oncePerUser: payload.oncePerUser ?? gacha.oncePerUser,
    publishStart: payload.publishStart,
    publishEnd: payload.publishEnd,
    isPublic: payload.isPublic,
  });

  const cached = gachaCache.get(id);
  const genreName = genreId
    ? (genreRuntime.getById(genreId)?.name ?? null)
    : null;
  const plainGacha = {
    ...toPlain(gacha),
    cards: cached?.cards ?? [],
    genreName,
  };
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
 * Refresh a specific gacha's cards from database
 * @param {string} gachaId - Target gacha id
 */
async function refreshGachaCards(gachaId: string) {
  const gacha = await db.Gacha.findByPk(gachaId, {
    include: [{ model: db.Card, as: "cards" }],
  });
  if (!gacha) return;

  const cached = gachaCache.get(gachaId);
  if (!cached) return;

  const cards = (gacha.cards || []).map((card: any) => {
    const plainCard = toPlain(card);
    const effect = plainCard.effectId
      ? effectRuntime.getById(plainCard.effectId)
      : null;
    return {
      ...plainCard,
      effectName: effect?.name ?? null,
      effectUrl: effect?.url ?? null,
    };
  });
  gachaCache.set(gachaId, { ...cached, cards });
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
  refreshGachaCards,
  addCardToCache,
  updateCardInCache,
  removeCardFromCache,
};
