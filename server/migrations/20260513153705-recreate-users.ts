'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('users', { cascade: true, transaction });
      await queryInterface.createTable(
        'users',
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

  async down(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('users', { cascade: true, transaction });
      await queryInterface.createTable(
        'users',
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
