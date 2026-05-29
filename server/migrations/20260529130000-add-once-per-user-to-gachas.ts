"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn("gachas", "oncePerUser", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.sequelize.query(
      `UPDATE "gachas" SET "consumptionType" = 'COIN' WHERE "consumptionType" IS NULL OR "consumptionType" = ''`,
    );
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn("gachas", "oncePerUser");
  },
};
