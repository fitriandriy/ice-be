const express = require("express")
const router = express.Router()
const sales = require("../controllers/basic_data.js")

router.get("/customers", sales.getCustomers)
router.get("/products", sales.getProducts)
router.get("/cost_types", sales.getCostTypes)
router.get("/bank_accounts", sales.getBankAccounts)
router.get("/drivers", sales.getDrivers)

module.exports = router