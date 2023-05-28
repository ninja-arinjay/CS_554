const express = require("express");
const router = express.Router();
const { createUser, checkUser, validation } = require("../data/users");

router.post("/", async (req, res) => {
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  try {
    validation(username,name,password);
    const authenticated = await checkUser(username, password);
    if (authenticated) {
      res.status(401).json({ error: "User already Exists." });
    } else{
      const user = await createUser( username, name, password );
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(500).json({ error: "Could not create user" });
      }
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;