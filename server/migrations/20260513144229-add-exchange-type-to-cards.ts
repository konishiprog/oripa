'use strict';

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn('cards', 'exchangeType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn('cards', 'exchangeType');
  },
};
