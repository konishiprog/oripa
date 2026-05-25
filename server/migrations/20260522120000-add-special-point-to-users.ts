'use strict';

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn('users', 'specialPoint', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn('users', 'specialPoint');
  },
};
