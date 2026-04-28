'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Riwayat extends Model {
    static associate(models) {
      Riwayat.belongsTo(models.User, { foreignKey: 'id_users', as: 'User' });
      Riwayat.belongsTo(models.LaporanKegiatan, { foreignKey: 'id_laporan' });
    }
  }
  Riwayat.init({
    id_riwayat: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_users: DataTypes.INTEGER,
    id_laporan: DataTypes.INTEGER,
    aktivitas: DataTypes.TEXT,
    waktu_aktivitas: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Riwayat',
    tableName: 'riwayat',
    underscored: true,
  });
  return Riwayat;
};