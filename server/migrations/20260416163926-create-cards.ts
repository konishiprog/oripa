'use strict';

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.createTable('cards', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      gachaId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'gachas',
          key: 'id',
        },
      },
      name: {
        type: Sequelize.STRING,
      },
      imageFront: {
        type: Sequelize.STRING,
      },
      imageBack: {
        type: Sequelize.STRING,
      },
      cardType: {
        type: Sequelize.STRING,
      },
      isDrawn: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface: any) {
    await queryInterface.dropTable('cards');
  },
};