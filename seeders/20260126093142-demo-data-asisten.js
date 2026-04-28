'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Asumsi: Karena kita baru reset DB, 
    // User 1 = Kepala, User 2 = Staff, User 3 = Asisten.
    // Maka id_users untuk asisten adalah 3.
    
    return queryInterface.bulkInsert('data_asisten', [{
      id_users: 3, // ID milik 'asisten@labor.com'
      npm: '123456789',
      no_hp: '081234567890',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('data_asisten', null, {});
  }
};