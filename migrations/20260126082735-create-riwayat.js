'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('riwayat', {
      id_riwayat: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_users: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id_users' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_laporan: {
        type: Sequelize.INTEGER,
        allowNull: true, // Boleh null jika aktivitas bukan tentang laporan
        references: { model: 'laporan_kegiatan', key: 'id_laporan' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      aktivitas: {
        type: Sequelize.TEXT
      },
      waktu_aktivitas: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.dropTable('riwayat');
  }
};