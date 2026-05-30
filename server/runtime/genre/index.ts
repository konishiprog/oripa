"use strict";

export {};

let db: any;
let genreCache: Map<string, any> = new Map();

const toPlain = (genre: any) => genre?.get({ plain: true }) || null;

/**
 * Initialize module with database connection
 * Loads all genres into cache for fast access
 */
async function init(_db: any) {
  db = _db;
  await refreshCache();
}

/**
 * Refresh genre cache from database
 */
async function refreshCache() {
  const genres = await db.Genre.findAll({ order: [["name", "ASC"]] });
  genreCache.clear();
  genres.forEach((genre: any) => {
    genreCache.set(genre.id, toPlain(genre));
  });
}

/**
 * Get all genres from cache (sorted by name)
 */
async function getAll() {
  return Array.from(genreCache.values()).sort((genreA: any, genreB: any) =>
    genreA.name.localeCompare(genreB.name),
  );
}

/**
 * Get a genre by id from cache (no DB access)
 */
function getById(id: string) {
  return genreCache.get(id) || null;
}

/**
 * Create a new genre
 */
async function create(name: string) {
  const exists = Array.from(genreCache.values()).some(
    (genre: any) => genre.name === name,
  );
  if (exists) {
    throw new Error("Genre name already exists");
  }

  const genre = await db.Genre.create({ name });
  const plainGenre = toPlain(genre);
  genreCache.set(genre.id, plainGenre);
  return plainGenre;
}

/**
 * Update a genre
 */
async function update(id: string, name: string) {
  const cachedGenre = genreCache.get(id);
  if (!cachedGenre) {
    throw new Error("Genre not found");
  }

  const exists = Array.from(genreCache.values()).some(
    (genre: any) => genre.name === name && genre.id !== id,
  );
  if (exists) {
    throw new Error("Genre name already exists");
  }

  await db.Genre.update({ name }, { where: { id } });
  const updatedGenre = { ...cachedGenre, name };
  genreCache.set(id, updatedGenre);
  return updatedGenre;
}

/**
 * Delete a genre
 */
async function deleteById(id: string) {
  const cachedGenre = genreCache.get(id);
  if (!cachedGenre) {
    throw new Error("Genre not found");
  }
  await db.Genre.destroy({ where: { id } });
  genreCache.delete(id);
}

module.exports = {
  init,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
