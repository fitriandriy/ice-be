const express = require("express")
const router = express.Router()
const sales = require("../controllers/sales.js")

router.get("/", sales.getAll)
router.post("/payment", sales.inputSalePayment)
router.post("/input", sales.input)
router.delete("/:id", sales.del)

module.exports = router