export {};
("use strict");
const { Model } = require("sequelize");

module.exports = (sequelize: any, DataTypes: any) => {
  class CoinExchangeRate extends Model {
    static associate(models: any) {}
  }

  CoinExchangeRate.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      specialPoint: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "CoinExchangeRate",
      timestamps: false,
    },
  );

  return CoinExchangeRate;
};
