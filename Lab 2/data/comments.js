const { recipes } = require("../config/mongoCollections");
const { getUserByUsername, getUserById } = require("../data/users");
const {getRecipeById} = require("../data/recipes");
const ObjectID = require("mongodb").ObjectID;

// POST
const addComment = async ( userId, recipeId, comment ,username) => {
  if (!recipeId || !comment) {
    throw new Error("recipeId and comment must be supplied.");
  }
  if (
    typeof recipeId !== "string" ||
    typeof comment !== "string"
  ) {
    throw new Error("recipeId and comment must be strings.");
  }
  if(recipeId.trim().length === 0 || comment.trim().length === 0){
    throw new Error("recipeId or comment cannot be an empty string or just spaces.")
  }
  recipeId = recipeId.trim();
  comment = comment.trim();
  if (!ObjectID.isValid(recipeId)) throw 'invalid recipeId';
  const recipesCollection = await recipes();
  const _recipe = await getRecipeById(recipeId);
  const _oldComments = _recipe.comments;
  const newComments = [
    ..._oldComments,
    { _id: new ObjectID(), userThatPostedComment : {_id : userId, username }, comment : comment },
  ];

  const updateInfo = await recipesCollection.updateOne(
    { _id: new ObjectID(recipeId) },
    { $set: { comments: newComments } }
  );

  if (updateInfo.modifiedCount === 0) {
    throw new Error("Could not add comment");
  }

  return await getRecipeById(recipeId);
};

// DELETE
const deleteComment = async (recipeId, commentId, userId ) => {
  if (!recipeId || !commentId) {
    throw new Error("RecipeId and commentId must be supplied.");
  }
  if (typeof recipeId !== 'string' || typeof commentId !== 'string') {
    throw new Error("RecipeId and commentId must be strings.");
  }
  if( recipeId.trim().length === 0 || commentId.trim().length === 0){
    throw new Error("recipeId cannot be an empty string or just spaces.")
  }
  recipeId = recipeId.trim();
  commentId = commentId.trim();
  if (!ObjectID.isValid(recipeId)) throw 'invalid recipeId';
  if (!ObjectID.isValid(commentId)) throw 'invalid commentId';
  const recipesCollection = await recipes();
  const _recipe = await getRecipeById(recipeId);
  const _oldComments = _recipe.comments;
  const newComments = _oldComments.filter(
    (comment) => comment._id.toString() !== commentId && comment.userThatPostedComment._id.toString() !== userId
  );
  console.log(newComments);
  const updateInfo = await recipesCollection.updateOne(
    { _id: new ObjectID(recipeId) },
    { $set: { comments: newComments } }
  );

  if (updateInfo.modifiedCount === 0) {
    throw new Error("Could not delete comment");
  }

  return getRecipeById(recipeId);
};


module.exports = {
  addComment,
  deleteComment,
};