'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bank_accounts extends Model {
    static associate(models) {
      bank_accounts.hasMany(models.sales, {
        foreignKey: 'bank_account_id',
        as: 'sales'
      })

      bank_accounts.hasMany(models.costs, {
        foreignKey: 'bank_account_id',
        as: 'costs'
      })

      bank_accounts.hasMany(models.sale_payments, {
        foreignKey: 'bank_account_id',
        as: 'sale_payments'
      })
    }
  }
  bank_accounts.init({
    account_number: DataTypes.STRING,
    bank: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'bank_accounts',
    timestamps: false
  });
  return bank_accounts;
};