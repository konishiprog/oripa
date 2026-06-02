"use strict";

export {};

const messages = require("../../constants/messages.json");
const { CARD_STATUS, EXCHANGE_TYPE } = require("../../constants/card");
const effectRuntime = require("../effect");

let db: any;
let cardCache: Map<string, any> = new Map();

const toPlain = (card: any) => card?.get({ plain: true }) || null;

/**
 * Resolve effect name/url for a card from the effect cache
 * @param {string | null} effectId
 * @returns {{effectName: string | null, effectUrl: string | null}}
 */
function resolveEffect(effectId: string | null | undefined) {
  const effect = effectId ? effectRuntime.getById(effectId) : null;
  return {
    effectName: effect?.name ?? null,
    effectUrl: effect?.url ?? null,
  };
}

/**
 * Initialize card module with database connection
 * @param {*} _db - Sequelize database instance
 */
async function init(_db: any) {
  db = _db;
  await refreshCache();
}

/**
 * Refresh card cache from database (single DB call for all cards)
 */
async function refreshCache() {
  const cards = await db.Card.findAll({
    include: [{ model: db.Gacha, as: "gacha" }],
    order: [["id", "ASC"]],
  });
  cardCache.clear();
  cards.forEach((card: any) => {
    const plainCard = toPlain(card);
    const cardWithGacha = {
      ...plainCard,
      gachaName: card.gacha?.name ?? null,
      ...resolveEffect(plainCard.effectId),
    };
    cardCache.set(plainCard.id, cardWithGacha);
  });
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
  effectId?: string | null;
  imageFrontFile?: any;
  imageBackFile?: any;
}) {
  const gacha = await db.Gacha.findByPk(payload.gachaId);
  if (!gacha) {
    throw new Error(messages.errors.GACHA_NOT_FOUND);
  }

  if (payload.cardType === "LAST") {
    const existingLastCard = await db.Card.findOne({
      where: {
        gachaId: payload.gachaId,
        cardType: "LAST",
        isDrawn: CARD_STATUS.NOT_DRAWN,
      },
    });
    if (existingLastCard) {
      throw new Error(messages.errors.LAST_CARD_ALREADY_EXISTS);
    }
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
      payload.exchangeType === EXCHANGE_TYPE.BOTH
        ? (payload.exchangePoints ?? null)
        : null,
    effectId: payload.effectId ?? null,
    imageFront: imageFrontBase64,
    imageBack: imageBackBase64,
    isDrawn: CARD_STATUS.NOT_DRAWN,
  });

  const plainCard = toPlain(card);
  const plainCardWithGacha = {
    ...plainCard,
    gachaName: gacha.name,
    ...resolveEffect(plainCard.effectId),
  };
  cardCache.set(plainCard.id, plainCardWithGacha);
  return plainCardWithGacha;
}

/**
 * Get all cards from cache
 * @returns {Promise<any[]>} - Array of all card objects
 */
function getAll() {
  const cards = Array.from(cardCache.values());
  return Promise.resolve(cards);
}

/**
 * Update cards (single detailed update or bulk draw update)
 * For single update: requires name, cardType, exchangeType, and optional images
 * For bulk draw update: pass cardIds array and userId
 * @param {string | string[]} id - Card id or array of card ids
 * @param {object} payload - Card attributes with optional image files or draw data
 * @returns {Promise<any>} - Updated card object(s)
 */
async function update(
  id: string | string[],
  payload: {
    name?: string;
    cardType?: string;
    exchangeType?: string;
    exchangePoints?: number | null;
    effectId?: string | null;
    imageFrontFile?: any;
    imageBackFile?: any;
    userId?: string;
    isDrawn?: string;
  },
) {
  if (Array.isArray(id)) {
    id.forEach((cardId: string) => {
      const card = cardCache.get(cardId);
      if (card) {
        if (payload.isDrawn !== undefined) card.isDrawn = payload.isDrawn;
        if (payload.userId !== undefined) card.userId = payload.userId;
        cardCache.set(cardId, card);
      }
    });
    return;
  }

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

  const updateData: any = {
    imageFront: imageFrontBase64,
    imageBack: imageBackBase64,
  };
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.cardType !== undefined) updateData.cardType = payload.cardType;
  if (payload.exchangeType !== undefined) {
    updateData.exchangeType = payload.exchangeType;
    updateData.exchangePoints =
      payload.exchangeType === EXCHANGE_TYPE.BOTH
        ? (payload.exchangePoints ?? null)
        : null;
  }
  if (payload.effectId !== undefined) {
    updateData.effectId = payload.effectId;
  }
  if (payload.isDrawn !== undefined) updateData.isDrawn = payload.isDrawn;
  if (payload.userId !== undefined) updateData.userId = payload.userId;

  await card.update(updateData);

  const plainCard = toPlain(card);
  const cachedCard = cardCache.get(id);
  const plainCardWithGacha = {
    ...plainCard,
    gachaName: cachedCard?.gachaName,
    ...resolveEffect(plainCard.effectId),
  };
  cardCache.set(id, plainCardWithGacha);
  return plainCardWithGacha;
}

/**
 * Delete an existing card by id
 * @param {string} id - Card id to delete
 */
async function deleteById(id: string) {
  const cachedCard = cardCache.get(id);
  if (!cachedCard) {
    throw new Error(messages.errors.CARD_NOT_FOUND);
  }
  const gachaId = cachedCard.gachaId;
  await db.Card.destroy({ where: { id } });
  cardCache.delete(id);
  return gachaId;
}

module.exports = {
  init,
  create,
  getAll,
  update,
  deleteById,
  refreshCache,
};
