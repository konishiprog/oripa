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
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      gachaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
      },
      imageFront: {
        type: DataTypes.STRING,
      },
      imageBack: {
        type: DataTypes.STRING,
      },
      cardType: {
        type: DataTypes.STRING,
      },
      isDrawn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Card',
    }
  );

  return Card;
};