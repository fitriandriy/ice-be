const express = require("express")
const router = express.Router()
const deliveries = require("../controllers/deliveries.js")

router.post("/", deliveries.addData)
router.get("/", deliveries.getData)
router.put("/:id", deliveries.updateData)
router.delete("/:id", deliveries.deleteData)

module.exports = router