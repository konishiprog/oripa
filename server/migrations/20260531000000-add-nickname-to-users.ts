export {};
('use strict');

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.addColumn('users', 'nickname', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('pending_verifications', 'nickname', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface: any) => {
    await queryInterface.removeColumn('users', 'nickname');
    await queryInterface.removeColumn('pending_verifications', 'nickname');
  },
};
