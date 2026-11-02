'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        "id": 1,
        "name": "fitri",
        "password": "fitri",
        "role": "admin"
      },
      {
        "id": 2,
        "name": "aldo",
        "password": "aldo",
        "role": "admin"
      },
      {
        "id": 3,
        "name": "admin",
        "password": "adminsas",
        "role": "superadmin"
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
