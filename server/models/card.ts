export {};
('use strict');
const { Model } = require('sequelize');

module.exports = (sequelize: any, DataTypes: any) => {
  class Card extends Model {
    static associate(models: any) {
      Card.belongsTo(models.Gacha, {
        foreignKey: 'gachaId',
        as: 'gacha',
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
      isDrawn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Card',
      timestamps: false,
    }
  );

  return Card;
};