const express = require("express");
const app = express();
const configRoutes = require("./routes");
const session = require("express-session");
const { request } = require("express");
const port = 3000;

app.use(express.json());

app.use(
  session({
    name: "AuthCookie",
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 600000 },
  })
);

app.use(express.urlencoded({ extended: true }));

app.use("/", (req, res, next) =>{
  let requestBody = Object.assign({}, req.body)
  if(requestBody && requestBody.password){
    delete requestBody.password;
  }
  console.log(`Request Body: ${JSON.stringify(requestBody)}`);
  console.log(`Request url; ${req.originalUrl}`);
  console.log(`HTTP Verb: ${req.method}`);
  next();
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