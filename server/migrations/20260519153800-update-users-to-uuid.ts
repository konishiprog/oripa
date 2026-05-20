"use strict";

const { v4: generateUUID } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      const users: any[] = await queryInterface.sequelize.query(
        'SELECT * FROM "Users"',
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      await queryInterface.dropTable("Users", { cascade: true, transaction });
      await queryInterface.createTable(
        "Users",
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          email: {
            type: Sequelize.STRING,
            unique: true,
          },
          password: {
            type: Sequelize.STRING,
          },
          name: {
            type: Sequelize.STRING,
          },
          coin: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
          address: {
            type: Sequelize.STRING,
          },
          phone: {
            type: Sequelize.STRING,
          },
        },
        { transaction },
      );

      for (const user of users) {
        const newId = generateUUID();
        await queryInterface.sequelize.query(
          `INSERT INTO "Users" (id, email, password, name, coin, address, phone) VALUES (:id, :email, :password, :name, :coin, :address, :phone)`,
          {
            replacements: {
              id: newId,
              email: user.email,
              password: user.password,
              name: user.name,
              coin: user.coin,
              address: user.address,
              phone: user.phone,
            },
            transaction,
          },
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable("Users", { cascade: true, transaction });
      await queryInterface.createTable(
        "Users",
        {
          id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
          },
          email: {
            type: Sequelize.STRING,
            unique: true,
          },
          password: {
            type: Sequelize.STRING,
          },
          name: {
            type: Sequelize.STRING,
          },
          coin: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
          address: {
            type: Sequelize.STRING,
          },
          phone: {
            type: Sequelize.STRING,
          },
        },
        { transaction },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
