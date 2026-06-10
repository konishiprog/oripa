"use strict";

module.exports = {
  up: async (queryInterface: any) => {
    await queryInterface.renameColumn("CoinExchangeRates", "point", "coin");

    await queryInterface.renameColumn(
      "coin_purchase_histories",
      "point",
      "coin",
    );

    await queryInterface.renameColumn(
      "cards",
      "exchangePoints",
      "exchangeCoins",
    );
  },

  down: async (queryInterface: any) => {
    await queryInterface.renameColumn("CoinExchangeRates", "coin", "point");

    await queryInterface.renameColumn(
      "coin_purchase_histories",
      "coin",
      "point",
    );

    await queryInterface.renameColumn(
      "cards",
      "exchangeCoins",
      "exchangePoints",
    );
  },
};
