'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LaporanModul extends Model {
    static associate(models) {
      LaporanModul.belongsTo(models.LaporanKegiatan, { foreignKey: 'id_laporan' });
    }
  }
  LaporanModul.init({
    id_modul: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_laporan: DataTypes.INTEGER,
    file_modul: DataTypes.STRING,
    no_modul: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LaporanModul',
    tableName: 'laporan_modul',
    underscored: true,
  });
  return LaporanModul;
};