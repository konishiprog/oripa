"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "cards",
        "userId",
        {
          type: Sequelize.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addConstraint("cards", {
        fields: ["userId"],
        type: "foreign key",
        name: "fk_cards_userId",
        references: {
          table: "users",
          field: "id",
        },
        onDelete: "CASCADE",
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint("cards", "fk_cards_userId", {
        transaction,
      });

      await queryInterface.removeColumn("cards", "userId", { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
