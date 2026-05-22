'use strict';

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn('Users', 'specialPoint', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn('Users', 'specialPoint');
  },
};
