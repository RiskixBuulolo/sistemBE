'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jadwal extends Model {
    static associate(models) {
      Jadwal.belongsTo(models.DataAsisten, { foreignKey: 'id_asisten' });

      Jadwal.belongsTo(models.Kelas, { 
        foreignKey: 'id_kelas',
        as: 'Kelas',
        targetKey: 'id_kelas'
      });

      Jadwal.hasMany(models.Absensi, { foreignKey: 'id_jadwal' });
      Jadwal.hasMany(models.LaporanKegiatan, { foreignKey: 'id_jadwal' });

      // === PERBAIKAN DI SINI (TAMBAHKAN 'as') ===
      Jadwal.hasOne(models.LaporanRps, { 
        foreignKey: 'id_jadwal',
        as: 'LaporanRps' // <--- Paksa nama key menjadi 'LaporanRps'
      });

      Jadwal.hasOne(models.LaporanKontrak, { 
        foreignKey: 'id_jadwal',
        as: 'LaporanKontrak' // <--- Tambahkan juga disini biar konsisten
      });
    }
  }
  Jadwal.init({
    id_jadwal: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_asisten: DataTypes.INTEGER,
    id_kelas: DataTypes.INTEGER,
    hari: DataTypes.STRING,
    waktu_dimulai: DataTypes.TIME,
    waktu_selesai: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'Jadwal',
    tableName: 'jadwal',
    underscored: true,
  });
  return Jadwal;
};