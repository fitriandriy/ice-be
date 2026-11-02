const express = require("express")
const router = express.Router()
// const users = require("./users")
const purchases = require("./purchases")
const sales = require("./sales")
const basic_data = require("./basic_data")
const costs = require("./costs")
const stocks = require("./stocks")
const deliveries = require("./deliveries")

router.get("/", (req, res) => {
  res.status(200).json({
    status:true,
    message: "Wellcome to TAXIFY DB!"
  })
})

// router.use("/", users)
router.use("/purchases", purchases)
router.use("/sales", sales)
router.use("/data", basic_data)
router.use("/costs", costs)
router.use("/stock", stocks)
router.use("/deliveries", deliveries)

module.exports = router