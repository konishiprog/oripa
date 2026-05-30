export {};
("use strict");
const { Model } = require("sequelize");

module.exports = (sequelize: any, DataTypes: any) => {
  class Genre extends Model {
    static associate(models: any) {
      Genre.hasMany(models.Gacha, {
        foreignKey: "genreId",
        as: "gachas",
      });
    }
  }

  Genre.init(
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
    },
    {
      sequelize,
      modelName: "Genre",
      tableName: "Genres",
      timestamps: false,
    },
  );

  return Genre;
};
