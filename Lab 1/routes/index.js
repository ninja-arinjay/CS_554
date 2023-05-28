const path = require("path");
const loginRoute = require("./login");
const logoutRoute = require("./logout");
const recipeRoute = require("./recipes");
const signupRoute = require("./signup");
 

const constructorMethod = (app) => {
    app.use("/logout", logoutRoute);
    app.use("/recipes", recipeRoute);
    app.use("/login", loginRoute);
    app.use("/signup", signupRoute);
    app.use("*", (req, res) => {
      res.status(404).json({ error: "Not found" });
    });
};

module.exports = constructorMethod;
