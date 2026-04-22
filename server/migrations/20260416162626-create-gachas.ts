'use strict';

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.createTable('gachas', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      headerImage: {
        type: Sequelize.STRING,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface: any) {
    await queryInterface.dropTable('gachas');
  },
};