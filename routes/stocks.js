const express = require("express")
const router = express.Router()
const stocks = require("../controllers/stocks.js")

router.post("/", stocks.addStock)
router.get("/", stocks.getStock)
router.delete("/:id", stocks.deleteStock)

module.exports = router