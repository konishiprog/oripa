"use strict";

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      const gachas: any[] = await queryInterface.sequelize.query(
        'SELECT * FROM "gachas"',
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const cards: any[] = await queryInterface.sequelize.query(
        'SELECT * FROM "cards"',
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const gachaIdMap: Record<number, string> = {};

      await queryInterface.dropTable("cards", { cascade: true, transaction });
      await queryInterface.dropTable("gachas", { cascade: true, transaction });

      await queryInterface.createTable(
        "gachas",
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          headerImage: {
            type: Sequelize.TEXT,
          },
          name: {
            type: Sequelize.STRING,
          },
          consumptionType: {
            type: Sequelize.STRING,
          },
          cost: {
            type: Sequelize.INTEGER,
          },
          isPublic: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          publishStart: {
            type: Sequelize.DATE,
          },
          publishEnd: {
            type: Sequelize.DATE,
          },
        },
        { transaction },
      );

      for (const gacha of gachas) {
        const newId = uuidv4();
        gachaIdMap[gacha.id] = newId;

        await queryInterface.sequelize.query(
          `INSERT INTO "gachas" (id, "headerImage", name, "consumptionType", cost, "isPublic", "publishStart", "publishEnd") VALUES (:id, :headerImage, :name, :consumptionType, :cost, :isPublic, :publishStart, :publishEnd)`,
          {
            replacements: {
              id: newId,
              headerImage: gacha.headerImage,
              name: gacha.name,
              consumptionType: gacha.consumptionType,
              cost: gacha.cost,
              isPublic: gacha.isPublic,
              publishStart: gacha.publishStart,
              publishEnd: gacha.publishEnd,
            },
            transaction,
          },
        );
      }

      await queryInterface.createTable(
        "cards",
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          gachaId: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
          },
          imageFront: {
            type: Sequelize.TEXT,
          },
          imageBack: {
            type: Sequelize.TEXT,
          },
          cardType: {
            type: Sequelize.STRING,
          },
          exchangeType: {
            type: Sequelize.STRING,
          },
          exchangePoints: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          isDrawn: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
        },
        { transaction },
      );

      for (const card of cards) {
        const newCardId = uuidv4();
        const newGachaId = gachaIdMap[card.gachaId];

        await queryInterface.sequelize.query(
          `INSERT INTO "cards" (id, "gachaId", name, "imageFront", "imageBack", "cardType", "exchangeType", "exchangePoints", "isDrawn") VALUES (:id, :gachaId, :name, :imageFront, :imageBack, :cardType, :exchangeType, :exchangePoints, :isDrawn)`,
          {
            replacements: {
              id: newCardId,
              gachaId: newGachaId,
              name: card.name,
              imageFront: card.imageFront,
              imageBack: card.imageBack,
              cardType: card.cardType,
              exchangeType: card.exchangeType,
              exchangePoints: card.exchangePoints,
              isDrawn: card.isDrawn,
            },
            transaction,
          },
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface: any, Sequelize: any) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable("cards", { cascade: true, transaction });
      await queryInterface.dropTable("gachas", { cascade: true, transaction });

      await queryInterface.createTable(
        "gachas",
        {
          id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
          },
          headerImage: {
            type: Sequelize.TEXT,
          },
          name: {
            type: Sequelize.STRING,
          },
          consumptionType: {
            type: Sequelize.STRING,
          },
          cost: {
            type: Sequelize.INTEGER,
          },
          isPublic: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          publishStart: {
            type: Sequelize.DATE,
          },
          publishEnd: {
            type: Sequelize.DATE,
          },
        },
        { transaction },
      );

      await queryInterface.createTable(
        "cards",
        {
          id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
          },
          gachaId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
          },
          imageFront: {
            type: Sequelize.TEXT,
          },
          imageBack: {
            type: Sequelize.TEXT,
          },
          cardType: {
            type: Sequelize.STRING,
          },
          exchangeType: {
            type: Sequelize.STRING,
          },
          exchangePoints: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          isDrawn: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
        },
        { transaction },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
