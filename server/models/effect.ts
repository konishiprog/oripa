export {};
("use strict");
const { Model } = require("sequelize");

module.exports = (sequelize: any, DataTypes: any) => {
  class Effect extends Model {
    static associate(models: any) {
      Effect.hasMany(models.Card, {
        foreignKey: "effectId",
        as: "cards",
      });
    }
  }

  Effect.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Effect",
      tableName: "Effects",
      timestamps: false,
    },
  );

  return Effect;
};
