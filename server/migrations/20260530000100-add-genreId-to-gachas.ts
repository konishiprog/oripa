"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn("gachas", "genreId", {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  async down(queryInterface: any, Sequelize: any) {
    await queryInterface.removeColumn("gachas", "genreId");
  },
};
