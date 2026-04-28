'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('laporan_kegiatan', {
      id_laporan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_jadwal: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'jadwal', key: 'id_jadwal' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tanggal: {
        type: Sequelize.DATEONLY
      },
      pembuatan_modul: {
        type: Sequelize.ENUM('Asisten', 'Dosen', 'Asisten & Dosen', 'Tidak'),
        defaultValue: 'Tidak'
      },
      jumlah_modul: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('laporan_kegiatan');
  }
};