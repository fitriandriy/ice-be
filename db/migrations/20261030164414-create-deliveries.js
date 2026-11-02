'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY
      },
      delivery_number: {
        type: Sequelize.STRING
      },
      driver_id: {
        type: Sequelize.INTEGER
      },
      muat_10kg: {
        type: Sequelize.INTEGER
      },
      muat_5kg: {
        type: Sequelize.INTEGER
      },
      jual_10kg: {
        type: Sequelize.INTEGER
      },
      jual_5kg: {
        type: Sequelize.INTEGER
      },
      retur10kg: {
        type: Sequelize.INTEGER
      },
      retur5kg: {
        type: Sequelize.INTEGER
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('deliveries');
  }
};