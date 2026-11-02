'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('bank_accounts', [
      {
        "id": 1,
        "account_number": "2632368888",
        "bank": "BCA",
        "name": "CV SRI AYU SEJATI"
      },
      {
        "id": 2,
        "account_number": "1430036575858",
        "bank": "MANDIRI",
        "name": "HERY WIJAYA"
      },
      {
        "id": 3,
        "account_number": "",
        "bank": "KAS PABRIK",
        "name": ""
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('bank_accounts', null, {});
  }
};
