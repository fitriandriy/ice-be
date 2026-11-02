'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sales extends Model {
    static associate(models) {
      sales.belongsTo(models.customers, {
        foreignKey: 'customer_id',
        as: 'customer'
      })

      sales.belongsTo(models.drivers, {
        foreignKey: 'driver_id',
        as: 'driver'
      })

      sales.belongsTo(models.bank_accounts, {
        foreignKey: 'bank_account_id',
        as: 'bank_account'
      })

      sales.hasMany(models.sales_items, {
        foreignKey: 'transaction_id',
        as: 'sales_item'
      })

      sales.hasMany(models.sale_payments, {
        foreignKey: 'sales_id',
        as: 'sale_payment'
      })
    }
  }
  sales.init({
    transaction_number: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    customer_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    discount: DataTypes.INTEGER,
    driver_id: DataTypes.INTEGER,
    bank_account_id: DataTypes.INTEGER,
    tempo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'sales',
    timestamps: false
  });
  return sales;
};