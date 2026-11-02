'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class costs extends Model {
    static associate(models) {
      costs.belongsTo(models.bank_accounts, {
        foreignKey: 'bank_account_id',
        as: 'bank_account'
      })

      costs.belongsTo(models.cost_types, {
        foreignKey: 'cost_type_id',
        as: 'cost_type'
      })
    }
  }
  costs.init({
    date: DataTypes.DATEONLY,
    transaction_number: DataTypes.STRING,
    description: DataTypes.STRING,
    debit: DataTypes.INTEGER,
    credit: DataTypes.INTEGER,
    bank_account_id: DataTypes.INTEGER,
    cost_type_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'costs',
    timestamps: false
  });
  return costs;
};