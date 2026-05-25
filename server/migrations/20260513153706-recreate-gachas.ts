'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('gachas', { cascade: true, transaction });
      await queryInterface.createTable(
        'gachas',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
          },
          headerImage: {
            type: Sequelize.TEXT,
          },
          name: {
            type: Sequelize.STRING,
          },
          consumptionType: {
            type: Sequelize.STRING,
          },
          cost: {
            type: Sequelize.INTEGER,
          },
          isPublic: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          publishStart: {
            type: Sequelize.DATE,
          },
          publishEnd: {
            type: Sequelize.DATE,
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
      await queryInterface.dropTable('gachas', { cascade: true, transaction });
      await queryInterface.createTable(
        'gachas',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
          },
          headerImage: {
            type: Sequelize.TEXT,
          },
          name: {
            type: Sequelize.STRING,
          },
          consumptionType: {
            type: Sequelize.STRING,
          },
          cost: {
            type: Sequelize.INTEGER,
          },
          isPublic: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          publishStart: {
            type: Sequelize.DATE,
          },
          publishEnd: {
            type: Sequelize.DATE,
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
