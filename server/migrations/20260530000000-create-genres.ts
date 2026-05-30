"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.createTable("Genres", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });
  },

  async down(queryInterface: any, Sequelize: any) {
    await queryInterface.dropTable("Genres");
  },
};
