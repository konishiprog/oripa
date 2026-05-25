'use strict';

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn('cards', 'exchangePoints', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn('cards', 'exchangePoints');
  },
};
