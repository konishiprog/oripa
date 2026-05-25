'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('cards', { cascade: true, transaction });
      await queryInterface.createTable(
        'cards',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
          },
          gachaId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'gachas',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          name: {
            type: Sequelize.STRING,
          },
          imageFront: {
            type: Sequelize.TEXT,
          },
          imageBack: {
            type: Sequelize.TEXT,
          },
          cardType: {
            type: Sequelize.STRING,
          },
          exchangeType: {
            type: Sequelize.STRING,
          },
          isDrawn: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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
      await queryInterface.dropTable('cards', { cascade: true, transaction });
      await queryInterface.createTable(
        'cards',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
          },
          gachaId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'gachas',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          name: {
            type: Sequelize.STRING,
          },
          imageFront: {
            type: Sequelize.TEXT,
          },
          imageBack: {
            type: Sequelize.TEXT,
          },
          cardType: {
            type: Sequelize.STRING,
          },
          exchangeType: {
            type: Sequelize.STRING,
          },
          isDrawn: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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
