"use strict";

module.exports = {
  async up(queryInterface: any) {
    await queryInterface.renameColumn("users", "specialPoint", "ticket");
    await queryInterface.renameColumn(
      "CoinExchangeRates",
      "specialPoint",
      "ticket",
    );
    await queryInterface.renameColumn(
      "coin_purchase_histories",
      "specialPoint",
      "ticket",
    );
  },

  async down(queryInterface: any) {
    await queryInterface.renameColumn("users", "ticket", "specialPoint");
    await queryInterface.renameColumn(
      "CoinExchangeRates",
      "ticket",
      "specialPoint",
    );
    await queryInterface.renameColumn(
      "coin_purchase_histories",
      "ticket",
      "specialPoint",
    );
  },
};
