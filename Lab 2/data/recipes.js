const { recipes, users } = require("../config/mongoCollections");
const { getUserById } = require("../data/users");
const ObjectID = require("mongodb").ObjectID;

const validation = (input) => {
  if (!input) {
    throw new Error("Input must be supplied.");
  }
  if (typeof input !== 'string') {
    throw new Error("Input must be a string.");
  }
  if(input.trim().length === 0){
    throw new Error("Input cannot be just white spaces.")
  }
};

// POST
const createRecipe = async (title, ingredients, cookingSkillRequired, steps, userId,username) => {
    //Input Validation
    validation(title);
    for(let i =0; i<ingredients.length;i++){
        validation(ingredients[i]);
        ingredients[i]=ingredients[i].trim();
        if(ingredients[i].length <3 || ingredients.length >50){
            throw new Error("Invalid ingredient");
        }
    }
    if(ingredients.length<3){
        throw new Error("Ingredients cannot be less than 3");
    }
    let skillsList = ["Novice", "Intermediate","Advanced"];
    if (cookingSkillRequired !== "novice") {
      if (cookingSkillRequired !== "intermediate") {
        if (cookingSkillRequired !== "advanced") {
          throw new Error("An invalid cooking skill - can only be Novice, Intermediate, or Advanced");
        }
      }
    }
    for(let k =0; k<steps.length;k++){
        validation[steps[k]];
        steps[k]=steps[k].trim();
        if(steps[k].length<20){
            throw new Error("Invalid Step.");
        }
    }
    if(steps.length<5){
        throw new Error("Steps cannot be less than 5");
    }
    let comments =[];
    let likes = [];
    const recipesCollection = await recipes();
    const newRecipe = {
      title : title,
      ingredients : ingredients,
      cookingSkillRequired : cookingSkillRequired,
      steps : steps,
      userThatPosted : {_id:userId, username},
      comments : comments,
      likes : likes
    };
  
    const insertInfo = await recipesCollection.insertOne(newRecipe);

    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw 'Could not add recipe';

    const newId = insertInfo.insertedId.toString();
    const recipe = await getRecipeById(newId);
    return recipe;
};

// GET
const getAllRecipes = async (page) => {
  const skip = (page - 1) * 50;
  const recipesCollection = await recipes();
  const allRecipes = await recipesCollection.find({}).skip(skip).limit(50).toArray();
  if(allRecipes.length === 0){
    return res.status(404).send({ message: 'No more recipes found' });
  }
  return allRecipes;
};

// GET
const getRecipeById = async (id) => {
  //Input Validation of recipedId
  if (!id) throw 'You must provide an id to search for';
  if (typeof id !== 'string') throw 'Id must be a string';
  if (id.trim().length === 0)
    throw 'Id cannot be an empty string or just spaces';
  id = id.trim();
  if (!ObjectID.isValid(id)) throw 'invalid object ID';
  const recipesCollection = await recipes();
  const _recipe = await recipesCollection.findOne({
    _id: new ObjectID(id),
  });
  if (!_recipe) {
    throw new Error("No Recipe found");
  }
  return _recipe;
};

// PATCH
const updateRecipe = async (userId,recipeId,title, ingredients, steps,cookingSkillRequired) => {
  let recipe = await getRecipeById(recipeId);
  if(title === undefined && ingredients === undefined && steps === undefined && cookingSkillRequired === undefined){
    throw new Error("User must give at least one input");
  }
  if(title === undefined){
    title = recipe.title;
  }
  if(ingredients === undefined){
    ingredients = recipe.ingredients;
  }
  if(steps === undefined){
    steps = recipe.steps;
  }
  if(cookingSkillRequired === undefined){
    cookingSkillRequired = recipe.cookingSkillRequired.toLowerCase();
  }
  cookingSkillRequired = cookingSkillRequired.toLowerCase();
  // input validation of title;
  validation(title);
  // input validation of Ingredients
  for(let i =0; i<ingredients.length;i++){
    validation(ingredients[i]);
    ingredients[i]=ingredients[i].trim();
    if(ingredients[i].length <3 || ingredients.length >50){
        throw new Error("Invalid ingredient");
    }
  }
  if(ingredients.length<3){
      throw new Error("Ingredients cannot be less than 3");
  }
  // input validation of steps
  for(let k =0; k<steps.length;k++){
    validation[steps[k]];
    steps[k]=steps[k].trim();
    if(steps[k].length<20){
        throw new Error("Invalid Step.");
    }
  }
  if(steps.length<5){
      throw new Error("Steps cannot be less than 5");
  }
  // input validation of cooking skills required 
  if (cookingSkillRequired !== "novice") {
    if (cookingSkillRequired !== "intermediate") {
      if (cookingSkillRequired !== "advanced") {
        throw new Error("An invalid cooking skill - can only be Novice, Intermediate, or Advanced");
      }
    }
  }
  const recipesCollection = await recipes();
  const updatedInfo = await recipesCollection.findOne(
    {_id : ObjectID(recipeId)}
  );
  if(!updatedInfo){
    throw "ERROR: NO Recipe Is Present For That ID";
  };
  let recipeUpdatedInfo ={
    title,
    ingredients,
    steps,
    cookingSkillRequired,
    userThatPosted : recipe.userThatPosted,
    comments : recipe.comments,
    likes : recipe.likes
  }
  if(userId != recipe.userThatPosted._id.toString()){
    throw "Error : User is not allowed to update this recipe."
  }
  if (
    recipeUpdatedInfo.title === recipe.title &&
    JSON.stringify(recipeUpdatedInfo.ingredients) === JSON.stringify(recipe.ingredients) &&
    JSON.stringify(recipeUpdatedInfo.steps) === JSON.stringify(recipe.steps) &&
    recipeUpdatedInfo.cookingSkillRequired === recipe.cookingSkillRequired.toLowerCase())
  {
    throw "ERROR: All the value are same";
  }
  const updateI = await recipesCollection.updateOne(
    {_id: ObjectID(recipeId)},
    {$set: recipeUpdatedInfo}
  ) 
  if (!updateI.matchedCount && !updateI.modifiedCount) {
      throw "ERROR: UPDATE FAILED!"
  }
  const _recipe = await recipesCollection.findOne({ _id: new ObjectID(recipeId) });
  return _recipe;
};

// POST
const likeRecipe = async (userId, recipeId) => {
  // Input Validation of recipeId
  if (!recipeId) throw 'You must provide an id to search for';
  if (typeof recipeId !== 'string') throw 'Id must be a string';
  if (recipeId.trim().length === 0)
    throw 'Id cannot be an empty string or just spaces';
  recipeId = recipeId.trim();
  if (!ObjectID.isValid(recipeId)) throw 'invalid object ID';
  const recipesCollection = await recipes();
  const usersCollection = await users();
  const _user = await usersCollection.findOne({ _id: new ObjectID(userId) });
  const _recipe = await recipesCollection.findOne({ _id: new ObjectID(recipeId) });
  let newLikes = _recipe.likes;
  if(newLikes.includes(_user._id.toString())){
    let index = newLikes.indexOf(_user._id.toString);
    newLikes.splice(index);
  }
  else{
    newLikes.push(_user._id.toString());
  }
  const updatedRecipes = {
    likes : newLikes
  }
  const updatedInfo = await recipesCollection.findOneAndUpdate(
    {_id : ObjectID(recipeId)},
    { $set: updatedRecipes}
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update recipe likes successfully';
  }

  return await getRecipeById(recipeId);
  };

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  likeRecipe,
  validation
};