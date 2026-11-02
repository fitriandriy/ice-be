'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class drivers extends Model {
    static associate(models) {
      drivers.hasMany(models.sales, {
        foreignKey: 'driver_id',
        as: 'sales'
      })

      drivers.hasMany(models.deliveries, {
        foreignKey: "driver_id",
        as: "delivery"
      })
    }
  }
  drivers.init({
    name: DataTypes.STRING,
    police_number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'drivers',
    timestamps: false
  });
  return drivers;
};