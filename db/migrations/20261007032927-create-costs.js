'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('costs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY
      },
      transaction_number: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      debit: {
        type: Sequelize.INTEGER
      },
      credit: {
        type: Sequelize.INTEGER
      },
      bank_account_id: {
        type: Sequelize.INTEGER
      },
      cost_type_id: {
        type: Sequelize.INTEGER
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('costs');
  }
};