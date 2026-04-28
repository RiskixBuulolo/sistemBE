'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 1 User punya 1 Data Asisten
      User.hasOne(models.DataAsisten, { foreignKey: 'id_users' });
      // 1 User bisa punya banyak Riwayat aktivitas
      User.hasMany(models.Riwayat, { foreignKey: 'id_users' });
    }
  }
  User.init({
    id_users: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM('kepala_labor', 'staff_labor', 'asisten'),
    nama_lengkap: DataTypes.STRING,

    // === TAMBAHKAN 2 BARIS INI ===
    otp_code: DataTypes.STRING,
    otp_expiration: DataTypes.DATE
    // =============================

  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true, // Agar otomatis membaca created_at & updated_at
  });
  return User;
};