'use strict';

const { CARD_STATUS } = require('../constants/card');

module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    await queryInterface.sequelize.transaction(async (transaction: any) => {
      await queryInterface.removeColumn('Cards', 'isDrawn', { transaction });
      await queryInterface.addColumn(
        'Cards',
        'isDrawn',
        {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: CARD_STATUS.NOT_DRAWN,
        },
        { transaction }
      );
    });
  },

  async down(queryInterface: any, Sequelize: any) {
    await queryInterface.sequelize.transaction(async (transaction: any) => {
      await queryInterface.removeColumn('Cards', 'isDrawn', { transaction });
      await queryInterface.addColumn(
        'Cards',
        'isDrawn',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        { transaction }
      );
    });
  },
};
