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
 * Get all admins
 * @returns {Promise<any[]>} - Array of admin objects
 */
async function getAll() {
  return await db.Admin.findAll();
}

module.exports = {
  init,
  create,
  getByEmail,
  getAll,
};
