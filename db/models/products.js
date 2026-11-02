'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    static associate(models) {
      products.hasMany(models.sales_items, {
        foreignKey: 'product_id',
        as: 'sales_item'
      })
    }
  }
  products.init({
    name: DataTypes.STRING,
    weight: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'products',
    timestamps: false
  });
  return products;
};