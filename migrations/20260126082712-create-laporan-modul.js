'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('laporan_modul', {
      id_modul: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_laporan: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'laporan_kegiatan', key: 'id_laporan' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      file_modul: {
        type: Sequelize.STRING
      },
      no_modul: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('laporan_modul');
  }
};