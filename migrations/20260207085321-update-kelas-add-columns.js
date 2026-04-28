'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Tambah kolom baru sesuai Excel
    await queryInterface.addColumn('kelas', 'hari_jam', { type: Sequelize.STRING });
    await queryInterface.addColumn('kelas', 'ruangan', { type: Sequelize.STRING });
    
    // 2. Ubah kode_mk & semester jadi boleh NULL (opsional, jaga-jaga kalau Excel kosong)
    await queryInterface.changeColumn('kelas', 'kode_mk', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('kelas', 'semester', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('kelas', 'hari_jam');
    await queryInterface.removeColumn('kelas', 'ruangan');
    // Revert changeColumn agak ribet di MySQL, biasanya dibiarkan saja
  }
};