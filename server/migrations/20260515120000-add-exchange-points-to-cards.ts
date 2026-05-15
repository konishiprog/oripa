'use strict';

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn('Cards', 'exchangePoints', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn('Cards', 'exchangePoints');
  },
};
