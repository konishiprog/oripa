"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn("cards", "trackingNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface: any, Sequelize: any) {
    await queryInterface.removeColumn("cards", "trackingNumber");
  },
};
