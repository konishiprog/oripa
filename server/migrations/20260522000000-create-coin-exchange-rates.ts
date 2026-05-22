"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.createTable("CoinExchangeRates", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      point: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      specialPoint: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    });
  },

  async down(queryInterface: any, Sequelize: any) {
    await queryInterface.dropTable("CoinExchangeRates");
  },
};
