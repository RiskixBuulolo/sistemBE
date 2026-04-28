'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('data_asisten', {
      id_asisten: {
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
      npm: {
        type: Sequelize.STRING,
        unique: true
      },
      no_hp: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('Aktif', 'Tidak Aktif'),
        defaultValue: 'Aktif'
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
    await queryInterface.dropTable('data_asisten');
  }
};