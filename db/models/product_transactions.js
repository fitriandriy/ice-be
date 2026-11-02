'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product_transactions extends Model {
    static associate(models) {
      product_transactions.hasMany(models.stocks, {
        foreignKey: "product_transaction_id",
        as: "stock"
      })
    }
  }
  product_transactions.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'product_transactions',
    timestamps: false
  });
  return product_transactions;
};