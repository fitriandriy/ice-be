const express = require("express")
const router = express.Router()
const purchases = require("../controllers/purchases.js")

router.get("/", purchases.getAll)
router.post("/", purchases.add)
router.put("/", purchases.update)
router.delete("/:id", purchases.del)

module.exports = router