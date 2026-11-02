const express = require("express")
const router = express.Router()
const purchases = require("../controllers/purchases.js")

// router.get("/", purchases.getPurchasesByDate)
router.post("/", purchases.add)

module.exports = router