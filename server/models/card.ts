export {};
("use strict");
const { Model } = require("sequelize");
const { CARD_STATUS } = require("../constants/card");

module.exports = (sequelize: any, DataTypes: any) => {
  class Card extends Model {
    static associate(models: any) {
      Card.belongsTo(models.Gacha, {
        foreignKey: "gachaId",
        as: "gacha",
      });
      Card.belongsTo(models.Effect, {
        foreignKey: "effectId",
        as: "effect",
      });
    }
  }

  Card.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      gachaId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      imageFront: {
        type: DataTypes.TEXT,
      },
      imageBack: {
        type: DataTypes.TEXT,
      },
      cardType: {
        type: DataTypes.STRING,
      },
      exchangeType: {
        type: DataTypes.STRING,
      },
      exchangePoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      effectId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      isDrawn: {
        type: DataTypes.STRING,
        defaultValue: CARD_STATUS.NOT_DRAWN,
      },
    },
    {
      sequelize,
      modelName: "Card",
      tableName: "cards",
      timestamps: false,
    },
  );

  return Card;
};
