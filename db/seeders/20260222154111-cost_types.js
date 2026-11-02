'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('cost_types', [
      { id: 1, name: "Beban Overhead" },
      { id: 2, name: "Beban Gaji Karyawan" },
      { id: 3, name: "Beban Upah Harian" },
      { id: 4, name: "Beban Kantor dan Administrasi" },
      { id: 5, name: "Beban PLN, PDAM, TELKOM" },
      { id: 6, name: "Beban Lain-lain" },
      { id: 7, name: "Beban Ekspedisi" },
      { id: 8, name: "Beban Perjalanan" },
      { id: 9, name: "Beban Perawatan Kendaraan" },
      { id: 10, name: "Beban Pembelian Sak" },
      { id: 11, name: "Beban Perawatan Mesin" },
      { id: 12, name: "Beban Perawatan Gedung" },
      { id: 13, name: "Beban Administrasi Bank" },
      { id: 14, name: "Beban Perawatan Peralatan" },
      { id: 15, name: "Beban Promosi" },
      { id: 16, name: "Beban Bunga Kredit" },
      { id: 17, name: "Beban Kurang Bayar PPH 2021/2022" },
      { id: 18, name: "Jaminan Bulog" },
      { id: 19, name: "KKB/dll" }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cost_types', null, {});
  }
};