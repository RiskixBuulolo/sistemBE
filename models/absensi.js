'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Absensi extends Model {
    static associate(models) {
      Absensi.belongsTo(models.Jadwal, { foreignKey: 'id_jadwal' });
    }
  }
  Absensi.init({
    id_absensi: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_jadwal: DataTypes.INTEGER,
    tanggal: DataTypes.DATEONLY,
    waktu_absen: DataTypes.TIME,
    status: DataTypes.ENUM('Hadir', 'Izin', 'Sakit', 'Alpha', 'Hadir - Terlambat'),
    foto_absensi: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    lokasi_valid: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Absensi',
    tableName: 'absensi',
    underscored: true,
  });
  return Absensi;
};