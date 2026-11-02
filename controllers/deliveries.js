const { Op } = require("sequelize");
const { deliveries } = require("../db/models")
const { sequelize } = require("../config/postgres")

const generateTransactionNumber = async (date) => {
  // date format: YYYY-MM-DD
  const [year, month, day] = date.split("-");

  // Convert YYYY-MM-DD to DDMMYY
  const dateCode = `${day}${month}${year.slice(-2)}`;
  const prefix = `DO-${dateCode}-`;

  // Get transaction numbers for this date
  const data = await deliveries.findAll({
    attributes: ["delivery_number"],
    where: {
      date,
      delivery_number: {
        [Op.like]: `${prefix}%`,
      },
    },
  });

  // Find the highest existing sequence number
  const lastNumber = data.reduce((max, sale) => {
    const sequence = Number(
      sale.delivery_number.slice(prefix.length)
    );

    return Number.isInteger(sequence) && sequence > max
      ? sequence
      : max;
  }, 0);

  // Increment the sequence
  const nextNumber = String(lastNumber + 1).padStart(3, "0");

  return `${prefix}${nextNumber}`;
};

module.exports = {
  getData : async (req, res) => {
    try {
      const {date} = req.query

      const data = await deliveries.findAll({where: {date}, order: [['delivery_number', 'ASC']]})

      const recap = await sequelize.query(
        `SELECT
            d.driver_id,
            dr.name AS driver_name,
            SUM((COALESCE(d.jual_10kg, 0) * 10) + (COALESCE(d.jual_5kg, 0) * 5)) AS total_terjual,
            SUM((COALESCE(d.retur10kg, 0) * 10) + (COALESCE(d.retur5kg, 0) * 5)) AS total_retur_rusak,
            RANK() OVER (
                ORDER BY SUM(
                    (COALESCE(d.jual_10kg, 0) * 10) +
                    (COALESCE(d.jual_5kg, 0) * 5)
                ) DESC
            ) AS ranking
        FROM deliveries d
        JOIN drivers dr ON dr.id = d.driver_id
        GROUP BY d.driver_id, dr.name
        ORDER BY total_terjual DESC;`,
        { type: sequelize.QueryTypes.SELECT }
      )

      res.status(200).json({
        status: true,
        message: "success",
        data,
        recap
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  addData: async (req, res) => {
    try {
      const { date, driver_id, muat_10kg, muat_5kg } = req.body
      const delivery_number = await generateTransactionNumber(date)

      await deliveries.create({
        date,
        delivery_number,
        driver_id,
        muat_10kg,
        muat_5kg
      })

      res.status(200).json({
        status: true,
        message: "success",
        delivery_number
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  deleteData: async (req, res) => {
    try {
      const {id} = req.params

      const data = await deliveries.findOne({ where : {id} })

      if (!data) {
        return res.status(404).json({
          status: false,
          message: `Data with id ${id} not found.`
        })
      }

      await deliveries.destroy({where: {id}})

      return res.status(200).json({
        status: true,
        message: 'success'
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  updateData: async (req, res) => {
    try {
      const { id } = req.params
      const {terjual_10kg, terjual_5kg, retur_10kg, retur_5kg} = req.body

      const resp = await deliveries.update(
        {
          jual_10kg: terjual_10kg, 
          jual_5kg: terjual_5kg, 
          retur10kg: retur_10kg, 
          retur5kg: retur_5kg
        },
        {where: {id}}
      )

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
  }
}