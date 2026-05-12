"use strict";

export {};

import fs from "fs";
import path from "path";

const { v4: uuidv4 } = require("uuid");
const messages = require("../../constants/messages.json");

let db: any;
let gachaCache: Map<number, any> = new Map();

const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const RELATIVE_PATH = "/uploads";

const toPlain = (gacha: any) => gacha?.get({ plain: true }) || null;

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

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

  ensureUploadDir();

  let headerImageUrl = "";
  if (payload.headerImageFile) {
    const filename = `${uuidv4()}-${Date.now()}${path.extname(
      payload.headerImageFile.originalname,
    )}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.promises.writeFile(filepath, payload.headerImageFile.buffer);
    headerImageUrl = `${RELATIVE_PATH}/${filename}`;
  }

  const gacha = await db.Gacha.create({
    name: payload.name,
    headerImage: headerImageUrl,
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

  let headerImageUrl = gacha.headerImage;
  if (payload.headerImageFile) {
    ensureUploadDir();
    const filename = `${uuidv4()}-${Date.now()}${path.extname(
      payload.headerImageFile.originalname,
    )}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.promises.writeFile(filepath, payload.headerImageFile.buffer);
    headerImageUrl = `${RELATIVE_PATH}/${filename}`;
  }

  await gacha.update({
    name: payload.name,
    headerImage: headerImageUrl,
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
  await gacha.destroy();
  gachaCache.delete(id);
}

module.exports = {
  init,
  create,
  getAll,
  update,
  deleteById,
};
