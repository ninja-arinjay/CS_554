import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_LOCATIONS, UPDATE_LOCATION } from "../queries";
import {
  Card,
  Grid,
  CardContent,
  CardMedia,
  Typography,
  CardHeader,
  CardActionArea,
  Button
} from "@mui/material";
import {Delete, Favorite, FavoriteBorder} from "@mui/icons-material";
import "../App.css";

const Home = () => {
  let card = null;
  let [num, setNum] = useState(0);
  let [getData, setGetData] = useState(undefined);
  const { loading, error, data , refetch} = useQuery(GET_LOCATIONS, {
    variables: {pageNum:num},
  });
  if(!getData && data){
    let {locationPosts} = data;
    setGetData(locationPosts);
  }
  const [updateLocation, updateResponse] = useMutation(UPDATE_LOCATION);

  // async function handleGetMore(){
  //   num=num+1;
  //   setNum(num);
  //   let t = await refetch(
  //     {pageNum:num}
  //   );
  //   console.log(t);
  //   let {locationPosts} = data;
  //   setGetData(locationPosts);
  // }
  const buildCard = (show) => {
    async function toggleLike() {
      console.log('inside toggle',show.userPosted);
      try{
        let result = await updateLocation({
            variables: {
              id: show.id,
              image: show.image,
              name: show.name,
              address: show.address,
              userPosted: show.userPosted,
              liked: !show.liked
            }
        });

      }catch(e){
        console.log(e);
      }
    }
    return (
      <Grid item xs={12} sm={7} md={5} lg={4} xl={3} key={show.id}>
        <Card
          variant="outlined"
          sx={{
            maxWidth: 250,
            height: "auto",
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: 5,
            border: "1px solid #1e8678",
            boxShadow:
              "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);",
          }}
        >
          <CardActionArea>
            <CardMedia
              sx={{
                height: "100%",
                width: "100%",
              }}
              component="img"
              image={show.image ? show.image : "No Image"}
              title="show image"
            />
            <CardContent>
              <Typography
                sx={{
                  borderBottom: "1px solid #1e8678",
                  fontWeight: "bold",
                }}
                gutterBottom
                variant="h6"
                component="h3"
              >
              {show.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">Address: {show.address ? show.address : "N/A"}</Typography>
              <Button onClick={toggleLike} variant="text" startIcon={show.liked ? <Favorite/> : <FavoriteBorder/>}>{show.liked ? 'Unlike' : 'Like'}</Button>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  card =
    getData &&
    getData.map((show) => {
      return buildCard(show);
    });

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else if(data){
    return (
      <div>
        <Typography variant="h3" component="h3" sx={{ mb: 2, fontSize: "1.5rem", color: "#125bc9" }}>Home</Typography>
        <Grid
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            flexDirection: "row",
          }}
        >
        {card}
        </Grid>
      </div>
    );
  } else {
    return (
      <p>No Data Available!</p>
    );
  }
};

export default Home;
