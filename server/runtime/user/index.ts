"use strict";

export {};

import { v4 as uuidv4 } from 'uuid';
const messages = require("../../constants/messages.json");

let db: any;
let userCache: Map<string, any> = new Map();

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
 * Create a pending verification record (for email verification flow)
 * @param {object} payload - User signup attributes
 * @returns {Promise<any>} - Pending verification object with token
 */
async function createPending(payload: {
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

  // Calculate new expiration (5 minutes from now)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Check if pending verification already exists for this email
  const existing = await db.PendingVerification.findOne({
    where: { email: payload.email },
  });

  if (existing) {
    // Update existing record with new token and expiration
    const newToken = uuidv4();
    await db.PendingVerification.update(
      { token: newToken, expiresAt },
      { where: { email: payload.email } },
    );
    const updated = await db.PendingVerification.findOne({
      where: { email: payload.email },
    });
    return toPlain(updated);
  }

  // Create new pending verification if it doesn't exist
  const pending = await db.PendingVerification.create({
    email: payload.email,
    password: payload.password,
    name: payload.name,
    address: payload.address,
    phone: payload.phone,
    expiresAt,
  });

  return toPlain(pending);
}

/**
 * Verify email token and create user
 * @param {string} token - Verification token from email link
 * @returns {Promise<any>} - Created user object
 */
async function verifyEmail(token: string) {
  const pending = await db.PendingVerification.findOne({ where: { token } });

  if (!pending) {
    throw { status: 404, message: 'Invalid or expired verification link' };
  }

  const pendingPlain = toPlain(pending);

  // Check if token has expired
  if (new Date() > pendingPlain.expiresAt) {
    await db.PendingVerification.destroy({ where: { id: pending.id } });
    throw { status: 410, message: 'Verification link has expired' };
  }

  // Create the actual user
  const user = await db.User.create({
    email: pendingPlain.email,
    password: pendingPlain.password,
    name: pendingPlain.name,
    address: pendingPlain.address,
    phone: pendingPlain.phone,
    coin: 0,
  });

  // Delete the pending verification
  await db.PendingVerification.destroy({ where: { id: pending.id } });

  // Update cache with new user
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

/**
 * Get a user by id from cache
 * @param {string} id - User id
 * @returns {any | null} - User object or null
 */
function getById(id: string) {
  return userCache.get(id) || null;
}

/**
 * Update a user's coin balance
 * @param {string} id - User id
 * @param {number} newCoin - New coin value
 * @returns {Promise<any>} - Updated user object
 */
async function updateCoin(id: string, newCoin: number) {
  const cachedUser = userCache.get(id);
  if (!cachedUser) {
    throw new Error(messages.errors.USER_NOT_FOUND);
  }
  await db.User.update({ coin: newCoin }, { where: { id } });
  const updatedUser = { ...cachedUser, coin: newCoin };
  userCache.set(id, updatedUser);
  return updatedUser;
}

/**
 * Charge a user with coin and special points
 * Uses cache to minimize DB access (only 1 UPDATE query)
 * @param {string} id - User id
 * @param {number} point - Point amount to add to coin
 * @param {number} specialPoint - Special point amount to add
 * @returns {Promise<any>} - Charge result with updated values
 */
async function charge(
  id: string,
  price: number,
  point: number,
  specialPoint: number = 0,
) {
  const cachedUser = userCache.get(id);
  if (!cachedUser) {
    throw new Error(messages.errors.USER_NOT_FOUND);
  }

  const previousCoin = cachedUser.coin || 0;
  const previousSpecialPoint = cachedUser.specialPoint || 0;
  const newCoin = previousCoin + point;
  const newSpecialPoint = previousSpecialPoint + specialPoint;

  await db.User.update(
    { coin: newCoin, specialPoint: newSpecialPoint },
    { where: { id } },
  );

  const updatedUser = { ...cachedUser, coin: newCoin, specialPoint: newSpecialPoint };
  userCache.set(id, updatedUser);

  await db.CoinPurchaseHistory.create({
    userId: id,
    price,
    point,
    specialPoint,
    status: 'completed',
  });

  return {
    userId: id,
    previousCoin,
    newCoin,
    addedPoint: point,
    previousSpecialPoint,
    newSpecialPoint,
    addedSpecialPoint: specialPoint,
  };
}

/**
 * Update a user
 * Uses cache to minimize DB access (only 1 UPDATE query)
 * @param {string} id - User id
 * @param {object} payload - User update attributes
 * @returns {Promise<any>} - Updated user object
 */
async function update(
  id: string,
  payload: {
    email?: string;
    password?: string;
    name?: string;
    address?: string;
    phone?: string;
    coin?: number;
    specialPoint?: number;
  },
) {
  const cachedUser = userCache.get(id);
  if (!cachedUser) {
    throw new Error(messages.errors.USER_NOT_FOUND);
  }

  if (payload.email && payload.email !== cachedUser.email) {
    const exists = Array.from(userCache.values()).some(
      (u: any) => u.email === payload.email && u.id !== id,
    );
    if (exists) {
      throw new Error(messages.errors.EMAIL_ALREADY_EXISTS);
    }
  }

  if (payload.phone && payload.phone !== cachedUser.phone) {
    const exists = Array.from(userCache.values()).some(
      (u: any) => u.phone === payload.phone && u.id !== id,
    );
    if (exists) {
      throw new Error(messages.errors.PHONE_ALREADY_EXISTS);
    }
  }

  const updateData: any = {};
  if (payload.email !== undefined) updateData.email = payload.email;
  if (payload.password !== undefined) updateData.password = payload.password;
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.address !== undefined) updateData.address = payload.address;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  if (payload.coin !== undefined) updateData.coin = payload.coin;
  if (payload.specialPoint !== undefined) updateData.specialPoint = payload.specialPoint;

  await db.User.update(updateData, { where: { id } });

  const updatedUser = { ...cachedUser, ...updateData };
  userCache.set(id, updatedUser);
  return updatedUser;
}

/**
 * Delete a user
 * Uses cache to minimize DB access (only 1 DELETE query)
 * @param {string} id - User id
 * @returns {Promise<void>}
 */
async function deleteUser(id: string) {
  const cachedUser = userCache.get(id);
  if (!cachedUser) {
    throw new Error(messages.errors.USER_NOT_FOUND);
  }
  await db.User.destroy({ where: { id } });
  userCache.delete(id);
}

module.exports = {
  init,
  createPending,
  verifyEmail,
  verifyCredentials,
  getAll,
  getById,
  updateCoin,
  update,
  charge,
  delete: deleteUser,
};
