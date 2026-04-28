'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LaporanKegiatan extends Model {
    static associate(models) {
      // Ke Parent
      LaporanKegiatan.belongsTo(models.Jadwal, { foreignKey: 'id_jadwal' });
      
      // Ke Children (Detail bukti)
      LaporanKegiatan.hasMany(models.LaporanModul, { foreignKey: 'id_laporan' });
      LaporanKegiatan.hasMany(models.LaporanAbsensiMonitoring, { foreignKey: 'id_laporan' });
      LaporanKegiatan.hasMany(models.Riwayat, { foreignKey: 'id_laporan' }); // Opsional untuk tracking
    }
  }
  LaporanKegiatan.init({
    id_laporan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_jadwal: DataTypes.INTEGER,
    tanggal: DataTypes.DATEONLY,
    pembuatan_modul: DataTypes.ENUM('Asisten', 'Dosen', 'Asisten & Dosen', 'Tidak'), // Tambahkan 'Tidak'
    jumlah_modul: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LaporanKegiatan',
    tableName: 'laporan_kegiatan',
    underscored: true,
  });
  return LaporanKegiatan;
};