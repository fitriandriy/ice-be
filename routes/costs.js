const express = require("express")
const router = express.Router()
const costs = require("../controllers/costs.js")

router.post("/import", costs.add)
router.post("/input", costs.inputData)
router.post("/input_cash_in", costs.inputCashIn)
router.get("/", costs.getAll)
router.put("/", costs.edit)
router.delete("/:id", costs.del)
router.get("/latest_id/:date", costs.latestID)

module.exports = router