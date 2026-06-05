"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn("coin_purchase_histories", "stripePaymentIntentId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("coin_purchase_histories", "paymentMethod", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "card, ideal, bancontact等",
    });

    await queryInterface.addColumn("coin_purchase_histories", "failureReason", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "失敗理由",
    });
  },

  async down(queryInterface: any, Sequelize: any) {
    await queryInterface.removeColumn("coin_purchase_histories", "stripePaymentIntentId");
    await queryInterface.removeColumn("coin_purchase_histories", "paymentMethod");
    await queryInterface.removeColumn("coin_purchase_histories", "failureReason");
  },
};
