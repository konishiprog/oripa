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
    order: [["coin", "ASC"]],
  });
  rateCache.clear();
  rates.forEach((rate: any) => {
    const plainRate = toPlain(rate);
    rateCache.set(rate.id, plainRate);
  });
}

/**
 * Get all rates from cache (sorted by coin)
 */
async function getAll() {
  return Array.from(rateCache.values()).sort(
    (rateA: any, rateB: any) => rateA.coin - rateB.coin,
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
async function create(coin: number, price: number, ticket: number = 0) {
  const exists = Array.from(rateCache.values()).some(
    (rate: any) => rate.coin === coin,
  );
  if (exists) {
    throw new Error("Exchange rate for this coin already exists");
  }

  const rate = await db.CoinExchangeRate.create({
    coin,
    price,
    ticket,
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
  coin: number,
  price: number,
  ticket: number = 0,
) {
  const cachedRate = rateCache.get(id);
  if (!cachedRate) {
    throw new Error("Exchange rate not found");
  }

  const exists = Array.from(rateCache.values()).some(
    (rate: any) => rate.coin === coin && rate.id !== id,
  );
  if (exists) {
    throw new Error("Exchange rate for this coin already exists");
  }

  await db.CoinExchangeRate.update(
    { coin, price, ticket },
    { where: { id } },
  );
  const updatedRate = { ...cachedRate, coin, price, ticket };
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
