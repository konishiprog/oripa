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
      name: {
        type: DataTypes.STRING,
      },
      coin: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      specialPoint: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      address: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: false,
    }
  );

  return User;
};