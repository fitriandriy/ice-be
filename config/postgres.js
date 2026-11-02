const {Sequelize, QueryTypes} = require('sequelize');
const {
  DB_HOST,
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DIALECT = "postgres",
  DB_PORT = 5432
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  port: DB_PORT
});

module.exports = {sequelize, queryTypes: QueryTypes};