module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.createTable("CoinPurchaseHistories", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      point: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      specialPoint: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "completed",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface: any) {
    await queryInterface.dropTable("CoinPurchaseHistories");
  },
};
