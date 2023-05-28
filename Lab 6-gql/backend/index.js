const { ApolloServer, gql } = require("apollo-server");
const axios = require("axios");
const redis = require("redis");
const md5 = require("blueimp-md5");
const client = redis.createClient();
client.connect().then(() => {});

const typeDefs = gql`
type Character {
    id: Int
    image: String
    description: String
    name: String
    comics: Int
    stories: Int
    events: Int
    series: Int
    link: String
}
type Query {
    getAllCharacters(pagenum: String!): [Character]
    getCharacterById(id: String!): [Character]
    getCharacterByName(search: String!): [Character]
}
`;

const resolvers = {
  Query: {
    getAllCharacters: async (_, args) => {
      try {
        const { pagenum } = args;
        const pageNumInt = parseInt(pagenum);
        //console.log(pageNumInt);
        try {
          if (pageNumInt < 0 || pageNumInt > 78 || isNaN(pageNumInt)) {
            throw new Error("Invalid Page No.");
          }
        } catch (err) {
          return err;
        }
        let existsInCache = (await client.get(pagenum)) || null;
        if (existsInCache) {
          console.log("Cached!");
          return JSON.parse(existsInCache);
        }
        const md5 = require("blueimp-md5");
        const publickey = "13794a6e2956c2a66bc448a337c54652";
        const privatekey = "477c3029ed2c92928d8dac8b2e26726757f10a71";
        const ts = new Date().getTime();
        const stringToHash = ts + privatekey + publickey;
        const hash = md5(stringToHash);
        const baseUrl = "https://gateway.marvel.com:443/v1/public/characters";
        const temp = "" + pageNumInt * 20;
        const url =
          baseUrl +
          "?ts=" +
          ts +
          `&offset=${temp}` +
          "&apikey=" +
          publickey +
          "&hash=" +
          hash;
        try {
          console.log("Axios Call");
          const response = await axios.get(url);
          var d = response.data.data.results;
          //console.log(d);
        } catch (err) {
          return err;
        }
        const charactersData = [];
        for (let item of d) {
          charactersData.push({
            id: item.id,
            name: item.name ? item.name : "N/A",
            description: item.description ? item.description : "N/A",
            image: item.thumbnail.path
              ? item.thumbnail.path + "." + item.thumbnail.extension
              : "No Image",
            comics: item.comics.available ? item.comics.available : 0,
            stories: item.stories.available ? item.stories.available : 0,
            events: item.events.available ? item.events.available : 0,
            series: item.series.available ? item.series.available : 0,
            link: item.urls[0].url,
          });
        } //set in cache
        await client.set(pagenum, JSON.stringify(charactersData)); //console.log("cache data : ",charactersData)
        return charactersData;
      } catch (e) {
        console.log("error", e);
        return e;
      }
    },

    getCharacterById: async (_, args) => {
      const { id } = args;
      let existsInCache = (await client.get(id)) || null;
      if (existsInCache) {
        console.log("cached !!");
        return JSON.parse(existsInCache);
      }
      const md5 = require("blueimp-md5");
      const publickey = "13794a6e2956c2a66bc448a337c54652";
      const privatekey = "477c3029ed2c92928d8dac8b2e26726757f10a71";
      const ts = new Date().getTime();
      const stringToHash = ts + privatekey + publickey;
      const hash = md5(stringToHash);
      const baseUrl = "https://gateway.marvel.com:443/v1/public/characters/";
      const url =
        baseUrl + id + "?ts=" + ts + "&apikey=" + publickey + "&hash=" + hash;
      try {
        console.log("Axios Call");
        const response = await axios.get(url);
        var d1 = response.data.data.results;
        //console.log(d);
      } catch (err) {
        //console.log("error", err.response.data.code);
        throw new Error("Invalid Id");
      }
      const characterDataById = [];
      for (let item of d1) {
        //console.log('id:',item.id);
        characterDataById.push({
            id: item.id,
            name: item.name ? item.name : "N/A",
            description: item.description ? item.description : "N/A",
            image: item.thumbnail.path
                ? item.thumbnail.path + "." + item.thumbnail.extension
                : "No Image",
            comics: item.comics.available ? item.comics.available : 0,
            stories: item.stories.available ? item.stories.available : 0,
            events: item.events.available ? item.events.available : 0,
            series: item.series.available ? item.series.available : 0,
            link: item.urls[0].url,
        });
      }
      await client.set(id, JSON.stringify(characterDataById));
      //console.log(characterDataById);
      return characterDataById; 
    },

    getCharacterByName: async (_, args) => {
      const { search } = args;
      console.log(search);
      try {
        if (
          typeof search !== "string" ||
          search === null ||
          search === undefined ||
          search.trim() === ""
        ) {
          throw new Error("Invalid Search Term");
        }
      } catch (err) {
        return err;
      }
      const md5 = require("blueimp-md5");
      const publickey = "13794a6e2956c2a66bc448a337c54652";
      const privatekey = "477c3029ed2c92928d8dac8b2e26726757f10a71";
      const ts = new Date().getTime();
      const stringToHash = ts + privatekey + publickey;
      const hash = md5(stringToHash);
      const baseUrl = "https://gateway.marvel.com:443/v1/public/characters";
      const url =
        baseUrl +
        "?ts=" +
        ts +
        "&nameStartsWith=" +
        search +
        "&apikey=" +
        publickey +
        "&hash=" +
        hash;
      try {
        console.log("Axios Call");
        const response = await axios.get(url);
        var d2 = response.data.data.results;
        //console.log(d2);
      } catch (err) {
        return err;
      }
      const characterDataByName = [];
      for (let item of d2) {
        characterDataByName.push({
            id: item.id,
            name: item.name ? item.name : "N/A",
            description: item.description ? item.description : "N/A",
            image: item.thumbnail.path
                ? item.thumbnail.path + "." + item.thumbnail.extension
                : "No Image",
            comics: item.comics.available ? item.comics.available : 0,
            stories: item.stories.available ? item.stories.available : 0,
            events: item.events.available ? item.events.available : 0,
            series: item.series.available ? item.series.available : 0,
            link: item.urls[0].url
        });
      } 
      return characterDataByName; //} //catch (e) { //console.log("ERROR in getCharacterbyId...", e.response.data); //return e.response.data; //}
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url} 🚀`);
});
