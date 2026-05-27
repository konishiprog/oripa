"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn("pending_verifications", "type", {
      type: Sequelize.ENUM("signup", "email_change"),
      defaultValue: "signup",
      allowNull: false,
    });

    await queryInterface.addColumn("pending_verifications", "userId", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn("pending_verifications", "newEmail", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn("pending_verifications", "newEmail");
    await queryInterface.removeColumn("pending_verifications", "userId");
    await queryInterface.removeColumn("pending_verifications", "type");
  },
};
