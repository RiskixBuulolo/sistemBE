'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Jadwal', [
      {
        // TARGET: BUDI
        // Budi adalah asisten pertama yg dibuat, jadi id_asisten = 1
        id_asisten: 1, 
        id_kelas: 1,
        hari: 'Senin',
        waktu_dimulai: '08:00',
        waktu_selesai: '10:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        // TARGET: ANI
        // Ani adalah asisten kedua, jadi id_asisten = 2
        id_asisten: 2, 
        id_kelas: 2,
        hari: 'Selasa',
        waktu_dimulai: '10:00',
        waktu_selesai: '12:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        // TARGET: BUDI LAGI
        id_asisten: 1, 
        id_kelas: 2,
        hari: 'Rabu',
        waktu_dimulai: '13:00',
        waktu_selesai: '15:00',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Jadwal', null, {});
  }
};