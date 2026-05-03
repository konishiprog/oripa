"use strict";

export {};

const { v4: uuidv4 } = require("uuid");
const messages = require("../../constants/messages.json");

let db: any;
let adminCache: Map<string, any> = new Map();

const toPlain = (admin: any) => admin?.get({ plain: true }) || null;

/**
 * Initialize admin module with database connection
 * @param {*} _db - Sequelize database instance
 */
async function init(_db: any) {
  db = _db;
  await refreshCache();
}

/**
 * Refresh admin cache from database
 */
async function refreshCache() {
  const admins = await db.Admin.findAll();
  adminCache.clear();
  admins.forEach((admin: any) => {
    const plainAdmin = toPlain(admin);
    adminCache.set(admin.id, plainAdmin);
  });
}

/**
 * Create a new admin user
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @returns {Promise<any>} - Created admin object
 */
async function create(email: string, password: string) {
  if (Array.from(adminCache.values()).some((admin: any) => admin.email === email)) {
    throw new Error(messages.errors.EMAIL_ALREADY_EXISTS);
  }

  const id = uuidv4();
  const admin = await db.Admin.create({ id, email, password });
  const plainAdmin = toPlain(admin);
  adminCache.set(id, plainAdmin);
  return plainAdmin;
}

/**
 * Verify admin credentials from cache
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @returns {Promise<any>} - Admin object if credentials are valid, null otherwise
 */
async function verifyCredentials(email: string, password: string) {
  const admin = Array.from(adminCache.values()).find((admin: any) => admin.email === email);
  if (!admin || admin.password !== password) {
    return null;
  }
  return admin;
}

/**
 * Update an existing admin user
 * @param {string} id - Admin id
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @returns {Promise<any>} - Updated admin object
 */
async function update(id: string, email: string, password: string) {
  const admin = adminCache.get(id);
  if (!admin) {
    throw new Error(messages.errors.ADMIN_NOT_FOUND);
  }

  if (email !== admin.email) {
    const duplicate = Array.from(adminCache.values()).some((a: any) => a.email === email);
    if (duplicate) {
      throw new Error(messages.errors.EMAIL_ALREADY_EXISTS);
    }
  }

  await db.Admin.update({ email, password }, { where: { id } });
  const updatedAdmin = { ...admin, email, password };
  adminCache.set(id, updatedAdmin);
  return updatedAdmin;
}

/**
 * Delete an admin user
 * @param {string} id - Admin id
 * @returns {Promise<number>} - Number of rows deleted
 */
async function deleteAdmin(id: string) {
  if (!adminCache.has(id)) {
    throw new Error(messages.errors.ADMIN_NOT_FOUND);
  }

  const result = await db.Admin.destroy({ where: { id } });
  adminCache.delete(id);
  return result;
}

/**
 * Get all admins from cache
 * @returns {Promise<any[]>} - Array of admin objects
 */
async function getAll() {
  return Array.from(adminCache.values());
}

module.exports = {
  init,
  create,
  update,
  deleteAdmin,
  getAll,
  verifyCredentials,
};
