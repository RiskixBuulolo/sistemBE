'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kelas extends Model {
    static associate(models) {
      Kelas.hasMany(models.Jadwal, {
        foreignKey: 'id_kelas',
        sourceKey: 'id_kelas',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Kelas.init({
    id_kelas: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kode_mk: DataTypes.STRING,   // Boleh null
    nama_mk: DataTypes.STRING,   // Dari Excel 'Matakuliah'
    nama_dosen: DataTypes.STRING,// Dari Excel 'Dosen'
    nama_kelas: DataTypes.STRING,// Dari Excel 'Kelas'
    semester: DataTypes.STRING,  // Boleh null
    sks: DataTypes.INTEGER,      // Default 1 (Praktikum)
    
    // === KOLOM BARU ===
    hari_jam: DataTypes.STRING,  // Dari Excel 'Hari' + 'Jam'
    ruangan: DataTypes.STRING    // Dari Excel 'Ruangan'
  }, {
    sequelize,
    modelName: 'Kelas',
    tableName: 'kelas',
    underscored: true,
  });
  return Kelas;
};