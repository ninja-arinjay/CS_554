const express = require("express");
const router = express.Router();
const redis = require("redis");
const client = redis.createClient();
client.connect().then(() => {});
// Most Accessed
router.route("/").get(async (req, res) => {
  //top 10 searched items
  const mostAcceedList = await client.zRange("mostAccessed", 0, 9, {
    REV: true,
  });
  //console.log("mostAcceedList,,,,", mostAcceedList);
  return res.status(200).json(mostAcceedList);
});

module.exports = router;