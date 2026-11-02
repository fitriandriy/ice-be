'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cost_types extends Model {

    static associate(models) {
      cost_types.hasMany(models.costs, {
        foreignKey: 'cost_type_id',
        as: 'costs'
      })
    }
  }
  cost_types.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'cost_types',
    timestamps: false
  });
  return cost_types;
};