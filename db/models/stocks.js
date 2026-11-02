'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class stocks extends Model {
    static associate(models) {
      stocks.belongsTo(models.product_transactions, {
        foreignKey: "product_transaction_id",
        as: "stock"
      })
    }
  }
  stocks.init({
    date: DataTypes.DATEONLY,
    product_id: DataTypes.INTEGER,
    product_transaction_id: DataTypes.INTEGER,
    amount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'stocks',
    timestamps: false
  });
  return stocks;
};