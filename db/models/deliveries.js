'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class deliveries extends Model {

    static associate(models) {
      deliveries.belongsTo(models.drivers, {
        foreignKey: "driver_id",
        as: "driver"
      })
    }
  }
  deliveries.init({
    date: DataTypes.DATEONLY,
    delivery_number: DataTypes.STRING,
    driver_id: DataTypes.INTEGER,
    muat_10kg: DataTypes.INTEGER,
    muat_5kg: DataTypes.INTEGER,
    jual_10kg: DataTypes.INTEGER,
    jual_5kg: DataTypes.INTEGER,
    retur10kg: DataTypes.INTEGER,
    retur5kg: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'deliveries',
    timestamps: false
  });
  return deliveries;
};