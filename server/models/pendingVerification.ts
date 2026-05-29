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
      type: {
        type: DataTypes.ENUM("signup", "email_change"),
        defaultValue: "signup",
      },
      token: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      newEmail: {
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
