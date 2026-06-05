export {};
("use strict");
const { Model } = require("sequelize");

module.exports = (sequelize: any, DataTypes: any) => {
  class CoinPurchaseHistory extends Model {
    static associate(models: any) {
      CoinPurchaseHistory.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }

  CoinPurchaseHistory.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      specialPoint: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "completed",
      },
      stripePaymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      failureReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CoinPurchaseHistory",
      tableName: "coin_purchase_histories",
      timestamps: false,
    },
  );

  return CoinPurchaseHistory;
};
