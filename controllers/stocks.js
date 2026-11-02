const { sequelize } = require("../config/postgres")
const { Op, QueryTypes } = require("sequelize");
const { products, stocks, product_transactions } = require("../db/models");

module.exports = {
  addStock: async (req, res) => {
    try {
      const { date, product_id, product_transaction_id, amount } = req.body
      
      await stocks.create({
        date, product_id, product_transaction_id, amount
      })

      res.status(200).json({
        status: true,
        message: "success"
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  getStock: async (req, res) => {
    try {
      const {startDate, endDate} = req.query

      const whereClause = {};

      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const resp = await stocks.findAll({
        where: whereClause
      })
      
      // stok = hasil produksi - total jual - retur rusak
      const stok10kg = await sequelize.query(`
          SELECT
          COALESCE((
              SELECT SUM(amount)
              FROM stocks
              WHERE product_id = 1
                AND product_transaction_id = 1
          ), 0)
          -
          COALESCE((
              SELECT SUM(quantity)
              FROM sales_items
              WHERE product_id = 1
          ), 0)
          -
          COALESCE((
              SELECT SUM(amount)
              FROM stocks
              WHERE product_id = 1
                AND product_transaction_id = 2
          ), 0)
          AS stock;
        `,
        {
          type: QueryTypes.SELECT
        }
      )

      const stok5kg = await sequelize.query(`
          SELECT
          COALESCE((
              SELECT SUM(amount)
              FROM stocks
              WHERE product_id = 2
                AND product_transaction_id = 1
          ), 0)
          -
          COALESCE((
              SELECT SUM(quantity)
              FROM sales_items
              WHERE product_id = 2
          ), 0)
          -
          COALESCE((
              SELECT SUM(amount)
              FROM stocks
              WHERE product_id = 2
                AND product_transaction_id = 2
          ), 0)
          AS stock;
        `,
        {
          type: QueryTypes.SELECT
        }
      )

      res.status(200).json({
        status: true,
        message: "success",
        data: {
          stock: [
            {
              product_id: 1,
              stock: stok10kg
            },
            {
              product_id: 2,
              stock: stok5kg
            }
          ],
          data: resp
        }
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  deleteStock: async (req, res) => {
    try {
      const {id} = req.params

      await stocks.destroy({where: {id}})

      res.status(200).json({
        status: true,
        message: "success"
      })
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  }
}