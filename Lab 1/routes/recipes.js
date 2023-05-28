const express = require("express");
const router = express.Router();
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
          recipes = await getAllRecipes(page);
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
    try {
      let recipe = null;
      try {
        if (!ObjectId.isValid(id)){
          return res.status(400).json({error: "ID not valid"});
        }
        recipe = await getRecipeById(id);
        return res.status(200).json(recipe);
      } catch (e) {
        return res.status(404).json({ error: e.toString() });
      }
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
});


// 3.
router.post("/", async (req, res) => {
    const title = req.body.title;
    const ingredients = req.body.ingredients;
    const cookingSkillRequired =req.body.cookingSkillRequired;
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
        let skillsList = ["Novice", "Intermediate","Advanced"];
        if(!skillsList.includes(cookingSkillRequired)){
          return res.status(400).json({error: "Invalid Cooking Skill."});
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
        return res.status(200).json(commentObj);
      } catch (e) {
        return res.status(400).json({ error: e.toString() });
      }
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
});

// 6.
router.delete("/:recipeId/comments/:commentId", async (req, res) => {
    const recipeId = req.params.recipeId;
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
        return res.status(200).json(newRecipe);
      } catch (e) {
        return res.status(400).json({ error: e.toString() });
      }
    } catch (e) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;