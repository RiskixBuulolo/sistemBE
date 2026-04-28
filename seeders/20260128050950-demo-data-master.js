'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. ISI DATA DETAIL ASISTEN (Tabel: DataAsisten)
    // Sesuai perbaikan kamu sebelumnya (Singular / tanpa 's')
    await queryInterface.bulkInsert('data_asisten', [
      {
        id_users: 3, // Milik Budi
        npm: '120501111',
        no_hp: '081211111111',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_users: 4, // Milik Ani
        npm: '120502222',
        no_hp: '081222222222',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 2. ISI DATA KELAS (Tabel: Kelas)
    // Pastikan nama tabelnya 'Kelas' (sesuai model kamu)
    return queryInterface.bulkInsert('Kelas', [
      {
        kode_mk: 'IF-101',
        nama_mk: 'Pemrograman Web',
        nama_dosen: 'Pak Web',
        nama_kelas: '4A',
        semester: '4',
        sks: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        kode_mk: 'IF-102',
        nama_mk: 'Basis Data',
        nama_dosen: 'Bu Data',
        nama_kelas: '4B',
        semester: '4',
        sks: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('data_asisten', null, {});
    await queryInterface.bulkDelete('Kelas', null, {});
  }
};