const express = require("express");
const router = express.Router();
const redis = require("redis");
const axios = require("axios");
const client = redis.createClient();
client.connect().then(() => {});


router.get("/marvel-characters/page/:pagenum", async (req, res) => {
  const { pagenum } = req.params;
  const pageNumInt = parseInt(pagenum);
  try{
    if (pageNumInt < 0 || pageNumInt > 78) {
      throw new Error("Invalid Page No.");
    }
  } catch(err){
    res.status(404).json({ error: "Invalid Page No." });
    return;
  }
  let existsInCache = (await client.get(pagenum)) || null;

  if (existsInCache) {
    console.log("Cached!");
    res.status(200).json(JSON.parse(existsInCache));
    return;
  }
    const md5 = require('blueimp-md5');
    const publickey = '13794a6e2956c2a66bc448a337c54652';
    const privatekey = '477c3029ed2c92928d8dac8b2e26726757f10a71';
    const ts = new Date().getTime();
    const stringToHash = ts + privatekey + publickey;
    const hash = md5(stringToHash);
    const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters';
    const temp = ''+ pageNumInt *20;
    const url = baseUrl + '?ts=' + ts + `&offset=${temp}` + '&apikey=' + publickey + '&hash=' + hash;
  try {
    console.log('Axios Call');
    const response = await axios.get(url);
    const marvelCharacters = response.data.data.results;
    await client.set(pagenum, JSON.stringify(marvelCharacters));
    res.status(200).json(marvelCharacters);
  } catch (err) {
    res.status(404).json({ error: "Page Not found,ye vala" });
    return;
  }
});

router.get("/marvel-characters/:search", async (req, res) => {
  const { search } = req.params;
  try{
    if (typeof search !== "string" || search === null || search === undefined || search.trim() === "") {
      throw new Error("Invalid Search Term");
    }
  } catch(err){
    res.status(404).json({ error: "Invalid Search Term" });
    return;
  }
    const md5 = require('blueimp-md5');
    const publickey = '13794a6e2956c2a66bc448a337c54652';
    const privatekey = '477c3029ed2c92928d8dac8b2e26726757f10a71';
    const ts = new Date().getTime();
    const stringToHash = ts + privatekey + publickey;
    const hash = md5(stringToHash);
    const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters';
    const url = baseUrl + '?ts=' + ts + '&nameStartsWith=' + search + '&apikey=' + publickey + '&hash=' + hash;
    //console.log(url);
  try {
    const response = await axios.get(url);
    const marvelCharacters = response.data.data.results;
    res.status(200).json(marvelCharacters);
  } catch (err) {
    res.status(404).json({ error: "Page Not found" });
    return;
  }
});

router.get("/character/:id", async (req, res) => {
  const { id } = req.params;

  let existsInCache = (await client.get(id)) || null;

  if (existsInCache) {
    console.log("cached !!");
    res.status(200).json(JSON.parse(existsInCache));
    return;
  }
    const md5 = require('blueimp-md5');
    const publickey = '13794a6e2956c2a66bc448a337c54652';
    const privatekey = '477c3029ed2c92928d8dac8b2e26726757f10a71';
    const ts = new Date().getTime();
    const stringToHash = ts + privatekey + publickey;
    const hash = md5(stringToHash);
    const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters/';
    const url = baseUrl + id + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash;
  try {
    console.log('Axios Call');
    const response = await axios.get(url);
    const character = response.data.data.results;
    
    await client.set(id, JSON.stringify(character));
    res.status(200).json(character);
  } catch (err) {
    res.status(404).json({
      error: "Character not found",
    });
  }
});

module.exports = router;