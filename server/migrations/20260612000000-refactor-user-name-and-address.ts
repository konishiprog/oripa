import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // users table
      await queryInterface.removeColumn('users', 'name', { transaction });
      await queryInterface.addColumn('users', 'firstName', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await queryInterface.addColumn('users', 'lastName', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await queryInterface.addColumn('users', 'prefecture', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await queryInterface.addColumn('users', 'buildingName', { type: DataTypes.STRING, allowNull: true }, { transaction });

      // pending_verifications table
      await queryInterface.removeColumn('pending_verifications', 'name', { transaction });
      await queryInterface.addColumn('pending_verifications', 'firstName', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await queryInterface.addColumn('pending_verifications', 'lastName', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await queryInterface.addColumn('pending_verifications', 'prefecture', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await queryInterface.addColumn('pending_verifications', 'buildingName', { type: DataTypes.STRING, allowNull: true }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // users table
      await queryInterface.addColumn('users', 'name', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await queryInterface.removeColumn('users', 'firstName', { transaction });
      await queryInterface.removeColumn('users', 'lastName', { transaction });
      await queryInterface.removeColumn('users', 'prefecture', { transaction });
      await queryInterface.removeColumn('users', 'buildingName', { transaction });

      // pending_verifications table
      await queryInterface.addColumn('pending_verifications', 'name', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await queryInterface.removeColumn('pending_verifications', 'firstName', { transaction });
      await queryInterface.removeColumn('pending_verifications', 'lastName', { transaction });
      await queryInterface.removeColumn('pending_verifications', 'prefecture', { transaction });
      await queryInterface.removeColumn('pending_verifications', 'buildingName', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
