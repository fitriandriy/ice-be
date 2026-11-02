'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sale_payments extends Model {
    static associate(models) {
      sale_payments.belongsTo(models.sales, {
        foreignKey: 'sales_id',
        as: 'sale'
      })

      sale_payments.belongsTo(models.bank_accounts, {
        foreignKey: 'bank_account_id',
        as: 'bank_account'
      })
    }
  }
  sale_payments.init({
    date: DataTypes.DATEONLY,
    sales_id: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    bank_account_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'sale_payments',
    timestamps: false
  });
  return sale_payments;
};