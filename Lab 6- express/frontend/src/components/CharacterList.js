import React, {useState, useEffect} from 'react';
import {Link, useParams, NavLink} from 'react-router-dom';
import axios from 'axios';
import Searches from './Searches';
import noImage from '../img/download.jpeg';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography
} from '@mui/material';
import { Button} from "@mui/material";
import { Favorite, Delete} from "@mui/icons-material";
import Error from './Error';
import { useDispatch, useSelector } from "react-redux";

import '../App.css';

const CharacterList = () => {
  const [loading, setLoading] = useState(true);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [searchData, setSearchData] = useState(undefined);
  const [characterData, setCharacterData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const collectors = useSelector((state) => state);
  const selectedCollector = collectors.find((c) => c.isSelected);
  // for (let x in collector) {
  //   if(x === '_persist'){
  //     delete collector['_persist'];
  //   }
  // }
  // for(var c in collector){
  //   if(collector[c].isSelected){
  //     var selectedCollector = collector[c];
  //   }
  // }
  const isFull = selectedCollector.character.length >= 10;
  let card = null;
  let { pagenum } = useParams();
  if(pagenum === ':pagenum'){
    pagenum = '1';
  }
  useEffect(() => {
    //console.log('on load useeffect');
    async function fetchData() {
      try {
        const t = await axios.get(`http://localhost:3001/marvel/marvel-characters/page/${pagenum-1}`);
        const data = t.data;
        //console.log(data);
        setCharacterData(data);
        setLoading(false);
        setErrorDisplay(false);
      } catch (e) {
        setLoading(false);
        setErrorDisplay(true);
        console.log(e);
      }
    }
    fetchData();
  }, [pagenum]);

  useEffect(() => {
    //console.log('search useEffect fired');
    async function fetchData() {
      try {
        //console.log(`in fetch searchTerm: ${searchTerm}`);
        const t = await axios.get(`http://localhost:3001/marvel/marvel-characters/${searchTerm}`);
        const data = t.data;
        //console.log(data);
        setSearchData(data);
        setLoading(false);
        setErrorDisplay(false);
      } catch (e) {
        setLoading(false);
        setErrorDisplay(true);
        console.log(e);
      }
    }
    if (searchTerm) {
      //console.log('searchTerm is set');
      fetchData();
    }
  }, [searchTerm]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };
  const buildCard = (show) => {
    return (
      <Grid item xs={12} sm={7} md={5} lg={4} xl={3} key={show.id}>
        <Card
          variant='outlined'
          sx={{
            maxWidth: 250,
            height: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: 5,
            border: '1px solid #f38a8a',
            boxShadow:
              '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
          }}
        >
          <CardActionArea>
            <Link to={`/marvel-characters/${show.id}`}>
              <CardMedia
                sx={{
                  height: '100%',
                  width: '100%'
                }}
                component='img'
                image= {
                  show.thumbnail ? show.thumbnail.path + '.'+ show.thumbnail.extension : noImage
                }
                title='show image'
              />
            </Link>
              <CardContent>
                <Typography
                  sx={{
                    borderBottom: '1px solid #1e8678',
                    fontWeight: 'bold',
                    color: 'black'
                  }}
                  gutterBottom
                  variant='h6'
                  component='h3'
                >
                  {show.name}
                </Typography>
                <p>
                  {!selectedCollector.character.find((c) => c.characterName === show.name)
                  ?(
                    <div>
                      {!isFull && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            //console.log('clicked');
                            dispatch({
                              type: "ADD_CHARACTER",
                              payload: {
                                characterName: show.name,
                                characterId : show.id
                              },
                            });
                          }}
                          startIcon={<Favorite />} style={{ color: 'red' }} >
                          Collect
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({
                          type: "DELETE_CHARACTER",
                          payload: { characterName: show.name },
                        });
                      }}
                      startIcon={<Delete />} style={{ color: 'red' }} >
                      Give-Up
                    </Button>
                  )}
                </p>
              </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  if (searchTerm) {
    card =
      searchData &&
      searchData.map((show) => {
        return buildCard(show);
      });
  } else {
    card =
      characterData &&
      characterData.map((show) => {
        return buildCard(show);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } 
  else if(errorDisplay){
    return(
      <div>
        <Error />
      </div>
    )
  }
  else {
    return (
      <div>
        <Searches searchValue={searchValue} />
        <br />
        <br />
        {parseInt(pagenum) === 1 || searchTerm ? null : (
          <p><NavLink to={`/marvel-characters/page/${parseInt(pagenum)-1}`}>Previous</NavLink></p>
        )}
        {parseInt(pagenum) === 79 || searchTerm ? null : (
          <p><NavLink to={`/marvel-characters/page/${parseInt(pagenum)+1}`}>Next</NavLink></p>
        )}
        <Grid
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            flexDirection: 'row'
          }}
        >
          {card}
        </Grid>
      </div>
    );
  }
};

export default CharacterList;