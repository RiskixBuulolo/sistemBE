'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LaporanKontrak extends Model {
    static associate(models) {
      LaporanKontrak.belongsTo(models.Jadwal, { foreignKey: 'id_jadwal' });
    }
  }
  LaporanKontrak.init({
    id_kontrak: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_jadwal: DataTypes.INTEGER,
    file_kontrak: DataTypes.STRING,
    uploaded_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'LaporanKontrak',
    tableName: 'laporan_kontrak',
    underscored: true,
  });
  return LaporanKontrak;
};