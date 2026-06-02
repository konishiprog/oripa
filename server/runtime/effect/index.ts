"use strict";

export {};

let db: any;
let effectCache: Map<string, any> = new Map();

const toPlain = (effect: any) => effect?.get({ plain: true }) || null;

/**
 * Initialize module with database connection
 * Loads all effects into cache for fast access
 */
async function init(_db: any) {
  db = _db;
  await refreshCache();
}

/**
 * Refresh effect cache from database
 */
async function refreshCache() {
  const effects = await db.Effect.findAll({ order: [["name", "ASC"]] });
  effectCache.clear();
  effects.forEach((effect: any) => {
    effectCache.set(effect.id, toPlain(effect));
  });
}

/**
 * Get all effects from cache (sorted by name)
 */
async function getAll() {
  return Array.from(effectCache.values()).sort((effectA: any, effectB: any) =>
    effectA.name.localeCompare(effectB.name),
  );
}

/**
 * Get an effect by id from cache (no DB access)
 */
function getById(id: string) {
  return effectCache.get(id) || null;
}

/**
 * Create a new effect
 */
async function create(name: string, url: string) {
  const exists = Array.from(effectCache.values()).some(
    (effect: any) => effect.name === name,
  );
  if (exists) {
    throw new Error("Effect name already exists");
  }

  const effect = await db.Effect.create({ name, url });
  const plainEffect = toPlain(effect);
  effectCache.set(effect.id, plainEffect);
  return plainEffect;
}

/**
 * Update an effect
 */
async function update(id: string, name: string, url: string) {
  const cachedEffect = effectCache.get(id);
  if (!cachedEffect) {
    throw new Error("Effect not found");
  }

  const exists = Array.from(effectCache.values()).some(
    (effect: any) => effect.name === name && effect.id !== id,
  );
  if (exists) {
    throw new Error("Effect name already exists");
  }

  await db.Effect.update({ name, url }, { where: { id } });
  const updatedEffect = { ...cachedEffect, name, url };
  effectCache.set(id, updatedEffect);
  return updatedEffect;
}

/**
 * Delete an effect
 */
async function deleteById(id: string) {
  const cachedEffect = effectCache.get(id);
  if (!cachedEffect) {
    throw new Error("Effect not found");
  }
  await db.Effect.destroy({ where: { id } });
  effectCache.delete(id);
}

module.exports = {
  init,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
