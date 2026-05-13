export {};
("use strict");
const { Model } = require("sequelize");

module.exports = (sequelize: any, DataTypes: any) => {
  class Gacha extends Model {
    static associate(models: any) {
      Gacha.hasMany(models.Card, {
        foreignKey: "gachaId",
        as: "cards",
      });
    }
  }

  Gacha.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      headerImage: {
        type: DataTypes.TEXT,
      },
      name: {
        type: DataTypes.STRING,
      },
      consumptionType: {
        type: DataTypes.STRING,
      },
      cost: {
        type: DataTypes.INTEGER,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      publishStart: {
        type: DataTypes.DATE,
      },
      publishEnd: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Gacha",
    },
  );

  return Gacha;
};
