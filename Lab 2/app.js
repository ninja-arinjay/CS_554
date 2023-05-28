const express = require("express");
const app = express();
const configRoutes = require("./routes");
const session = require("express-session");
const { request } = require("express");
const port = 3000;
const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => {});
app.use(express.json());

app.use(
  session({
    name: "AuthCookie",
    secret: "This is not a secret anymore!",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 600000 },
  })
);


app.use(express.urlencoded({ extended: true }));

app.post("/signup", (req, res, next) => {
  if (req.session.user) {
    return res.status(400).json({
      error: "User is already logged In.",
    });
  } else {
    next();
  }
});

app.post("/login", (req, res, next) => {
  if (req.session.user) {
    return res.status(400).json({
      error: "User is already Logged In."
    });
  } else {
    next();
  }
});

app.post("/recipes", (req, res, next) => {
  if (!req.session.user) {
    return res
      .status(403)
      .json({ error: "User is not logged in." });
  } else {
    next();
  }
});

app.patch("/recipes/:id", async (req, res, next) => {
  if (!req.session.user) {
    return res
      .status(403)
      .json({ error: "User is not logged in." });
  } else {
    next();
  }
});

app.delete("/recipes/:recipeId/:commentId", (req, res, next) => {
  if (!req.session.user) {
    return res
      .status(403)
      .json({ error: "User is not logged in" });
  } else {
    next();
  }
});

app.post("/recipes/:id/comments", (req, res, next) => {
  if (!req.session.user) {
    return res
      .status(403)
      .json({ error: "User is not logged in" });
  } else {
    next();
  }
});


app.use("/", async (req, res, next) =>{
  let requestBody = Object.assign({}, req.body)
  if(requestBody && requestBody.password){
    delete requestBody.password;
  }
  console.log(`Request Body: ${JSON.stringify(requestBody)}`);
  console.log(`Request url; ${req.originalUrl}`);
  console.log(`HTTP Verb: ${req.method}`);
  if ((Object.keys(req.query)[0] === "page" || req.originalUrl === '/recipes' || req.originalUrl === '/recipes/' || req.originalUrl === '/recipes?')
  && req.method === 'GET') {
    let key = '';
    if(!req.query.page){
      key ='1';
    }
    else{
      key = `${req.query.page}`;
    }
    let exists = await client.exists(key);
    if (exists) {
      console.log('Show Recipe from cache');
      let getRecipesPage = await client.get(key);
      console.log('Sending HTML from Redis....');
      res.status(200).send(JSON.parse(getRecipesPage));
      return;
    } else {
      next();
    }
  } else {
    next();
  }
});

app.use('/recipes/:id', async (req, res, next) => {
  //lets check to see if we have the show detail page for this show in cache
  if(Object.keys(req.params) == "id" && req.method === 'GET' && (req.baseUrl == req.originalUrl || req.baseUrl+'/' == req.originalUrl)){
    let exists = await client.exists(`${req.params.id}`);
    if (exists) {
      console.log('Recipe in Cache');
      let recipeDetailPage = await client.get(`${req.params.id}`);
      console.log('Sending data from Redis....');
      res.send(JSON.parse(recipeDetailPage));
    } else {
      next();
    }
  } else {
    next();
  }
});

let visitedUrlCounter = {}
app.use("/", (req,res,next) =>{
  if(!visitedUrlCounter[req.path]){
    visitedUrlCounter[req.path] = 1;
  }
  else{
    visitedUrlCounter[req.path]++;
  }
  console.log(`URL ${req.path} has been visited ${visitedUrlCounter[req.path]} times.`);
  next();
});
configRoutes(app);

app.listen(port, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${port}`);
});