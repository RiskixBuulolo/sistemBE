'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('123456', 10);

    return queryInterface.bulkInsert('Users', [
      // ID 1: KEPALA LABOR
      {
        username: 'kepala',
        email: 'kepala@labor.com',
        password: passwordHash,
        role: 'kepala_labor',
        nama_lengkap: 'Dr. Kepala Laboratorium',
        created_at: new Date(),
        updated_at: new Date()
      },
      // ID 2: STAFF LABOR
      {
        username: 'staff',
        email: 'staff@labor.com',
        password: passwordHash,
        role: 'staff_labor',
        nama_lengkap: 'Siti Staff Admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      // ID 3: ASISTEN 1 (Budi)
      {
        username: 'asisten_budi',
        email: 'budi@labor.com',
        password: passwordHash,
        role: 'asisten',
        nama_lengkap: 'Budi Santoso',
        created_at: new Date(),
        updated_at: new Date()
      },
      // ID 4: ASISTEN 2 (Ani)
      {
        username: 'asisten_ani',
        email: 'ani@labor.com',
        password: passwordHash,
        role: 'asisten',
        nama_lengkap: 'Ani Wijaya',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};