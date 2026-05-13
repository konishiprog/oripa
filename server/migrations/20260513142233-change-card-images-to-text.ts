"use strict";

module.exports = {
  async up(queryInterface: any) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "Cards" ALTER COLUMN "imageFront" SET DATA TYPE TEXT',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "Cards" ALTER COLUMN "imageBack" SET DATA TYPE TEXT',
    );
  },

  async down(queryInterface: any) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "Cards" ALTER COLUMN "imageFront" SET DATA TYPE VARCHAR(255)',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "Cards" ALTER COLUMN "imageBack" SET DATA TYPE VARCHAR(255)',
    );
  },
};
