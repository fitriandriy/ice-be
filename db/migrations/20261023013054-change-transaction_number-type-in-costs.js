"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("costs", "transaction_number", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("costs", "transaction_number", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};