"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.changeColumn(
      "pending_verifications",
      "password",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      "pending_verifications",
      "name",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      "pending_verifications",
      "address",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      "pending_verifications",
      "phone",
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },

  async down(queryInterface: any, Sequelize: any) {
    await queryInterface.changeColumn(
      "pending_verifications",
      "password",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "pending_verifications",
      "name",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "pending_verifications",
      "address",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );

    await queryInterface.changeColumn(
      "pending_verifications",
      "phone",
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    );
  },
};
