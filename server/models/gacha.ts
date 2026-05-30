export {};
("use strict");
const { Model } = require("sequelize");

module.exports = (sequelize: any, DataTypes: any) => {
  class Gacha extends Model {
    static associate(models: any) {
      Gacha.hasMany(models.Card, {
        foreignKey: "gachaId",
        as: "cards",
        onDelete: "CASCADE",
      });
      Gacha.hasMany(models.GachaUserDraw, {
        foreignKey: "gachaId",
        as: "userDraws",
        onDelete: "CASCADE",
      });
      Gacha.belongsTo(models.Genre, {
        foreignKey: "genreId",
        as: "genre",
      });
    }
  }

  Gacha.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      headerImage: {
        type: DataTypes.TEXT,
      },
      name: {
        type: DataTypes.STRING,
      },
      genreId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      consumptionType: {
        type: DataTypes.STRING,
        defaultValue: "COIN",
      },
      cost: {
        type: DataTypes.INTEGER,
      },
      oncePerUser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "gachas",
      timestamps: false,
    },
  );

  return Gacha;
};
