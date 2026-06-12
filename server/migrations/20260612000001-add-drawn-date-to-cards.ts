module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.addColumn('cards', 'drawnDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface: any) {
    await queryInterface.removeColumn('cards', 'drawnDate');
  },
};
