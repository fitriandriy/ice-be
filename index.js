require("dotenv").config();

const express = require('express')
const cors = require('cors')
const app = express()
const morgan = require("morgan")
const router = require("./routes")
const bodyParser = require("body-parser")
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({
  limit: "50mb"
}))
app.use(cors())
app.use(morgan("dev"))
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "50mb"
}));
app.use(router)

// 404
app.use((req, res) => {
  return res.status(404).json(({
    status: false,
    message: 'Not Found',
    err: `Cannot find ${req.url}`,
    data: null
  }))
})

// 500
app.use((err, req, res) => {
  return res.status(500).json(({
    status: false,
    message: 'Internal Server Error',
    err: err.message,
    data: null
  }))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

module.exports = app