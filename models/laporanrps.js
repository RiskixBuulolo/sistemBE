'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LaporanRps extends Model {
    static associate(models) {
      LaporanRps.belongsTo(models.Jadwal, { foreignKey: 'id_jadwal' });
    }
  }
  LaporanRps.init({
    id_rps: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_jadwal: DataTypes.INTEGER,
    file_rps: DataTypes.STRING,
    uploaded_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'LaporanRps',
    tableName: 'laporan_rps',
    underscored: true,
  });
  return LaporanRps;
};