"use strict";

export {};

const messages = require("../../constants/messages.json");

let db: any;
let userCache: Map<number, any> = new Map();

const toPlain = (user: any) => user?.get({ plain: true }) || null;

/**
 * Initialize user module with database connection
 * @param {*} _db - Sequelize database instance
 */
async function init(_db: any) {
  db = _db;
  await refreshCache();
}

/**
 * Refresh user cache from database
 */
async function refreshCache() {
  const users = await db.User.findAll();
  userCache.clear();
  users.forEach((user: any) => {
    const plainUser = toPlain(user);
    userCache.set(user.id, plainUser);
  });
}

/**
 * Create a new user
 * @param {object} payload - User signup attributes
 * @returns {Promise<any>} - Created user object
 */
async function create(payload: {
  email: string;
  password: string;
  name: string;
  address: string;
  phone: string;
}) {
  if (
    Array.from(userCache.values()).some(
      (user: any) => user.email === payload.email,
    )
  ) {
    throw new Error(messages.errors.EMAIL_ALREADY_EXISTS);
  }

  if (
    Array.from(userCache.values()).some(
      (user: any) => user.phone === payload.phone,
    )
  ) {
    throw new Error(messages.errors.PHONE_ALREADY_EXISTS);
  }

  const user = await db.User.create({
    email: payload.email,
    password: payload.password,
    name: payload.name,
    address: payload.address,
    phone: payload.phone,
    coin: 0,
  });
  const plainUser = toPlain(user);
  userCache.set(user.id, plainUser);
  return plainUser;
}

/**
 * Verify user credentials by email or phone
 * @param {string} identifier - Email address or phone number
 * @param {string} password - User password
 * @returns {Promise<any>} - User object if credentials are valid, null otherwise
 */
async function verifyCredentials(identifier: string, password: string) {
  const user = Array.from(userCache.values()).find(
    (user: any) => user.email === identifier || user.phone === identifier,
  );
  if (!user || user.password !== password) {
    return null;
  }
  return user;
}

/**
 * Get all users from cache
 * @returns {Promise<any[]>} - Array of user objects
 */
async function getAll() {
  return Array.from(userCache.values());
}

module.exports = {
  init,
  create,
  verifyCredentials,
  getAll,
};
