const { ApolloServer, gql } = require("apollo-server");
const redis = require("redis");
const client = redis.createClient();
const uuid = require("uuid");
const bluebird = require("bluebird");
const axios = require("axios");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const typeDefs = gql`
  type Location {
    id: ID!
    image: String!
    name: String!
    address: String
    userPosted: Boolean!
    liked: Boolean!
  }
  type Query {
    locationPosts(pageNum: Int): [Location]
    likedLocations: [Location]
    userPostedLocations: [Location]
  }
  type Mutation {
    uploadLocation(image: String!, address: String, name: String!): Location
    updateLocation(
      id: ID!
      image: String
      name: String
      address: String
      userPosted: Boolean
      liked: Boolean
    ): Location
    deleteLocation(id: ID!): Location
  }
`;

// let photosLink = null;
const addLocationToRedisDB = async ({ location, db, name }) => {
  let _db = JSON.parse(db);
  if (!_db?.length > 0) {
    _db = [];
  }
  // add location to array
  _db.push(location);
  await client.setAsync(name, JSON.stringify(_db));
};

const updateLocationInRedisDB = async ({ location, db, name }) => {
  const _db = JSON.parse(db);
  const index = _db.findIndex((l) => l.id === location.id);
  _db[index] = location;
  await client.setAsync(name, JSON.stringify(_db));
};

const deleteLocationFromRedisDB = async ({ id, db, name }) => {
  const _db = JSON.parse(db);
  const index = _db.findIndex((l) => l.id === id);
  const location = _db.splice(index, 1)[0];
  await client.setAsync(name, JSON.stringify(_db));
  return location;
};

const resolvers = {
  Query: {
    locationPosts: async (_, args) => {
      //console.log(typeof(args.pageNum));
      await client.setAsync('0','https://api.foursquare.com/v3/places/search');
      console.log(args.pageNum);
      let placeLink = await client.getAsync(''+args.pageNum);
      console.log(placeLink);
      const apiKey = "fsq3vSFUC2QJqcSeoUtQL26wuMB4hkA8jnoXUF/kfPkmsvo=";
      const url = placeLink; 
      const options = {
        method: "GET",
        params: { limit: "10" },
        headers: { accept: "application/json", Authorization: apiKey },
      };
      const response = await axios.get(url, options);
      console.log(response.data.results);
      const locationsData = [];
      // ye add kiya hai 
      placeLink = response.headers.link;
      const start = placeLink.indexOf("<") + 1;
      const end = placeLink.indexOf(">");
      placeLink = start > 0 && end > start ? placeLink.substring(start, end) : null;
      let redisTerm =  args.pageNum+1;
      await client.setAsync(''+redisTerm,placeLink);
      const data = response.data.results;
      //console.log(data);
      for (let item of data) {
        const fsq_id = item.fsq_id;
        //console.log(fsq_id);
        const photosOriginalUrl =`https://api.foursquare.com/v3/places/${fsq_id}/photos`;
        const options = {
          method: "GET",
          params: { limit: "10" },
          headers: { accept: "application/json", Authorization: apiKey },
        };
        const responseWithPhotos = await axios.get(photosOriginalUrl, options); 
        //console.log(responseWithPhotos.data);
        const prefix = responseWithPhotos.data[0].prefix
          ? responseWithPhotos.data[0].prefix
          : "";
        const suffix = responseWithPhotos.data[0].suffix
          ? responseWithPhotos.data[0].suffix
          : "";
        const photosUrl = prefix + `original` + suffix; 
        locationsData.push({
          id: fsq_id,
          image: photosUrl, 
          name: item.name,
          address: item.location.address,
          userPosted: false,
          liked: false,
        });
        //console.log(locationsData);
      }
      return locationsData;
    },
    likedLocations: async () => {
      const db = await client.getAsync("likedLocations");
      if (!db) {
        return [];
      }
      return JSON.parse(db);
    },
    userPostedLocations: async () => {
      const db = await client.getAsync("likedLocations");
      return JSON.parse(db).filter((location) => location.userPosted);
    },
  },
  Mutation: {
    uploadLocation: async (parent, args) => {
      const likedLocations = await client.getAsync("likedLocations");
      const location = {
        id: uuid.v4(),
        image: args.image,
        name: args.name,
        address: args.address,
        userPosted: true,
        liked: false,
      };
      await addLocationToRedisDB({
        location,
        db: likedLocations,
        name: "likedLocations",
      });
      return location;
    },
    updateLocation: async (parent, args) => {
      const likedLocations = await client.getAsync("likedLocations");
      const _likedLocations = JSON.parse(likedLocations);
      const location =
        _likedLocations?.length > 0
          ? _likedLocations.find((location) => location.id === args.id)
          : false;
      if (location) {
        console.log("location exists in the liked");
        if (args.image) {
          location.image = args.image;
        }
        if (args.name) {
          location.name = args.name;
        }
        if (args.address) {
          location.address = args.address;
        }
        if (args.userPosted !== location.userPosted) {
          location.userPosted = args.userPosted;
        }
        if (args.liked !== location.liked && !location.userPosted) {
          location.liked = args.liked;
          console.log("removing location from liked");
          if (!args.liked) {
            await deleteLocationFromRedisDB({
              id: location.id,
              db: likedLocations,
              name: "likedLocations",
            });
            return location;
          }
        }
        if (args.liked !== location.liked && location.userPosted) {
          location.liked = args.liked;
        }
        await updateLocationInRedisDB({
          location,
          db: likedLocations,
          name: "likedLocations",
        });
        return location;
      } else {
        console.log("adding new location to liked ");
        const newLocation = {
          id: args.id,
          image: args.image,
          name: args.name,
          address: args.address,
          userPosted: args.userPosted,
          liked: true,
        };
        console.log(newLocation);
        await addLocationToRedisDB({
          location: newLocation,
          db: likedLocations,
          name: "likedLocations",
        });
        return newLocation;
      }
    },
    deleteLocation: async (parent, args) => {
      const likedLocations = await client.getAsync("likedLocations");
      const location = await deleteLocationFromRedisDB({
        id: args.id,
        db: likedLocations,
        name: "likedLocations",
      });
      return location;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
