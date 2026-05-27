"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.changeColumn(
      "pending_verifications",
      "email",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },

  async down(queryInterface: any, Sequelize: any) {
    await queryInterface.changeColumn(
      "pending_verifications",
      "email",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );
  },
};
