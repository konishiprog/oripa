"use strict";

export {};

let db: any;
let rateCache: Map<string, any> = new Map();

const toPlain = (rate: any) => rate?.get({ plain: true }) || null;

/**
 * Initialize module with database connection
 * Loads all rates into cache for fast access
 */
async function init(_db: any) {
  db = _db;
  await refreshCache();
}

/**
 * Refresh rate cache from database
 */
async function refreshCache() {
  const rates = await db.CoinExchangeRate.findAll({
    order: [["point", "ASC"]],
  });
  rateCache.clear();
  rates.forEach((rate: any) => {
    const plainRate = toPlain(rate);
    rateCache.set(rate.id, plainRate);
  });
}

/**
 * Get all rates from cache (sorted by point)
 */
async function getAll() {
  return Array.from(rateCache.values()).sort(
    (rateA: any, rateB: any) => rateA.point - rateB.point,
  );
}

/**
 * Get a rate by id from cache (no DB access)
 */
function getById(id: string) {
  return rateCache.get(id) || null;
}

/**
 * Create a new rate
 * Uses cache for duplicate check (only 1 INSERT query)
 */
async function create(point: number, price: number, specialPoint: number = 0) {
  const exists = Array.from(rateCache.values()).some(
    (rate: any) => rate.point === point,
  );
  if (exists) {
    throw new Error("Exchange rate for this point already exists");
  }

  const rate = await db.CoinExchangeRate.create({
    point,
    price,
    specialPoint,
  });
  const plainRate = toPlain(rate);
  rateCache.set(rate.id, plainRate);
  return plainRate;
}

/**
 * Update a rate
 * Uses cache to minimize DB access (only 1 UPDATE query)
 */
async function update(
  id: string,
  point: number,
  price: number,
  specialPoint: number = 0,
) {
  const cachedRate = rateCache.get(id);
  if (!cachedRate) {
    throw new Error("Exchange rate not found");
  }

  const exists = Array.from(rateCache.values()).some(
    (rate: any) => rate.point === point && rate.id !== id,
  );
  if (exists) {
    throw new Error("Exchange rate for this point already exists");
  }

  await db.CoinExchangeRate.update(
    { point, price, specialPoint },
    { where: { id } },
  );
  const updatedRate = { ...cachedRate, point, price, specialPoint };
  rateCache.set(id, updatedRate);
  return updatedRate;
}

/**
 * Delete a rate
 * Uses cache to minimize DB access (only 1 DELETE query)
 */
async function deleteRate(id: string) {
  const cachedRate = rateCache.get(id);
  if (!cachedRate) {
    throw new Error("Exchange rate not found");
  }
  await db.CoinExchangeRate.destroy({ where: { id } });
  rateCache.delete(id);
}

module.exports = {
  init,
  getAll,
  getById,
  create,
  update,
  deleteRate,
};
