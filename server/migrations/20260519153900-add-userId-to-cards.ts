"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "Cards",
        "userId",
        {
          type: Sequelize.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addConstraint("Cards", {
        fields: ["userId"],
        type: "foreign key",
        name: "fk_cards_userId",
        references: {
          table: "Users",
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
      await queryInterface.removeConstraint("Cards", "fk_cards_userId", {
        transaction,
      });

      await queryInterface.removeColumn("Cards", "userId", { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
