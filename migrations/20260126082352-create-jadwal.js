'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jadwal', {
      id_jadwal: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_asisten: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'data_asisten', key: 'id_asisten' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_kelas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'kelas', key: 'id_kelas' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      hari: {
        type: Sequelize.STRING
      },
      waktu_dimulai: {
        type: Sequelize.TIME
      },
      waktu_selesai: {
        type: Sequelize.TIME
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
    await queryInterface.dropTable('jadwal');
  }
};