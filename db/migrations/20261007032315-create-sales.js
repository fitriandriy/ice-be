'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      date: {
        type: Sequelize.DATEONLY
      },
      customer_id: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      discount: {
        type: Sequelize.INTEGER
      },
      driver_id: {
        type: Sequelize.INTEGER
      },
      bank_account_id: {
        type: Sequelize.INTEGER
      },
      tempo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sales');
  }
};