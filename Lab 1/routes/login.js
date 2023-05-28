const express = require("express");
const router = express.Router();
const { checkUser, getUserByUsername, validation } = require("../data/users");

router.post("/", async (req, res) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password;

  try {
    validation(username,"test",password);
    const authenticated = await checkUser(username, password);
    const userDetails = await getUserByUsername(
      username
    );

    delete userDetails.password;
    req.session.userId = userDetails._id;
    req.session.username = username;

    if (authenticated) {
      res.status(200).json(userDetails);
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

module.exports = router;