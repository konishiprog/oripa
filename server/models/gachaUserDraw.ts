export {};
("use strict");
const { Model } = require("sequelize");

module.exports = (sequelize: any, DataTypes: any) => {
  class GachaUserDraw extends Model {
    static associate(models: any) {
      GachaUserDraw.belongsTo(models.Gacha, {
        foreignKey: "gachaId",
        as: "gacha",
      });
      GachaUserDraw.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  GachaUserDraw.init(
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
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "GachaUserDraw",
      tableName: "gacha_user_draws",
      timestamps: false,
    },
  );

  return GachaUserDraw;
};
