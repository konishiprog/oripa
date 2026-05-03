"use strict";

export {};

const { v4: uuidv4 } = require("uuid");

let db: any;

/**
 * Initialize admin module with database connection
 * @param {*} _db - Sequelize database instance
 */
function init(_db: any) {
  db = _db;
}

/**
 * Create a new admin user
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @returns {Promise<any>} - Created admin object
 */
async function create(email: string, password: string) {
  const existingAdmin = await db.Admin.findOne({ where: { email } });
  if (existingAdmin) {
    throw new Error("Email already exists");
  }

  const id = uuidv4();
  const admin = await db.Admin.create({ id, email, password });
  return admin.get({ plain: true });
}

/**
 * Get admin by email
 * @param {string} email - Admin email address
 * @returns {Promise<any>} - Admin object or null
 */
async function getByEmail(email: string) {
  return await db.Admin.findOne({ where: { email } });
}

/**
 * Get admin by id
 * @param {string} id - Admin id
 * @returns {Promise<any>} - Admin object or null
 */
async function getById(id: string) {
  const admin = await db.Admin.findOne({ where: { id } });
  if (!admin) {
    return null;
  }
  return admin.get({ plain: true });
}

/**
 * Verify admin credentials
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @returns {Promise<any>} - Admin object if credentials are valid, null otherwise
 */
async function verifyCredentials(email: string, password: string) {
  const admin = await db.Admin.findOne({ where: { email } });
  if (!admin) {
    return null;
  }
  if (admin.password !== password) {
    return null;
  }
  return admin.get({ plain: true });
}

/**
 * Update an existing admin user
 * @param {string} id - Admin id
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @returns {Promise<any>} - Updated admin object
 */
async function update(id: string, email: string, password: string) {
  const admin = await db.Admin.findOne({ where: { id } });
  if (!admin) {
    throw new Error("Admin not found");
  }

  const duplicate = await db.Admin.findOne({ where: { email } });
  if (duplicate && duplicate.id !== id) {
    throw new Error("Email already exists");
  }

  await admin.update({ email, password });
  return admin.get({ plain: true });
}

/**
 * Delete an admin user
 * @param {string} id - Admin id
 * @returns {Promise<number>} - Number of rows deleted
 */
async function deleteAdmin(id: string) {
  const admin = await db.Admin.findOne({ where: { id } });
  if (!admin) {
    throw new Error("Admin not found");
  }
  return await db.Admin.destroy({ where: { id } });
}

/**
 * Get all admins
 * @returns {Promise<any[]>} - Array of admin objects
 */
async function getAll() {
  return await db.Admin.findAll();
}

module.exports = {
  init,
  create,
  update,
  deleteAdmin,
  getByEmail,
  getById,
  getAll,
  verifyCredentials,
};
