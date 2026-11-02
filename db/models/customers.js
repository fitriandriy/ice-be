'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customers extends Model {
    static associate(models) {
      customers.hasMany(models.sales, {
        foreignKey: 'customer_id',
        as: 'sales'
      })
    }
  }
  customers.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    is_cv: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'customers',
    timestamps: false
  });
  return customers;
};