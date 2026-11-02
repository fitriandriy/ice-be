'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sales_items extends Model {
    static associate(models) {
      sales_items.belongsTo(models.sales, {
        foreignKey: 'transaction_id',
        as: 'sales'
      })

      sales_items.belongsTo(models.products, {
        foreignKey: 'product_id',
        as: 'product'
      })
    }
  }
  sales_items.init({
    transaction_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'sales_items',
    timestamps: false
  });
  return sales_items;
};