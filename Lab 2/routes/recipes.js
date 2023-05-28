const express = require("express");
const router = express.Router();
const redis = require("redis");
const client = redis.createClient();
client.connect().then(() => {});
const {
  getAllRecipes,
  createRecipe,
  updateRecipe,
  getRecipeById,
  likeRecipe,
  validation
} = require("../data/recipes");
const {
    addComment,
    deleteComment
} = require("../data/comments");
const { ObjectId } = require('mongodb');
const { recipes } = require("../config/mongoCollections");

const addToRedis = async(page, recipes) => {
  await client.set(page, JSON.stringify(recipes));
};

// 1.
router.get("/", async (req, res) => {
    try{ 
      const page = req.query.page ? parseInt(req.query.page) : 1;
      if(page <=0 || !Number.isInteger(page)){
        throw new Error("Invalid value of page");
      }
      try {
        let recipes = null;
        try {
          console.log('Show Recipe not cached');
          recipes = await getAllRecipes(page);
          await client.set(page.toString(),JSON.stringify(recipes));
          return res.status(200).json(recipes);
        } catch (e) {
          return res.status(404).json({ error: e.toString() });
        }
      } catch (e) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } catch (e) {
      return res.status(400).json({error : "Bad Request for query String."});
    }
});

// 2.
router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let key = `${req.params.id}`;
    try {
      let recipe = null;
      if (typeof req.params.id !== "string" || req.params.id == null) {
        res.status(400).json({ error: "ERROR: id must be a string" });
        return;
      }
      if (!req.params.id) {
        return res.status(400).json({
          error: "ERROR: No recipe id is provided to update for PATCH request.",
        });
      }
      if(Object.keys(req.query).length){
        return res.status(400).json({error: `invalid ID in params`});
      }
      if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({
          error: "Not a valid ObjectId in req param.",
        });
        return;
      }
      if (req.params.id.trim().length === 0) {
        return res.status(400).json({
          error:
          "ERROR: Invalid ID in req.params - must be a string and no empty spaces",
        });
      }
        // if (!ObjectId.isValid(id)){
        //   return res.status(400).json({error: "ID not valid"});
        // }
        console.log('Recipe not in cache');
        recipe = await getRecipeById(id);
        await addToRedis(key,recipe);
        await client.zAdd('mostAccessed', {
          score: 1,
          value: key,
        });
        return res.status(200).json(recipe);
      } catch (e) {
        return res.status(404).json({ error: e.toString() });
      }
    });
// 3.
router.post("/", async (req, res) => {
    const title = req.body.title;
    const ingredients = req.body.ingredients;
    const cookingSkillRequired =req.body.cookingSkillRequired.toLowerCase();
    console.log(cookingSkillRequired);
    const steps = req.body.steps;
    try {
      if (!req.session.userId) {
        res
          .status(401)
          .json({ error: "You must be logged in to hit this route." });
      }
      let recipe = null;
      try {
        validation(title);
        for(let i =0; i<ingredients.length;i++){
          validation(ingredients[i]);
          ingredients[i]=ingredients[i].trim();
          if(ingredients[i].length <3 || ingredients.length >50){
            return res.status(400).json({error: "Invalid Ingredients."});
          }
        }
        if(ingredients.length<3){
          return res.status(400).json({error: "Ingredients cannot be less than 3"});
        }
        if (cookingSkillRequired !== "novice") {
          if (cookingSkillRequired !== "intermediate") {
            if (cookingSkillRequired !== "advanced") {
              return res.status(400).json({
                error:
                  "ERROR: An invalid cooking skill - can only be Novice, Intermediate, or Advanced",
              });
            }
          }
        }
        for(let k =0; k<steps.length;k++){
          validation[steps[k]];
          steps[k]=steps[k].trim();
          if(steps[k].length<20){
            return res.status(400).json({error: "Invalid Step."});
          }
        }
        if(steps.length<5){
          return res.status(400).json({error: "Steps cannot be less than 5"});
        }
        recipe = await createRecipe(
          title,
          ingredients,
          cookingSkillRequired,
          steps,
          req.session.userId,
          req.session.username
        );
        let id = recipe._id.toString();
        await addToRedis(id,recipe);
        await client.zAdd('mostAccessed', {
          score: 1,
          value: id,
        });
        return res.status(200).json(recipe);
      } catch (e) {
        return res.status(400).json({ error: e.toString() });
      }
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
});



// 4.
router.patch("/:id", async (req, res) => {
    const title = req.body.title;
    const ingredients = req.body.ingredients; 
    const steps = req.body.steps;
    const cookingSkillRequired = req.body.cookingSkillRequired;
    const recipeId = req.params.id;
    let key = `${req.params.id}`;
    try {
      if (!req.session.userId) {
        res
          .status(401)
          .json({ error: "You must be logged in to hit this route." });
      }
  
      let recipe = null;
      try {
        recipe = await getRecipeById(recipeId);
        if (!recipe) {
          return res.status(404).json({ error: "No recipe found" });
        }
      } catch (e) {
        return res.status(404).json({ error: "No recipe found" });
      }

      if (req.session.username !== recipe.userThatPosted.username) {
        res
          .status(401)
          .json({ error: "You are not authorized to edit this recipe" });
      }
  
      let newRecipe = null;
      try {
        newRecipe = await updateRecipe(
          req.session.userId,
          recipeId,
          title,
          ingredients,
          steps,
          cookingSkillRequired
        );
        let exists = await client.exists(key);
        if(exists){
          await addToRedis(key,newRecipe);
          await client.zIncrBy('mostAccessed', 1, key);
        }else{
          await addToRedis(recipeId,newRecipe);
          await client.zAdd('mostAccessed', {
            score: 1,
            value: key,
          });
        }
        return res.status(200).json(newRecipe);
      } catch (e) {
        return res.status(400).json({ error: e.toString() });
      }
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
});


// 5.
router.post("/:id/comments", async (req, res) => {
    const comment = req.body.comments;
    const recipeId = req.params.id;
    let key = `${req.params.id}`;
    try {
      if (!req.session.userId) {
        return res
          .status(401)
          .json({ error: "You must be logged in to hit this route." });
      }
  
      const userId = req.session.userId.toString();
      const username = req.session.username;
  
      let recipe = null;
      try {
        if (!ObjectId.isValid(recipeId)){
          return res.status(400).json({error: "ID not valid"});
        }
        if(!comment){
          return res.status(400).json({error: "Comment must have an input."});
        }
        if(typeof comment !== 'string'){
          return res.status(400).json({error: "Comment must be a string"});
        }
        if(comment.trim().length === 0){
          return res.status(400).json({error: "Comment must not be an empty string"});
        }
        recipe = await getRecipeById(recipeId);
        if (!recipe) {
          return res.status(404).json({ error: "No Recipe found" });
        }
      } catch (e) {
        return res.status(404).json({ error: "No Recipe found" });
      }
  
      let commentObj = null;
      try {
        commentObj = await addComment(
          userId,
          recipeId,
          comment,
          username
        );
        recipe = await getRecipeById(recipeId);
        let exists = await client.exists(recipeId);
        if(exists){
          await addToRedis(key,recipe);
          await client.zIncrBy('mostAccessed', 1, key);
        }else{
          await addToRedis(key,recipe);
          await client.zAdd('mostAccessed', {
            score: 1,
            value: key,
          });
        }
        return res.status(200).json(commentObj);
      } catch (e) {
        return res.status(400).json({ error: e.toString() });
      }
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
});

// 6.
router.delete("/:recipeId/:commentId", async (req, res) => {
    const recipeId = req.params.recipeId;
    let key = `${req.params.recipeId}`;
    const commentId  = req.params.commentId;
    try {
      if (!req.session.userId) {
        return res
          .status(401)
          .json({ error: "You must be logged in to hit this route." });
      }
  
      let recipe = null;
      try {
        if (!ObjectId.isValid(recipeId) || !ObjectId.isValid(commentId)){
          return res.status(400).json({error: "ID not valid"});
        }
        recipe = await getRecipeById(recipeId);
        if (!recipe) {
          return res.status(404).json({ error: "No recipe found" });
        }
      } catch (e) {
        return res.status(404).json({ error: "No recipe found" });
      }
  
      const comment = recipe.comments.find(
        (comment) => comment._id.toString() === commentId
      );
  
      if (req.session.username !== comment.userThatPostedComment.username) {
        return res
          .status(401)
          .json({ error: "You are not authorized to edit this comment" });
      }
  
      let commentObj = null;
      try {
        commentObj = await deleteComment(
          recipeId,
          commentId,
          req.session.userId
        );
        recipe = await getRecipeById(recipeId);
        let exists = await client.exists(key);
        if(exists){
          await addToRedis(key,recipe);
          await client.zIncrBy('mostAccessed', 1, key);
        }else{
          await addToRedis(key,recipe);
          await client.zAdd('mostAccessed', {
            score: 1,
            value: key,
          });
        }
        return res.status(200).json(commentObj);
      } catch (e) {
        return res.status(400).json({ error: e.toString() });
      }
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
});

// 7.
router.post("/:id/likes", async (req, res) => {
    const recipeId = req.params.id;
    let key = `${req.params.id}`;
    try {
      if (!req.session.userId) {
        return res
          .status(401)
          .json({ error: "You must be logged in to hit this route." });
      }
  
      let recipe = null;
      try {
        if (!ObjectId.isValid(recipeId)){
          return res.status(400).json({error: "ID not valid"});
        }
        recipe = await getRecipeById(recipeId);
        if (!recipe) {
          return res.status(404).json({ error: "No recipe found" });
        }
      } catch (e) {
        return res.status(404).json({ error: "No recipe found" });
      }

      let newRecipe = null;
      try {
        newRecipe = await likeRecipe(
          req.session.userId,
          recipeId,
        );
        let exists = await client.exists(key);
        if(exists){
          await addToRedis(key,newRecipe);
          await client.zIncrBy('mostAccessed', 1, key);
        }else{
          await addToRedis(key,newRecipe);
          await client.zAdd('mostAccessed', {
            score: 1,
            value: key,
          });
        }
        return res.status(200).json(newRecipe);
      } catch (e) {
        return res.status(400).json({ error: e.toString() });
      }
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;