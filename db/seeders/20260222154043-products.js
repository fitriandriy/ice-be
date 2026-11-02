'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('products', [
      { id: 1, name: "BERAS IR64 @50", weight: 50 },
      { id: 2, name: "BERAS MEMBRAMO @50 KG", weight: 50 },
      { id: 3, name: "BERAS PS @25 KG HIJAU", weight: 25 },
      { id: 4, name: "BERAS PS @10 KG HIJAU", weight: 10 },
      { id: 5, name: "BERAS PS @5 KG HIJAU", weight: 5 },
      { id: 6, name: "BERAS PS @25 KG MERAH", weight: 25 },
      { id: 7, name: "BERAS PS @10 KG MERAH", weight: 10 },
      { id: 8, name: "BERAS PS @5 KG MERAH", weight: 5 },
      { id: 9, name: "BERAS TIGA MANGGA @25 KG", weight: 25 },
      { id: 10, name: "BERAS TIGA MANGGA @10 KG", weight: 10 },
      { id: 11, name: "BROKEN @50 KG PREMIUM", weight: 50 },
      { id: 12, name: "BRONIR @50 KG PREMIUM", weight: 50 },
      { id: 13, name: "BRONIR @50 KG NON KIBI", weight: 50 },
      { id: 14, name: "BIG BROKEN EKONOMI", weight: 25 },
      { id: 15, name: "REJECT @50 KG", weight: 50 },
      { id: 16, name: "BERAS DUA LEBAH MADU @25 KG", weight: 25 },
      { id: 17, name: "BERAS DUA LEBAH MADU @10 KG", weight: 10 },
      { id: 18, name: "MENIR KETAN", weight: 50 },
      { id: 19, name: "MENIR KIBI", weight: 50 },
      { id: 20, name: "TEPUNG BERAS", weight: 10 },
      { id: 21, name: "KANJI @25KG", weight: 50 },
      { id: 22, name: "BERAS KIBI POLOS @25 KG", weight: 25 },
      { id: 23, name: "REJECT KETAN", weight: 50 },
      { id: 24, name: "KATUL KEBI", weight: 50 },
      { id: 25, name: "MENDANG", weight: 50 },
      { id: 26, name: "BERAS PS @25 KG KUNING", weight: 25 },
      { id: 27, name: "BERAS PS @10 KG KUNING", weight: 10 },
      { id: 28, name: "BERAS PS @5 KG KUNING", weight: 5 },
      { id: 29, name: "BERAS TIGA MANGGA @5 KG", weight: 5 },
      { id: 30, name: "KETAN PUTIH", weight: 50 },
      { id: 31, name: "KETAN PS", weight: 25 },
      { id: 32, name: "TEPUNG (DUS)", weight: 1 }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};