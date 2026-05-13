'use strict';

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn('Cards', 'exchangeType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn('Cards', 'exchangeType');
  },
};
