export {};
('use strict');

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.addColumn('pending_verifications', 'postalCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface: any) => {
    await queryInterface.removeColumn('pending_verifications', 'postalCode');
  },
};
