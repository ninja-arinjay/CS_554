const express = require("express");
const app = express();
var cors = require("cors");
const configRoutes = require("./routes");
const redis = require("redis");



const port = 3001;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configRoutes(app);

app.listen(port, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${port}`);
});