const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(400).json({ error: "Error logging out" });
    } else {
      res.status(200).json({ message: "Logged out successfully" });
    }
  });
});

module.exports = router;