export {};
("use strict");
const { Model } = require("sequelize");

module.exports = (sequelize: any, DataTypes: any) => {
  class PendingVerification extends Model {
    static associate(models: any) {}
  }

  PendingVerification.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      token: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      expiresAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "PendingVerification",
      tableName: "pending_verifications",
      timestamps: false,
    },
  );

  return PendingVerification;
};
