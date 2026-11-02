const { sequelize } = require("../config/postgres")
const { Op, Sequelize } = require("sequelize");
const { suppliers, customers, products, cost_types, bank_accounts } = require("../db/models")

module.exports = {
  getCustomers : async (req, res) => {
    try {
      const data = await customers.findAll()
      res.status(200).json({
        status: true,
        data
      });
    } catch (error) {

      console.log(error);

      res.status(500).json({
        status: false,
        message: "Internal Server Error"
      });
    }
  },

  getProducts : async (req, res) => {
    try {
      const data = await products.findAll()
      res.status(200).json({
        status: true,
        data
      });
    } catch (error) {

      console.log(error);

      res.status(500).json({
        status: false,
        message: "Internal Server Error"
      });
    }
  },

  getCostTypes : async (req, res) => {
    try {
      const resp = await cost_types.findAll()
      res.status(200).json({
        status: true,
        data : resp
      });
    } catch (error) {

      console.log(error);

      res.status(500).json({
        status: false,
        message: "Internal Server Error"
      });
    }
  },

  getBankAccounts : async (req, res) => {
    try {
      const resp = await bank_accounts.findAll()
      res.status(200).json({
        status: true,
        data: resp
      })
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Internal Server Error"
      });
    }
  },

  getDrivers : async (req, res) => {
    try {
      const resp = await sequelize.query(
        `SELECT id, name, police_number FROM drivers`,
        {
          type: Sequelize.QueryTypes.SELECT
        }
      )
      res.status(200).json({
        status: true,
        data: resp
      })
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Internal Server Error"
      });
    }
  }
}