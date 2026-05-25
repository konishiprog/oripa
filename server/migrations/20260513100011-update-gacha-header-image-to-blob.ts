'use strict';

module.exports = {
  async up(queryInterface: any) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "gachas" ALTER COLUMN "headerImage" SET DATA TYPE TEXT'
    );
  },

  async down(queryInterface: any) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "gachas" ALTER COLUMN "headerImage" SET DATA TYPE VARCHAR(255)'
    );
  },
};
