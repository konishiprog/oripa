'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('Admins', { cascade: true, transaction });
      await queryInterface.createTable(
        'Admins',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          email: {
            type: Sequelize.STRING,
            unique: true,
          },
          password: {
            type: Sequelize.STRING,
          },
        },
        { transaction },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('Admins', { cascade: true, transaction });
      await queryInterface.createTable(
        'Admins',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          email: {
            type: Sequelize.STRING,
            unique: true,
          },
          password: {
            type: Sequelize.STRING,
          },
        },
        { transaction },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
