'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LaporanAbsensiMonitoring extends Model {
    static associate(models) {
      LaporanAbsensiMonitoring.belongsTo(models.LaporanKegiatan, { foreignKey: 'id_laporan' });
    }
  }
  LaporanAbsensiMonitoring.init({
    id_absmon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_laporan: DataTypes.INTEGER,
    jenis_file: DataTypes.ENUM('Absensi', 'Monitoring'),
    file_absmon: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LaporanAbsensiMonitoring',
    tableName: 'laporan_absensi_monitoring',
    underscored: true,
  });
  return LaporanAbsensiMonitoring;
};