export {};
('use strict');
const { Model } = require('sequelize');

module.exports = (sequelize: any, DataTypes: any) => {
  class User extends Model {
    static associate(models: any) {}
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      nickname: {
        type: DataTypes.STRING,
      },
      coin: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      ticket: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      postalCode: {
        type: DataTypes.STRING,
      },
      prefecture: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      buildingName: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false,
    }
  );

  return User;
};
