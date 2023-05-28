const { users } = require("../config/mongoCollections");
const ObjectID = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");
const saltRounds = 10;


const validation = (username, name, password) => {
  if (!username || !password || !name) {
    throw new Error("Username, name, and password must be supplied.");
  }

  if (
    typeof username !== "string" ||
    typeof name !== "string" ||
    typeof password !== "string"
  ) {
    throw new Error("Username , name, and password must be strings.");
  }
  if(username.trim().length === 0 || name.trim().length === 0 || password.trim().length===0){
    throw new Error("Username, name and password cannot be empty strings.");
  }
  const usernameRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{3,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,}$/;

  if (!usernameRegex.test(username)) {
    throw new Error(
      "Username must consist of no spaces and only alphanumeric characters and length should be at least 3."
    );
  }

  if (!passwordRegex.test(password)) {
    throw new Error("Password must consist at least one lowercase letter, one uppercase letter, one number and one special character and length should be at least 6.");
  }
};

const createUser = async ( username, name, password ) => {
  validation(username, name, password);
  username = username.trim();
  name = name.trim();
  password = password.trim();
  const userCollection = await users();
  const lowerCasedUsername = username.toLowerCase();

  const hash = await bcrypt.hash(password, saltRounds);

  const newUser = {
    name,
    username: lowerCasedUsername,
    password: hash
  };

  const insertInfo = await userCollection.insertOne(newUser);

  if (insertInfo.insertedCount === 0) {
    throw new Error("Unable to add new user.");
  }

  const _user = await userCollection.findOne({ username: lowerCasedUsername });
  delete _user.password;
  return _user;
};
const alreadyExists = async (username) =>{
  username = username.trim();
  const lowerCasedUsername = username.toLowerCase();

  const userCollection = await users();
  const _user = await userCollection.findOne({username : lowerCasedUsername});
  if(_user){
    return true;
  }
  else{
    return false;
  }
}
const checkUser = async (username, password) => {
  username = username.trim();
  password = password.trim();
  const lowerCasedUsername = username.toLowerCase();

  const userCollection = await users();
  const _user = await userCollection.findOne({ username: lowerCasedUsername });

  const hash = _user.password;

  const passwordMatches = await bcrypt.compare(password, hash);

  if (!passwordMatches) {
    throw new Error("Either the username or password is invalid");
  }

  return { authenticated: true };
};

const getUserByUsername = async (username) => {
  validation(username, "test","Abc123@");
  username = username.trim(); 
  const userCollection = await users();
  const _user = await userCollection.findOne({ username });
  return _user;
};

const getUserById = async (id) => {
  //Input Validation of userId
  if (!id) throw 'You must provide an id to search for';
  if (typeof id !== 'string') throw 'Id must be a string';
  if (id.trim().length === 0)
    throw 'Id cannot be an empty string or just spaces';
  id = id.trim();
  if (!ObjectID.isValid(id)) throw 'invalid object ID';
  const userCollection = await users();
  const _user = await userCollection.findOne({ _id: new ObjectID(id) });
  return _user;
};


module.exports = {
  alreadyExists,
  createUser,
  checkUser,
  getUserByUsername,
  getUserById,
  validation
};