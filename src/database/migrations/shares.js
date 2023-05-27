'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Shares', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        startingValue: 2,
      },
      symbol: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.bulkInsert('Shares', [
      {
        id: 1,
        symbol: 'TRY',
        name: 'turkish lira',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {
      updateOnDuplicate: ['symbol', 'name', 'updatedAt'],
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Shares');
  }
};