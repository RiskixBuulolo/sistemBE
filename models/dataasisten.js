'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DataAsisten extends Model {
    static associate(models) {
      // Data Asisten milik 1 User
      DataAsisten.belongsTo(models.User, { foreignKey: 'id_users' });
      // 1 Asisten punya banyak Jadwal mengajar
      DataAsisten.hasMany(models.Jadwal, { foreignKey: 'id_asisten' });
    }
  }
  DataAsisten.init({
    id_asisten: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_users: DataTypes.INTEGER,
    npm: DataTypes.STRING,
    no_hp: DataTypes.STRING,
    status: DataTypes.ENUM('Aktif', 'Tidak Aktif')
  }, {
    sequelize,
    modelName: 'DataAsisten',
    tableName: 'data_asisten',
    underscored: true,
  });
  return DataAsisten;
};