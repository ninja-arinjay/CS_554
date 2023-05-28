const marvelRoutes = require("./marvel");
const constructorMethod = (app) => {
  app.use("/marvel", marvelRoutes);
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found!!" });
  });
};

module.exports = constructorMethod;