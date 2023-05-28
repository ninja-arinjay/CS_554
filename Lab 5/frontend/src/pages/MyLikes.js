import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_LIKED_LOCATIONS, UPDATE_LOCATION } from "../queries";
import { Card, Grid } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import "../App.css";

const MyLikes = () => {
  let card = null;

  const { loading, error, data } = useQuery(GET_LIKED_LOCATIONS, {
    fetchPolicy: "cache-and-network",
  });

  const [updateLocation, updateResponse] = useMutation(UPDATE_LOCATION);
  console.log("Data inside my likes .", data);
  
  const buildCard = (show) => {
    async function toggleLike() {
        try{
            console.log("isnide try ....", show)
           let result =  await updateLocation({
                variables: {
                  id: show.id,
                  image: show.image,
                  name: show.name,
                  address: show.address,
                  userPosted: show.userPosted,
                  liked: !show.liked,
                },
              });
              if(result.errors){
                
              }if(result.data){
                console.log("data inside handle click..", result.data.updateLocation)
              }
    
        }catch(e){
            console.log("client erro HOME..",e)
        }
      };
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
              >{show.name}</Typography>
              <Typography variant="body2" color="textSecondary" component="p">Address: {show.address ? show.address : "N/A"}</Typography>
              <Button onClick={toggleLike} variant="text" startIcon={show.liked ? <Favorite/> : <FavoriteBorder/>}>{show.liked ? 'Unlike' : 'Like'}</Button>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  card =
  data && data.likedLocations &&
  data.likedLocations.map((show) => {
    if(show.liked){
        return buildCard(show);
    }
    });

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else if (data) {
    return (
      <div>
        <Typography variant="h3" component="h3" sx={{ mb: 2, fontSize: "1.5rem", color: "#125bc9" }}>My Likes</Typography>
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
    return <p>No Data Available!</p>;
  }
};

export default MyLikes;