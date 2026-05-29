"use strict";

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "gacha_user_draws",
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          gachaId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "gachas", key: "id" },
            onDelete: "CASCADE",
          },
          userId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "users", key: "id" },
            onDelete: "CASCADE",
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        },
        { transaction },
      );
      await queryInterface.addConstraint("gacha_user_draws", {
        fields: ["gachaId", "userId"],
        type: "unique",
        name: "gacha_user_draws_gachaId_userId_unique",
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface: any) {
    await queryInterface.dropTable("gacha_user_draws");
  },
};
