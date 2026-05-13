'use strict';

module.exports = {
  async up(queryInterface: any) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "Gachas" ALTER COLUMN "headerImage" SET DATA TYPE TEXT'
    );
  },

  async down(queryInterface: any) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "Gachas" ALTER COLUMN "headerImage" SET DATA TYPE VARCHAR(255)'
    );
  },
};
