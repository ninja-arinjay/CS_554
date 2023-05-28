import React, {useState, useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import noImage from '../img/download.jpeg';
import { useQuery} from "@apollo/client";
import {
  GET_CHARACTER_BY_ID
} from "../queries";
import { useDispatch, useSelector } from "react-redux";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardHeader
} from '@mui/material';
import { Button} from "@mui/material";
import { Favorite, Delete} from "@mui/icons-material";
import '../App.css';
import Error from './Error';

const Character = (props) => {
  const [characterData, setCharacterData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  let {id} = useParams();
  const dispatch = useDispatch();
  const collectors = useSelector((state) => state);
  const selectedCollector = collectors.find((c) => c.isSelected);

  const isFull = selectedCollector.character.length >= 10;
  const { loading:characterLoading, error, data, refetch } = useQuery(GET_CHARACTER_BY_ID, {
    fetchPolicy: "cache-and-network",
    variables :{getCharacterByIdId : id}
  });
  //console.log("My error",error);
  //console.log('New Vala',data);
  console.log(characterLoading);
  useEffect(() => {
    async function fetchData() {
      try {
        // const t = await axios.get(`http://localhost:3001/marvel/character/${id}`);
        // const show = t.data[0];
        //console.log(show);
        refetch({id : id});
        if(!data){
          setLoading(true);
        }else{
          setCharacterData(data.getCharacterById[0]);
          //console.log(data.getCharacterById[0]);
          setLoading(false);
        }
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }
    fetchData();
  }, [id, data, refetch]);

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  }
  else if(error){
    return(
      <div>
        <Error />
      </div>
    )
  } 
  else {
    return (
      <Card
        variant='outlined'
        sx={{
          maxWidth: 550,
          height: 'auto',
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: 5,
          border: '1px solid #1e8678',
          boxShadow:
            '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
        }}
      >
        <CardHeader
          title={characterData.name}
          sx={{
            borderBottom: '1px solid #1e8678',
            fontWeight: 'bold'
          }}
        />
        <CardMedia
          component='img'
          image={
            characterData.image ? characterData.image : noImage
          }
          title='show image'
        />

        <CardContent>
          <Typography
            variant='body2'
            color='textSecondary'
            component='span'
            sx={{
              borderBottom: '1px solid #1e8678',
              fontWeight: 'bold'
            }}
          >
            <dl>
              <p>
                <dt className='title'>Description :</dt>
                {characterData && characterData.description ? (
                  <dd>{characterData.description}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Comics :</dt>
                {characterData && characterData.comics ? (
                  <dd>{characterData.comics}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Events :</dt>
                {characterData && characterData.events ? (
                  <dd>{characterData.events}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Series :</dt>
                {characterData && characterData.series ? (
                  <dd>{characterData.series}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Stories :</dt>
                {characterData && characterData.stories ? (
                    <dd>{characterData.stories}</dd>
                  ) : (
                    <dd>N/A</dd>
                  )}
              </p>
              <p>
                <dt className='title'></dt>
                {characterData && characterData.link ? (
                    <dd>
                      <a
                        rel='noopener noreferrer'
                        target='_blank'
                        href={characterData.link}
                      >
                        Click to know more!
                      </a>
                    </dd>
                  ) : (
                    <dd>N/A</dd>
                  )}
              </p>
            </dl>
            <div>
            {!selectedCollector.character.find((c) => c.characterName === characterData.name)
            ?(
              <div>
                {!isFull && (
                  <Button
                    onClick={() => {
                      dispatch({
                        type: "ADD_CHARACTER",
                        payload: {
                          characterName: characterData.name,
                          characterId : characterData.id
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
                onClick={() => {
                  dispatch({
                    type: "DELETE_CHARACTER",
                    payload: { characterName: characterData.name },
                  });
                }}
                startIcon={<Delete />} style={{ color: 'red' }} >
                Give-Up
              </Button>
            )}
            </div>
            <Link className = 'back-link' to='/marvel-characters/page/:pagenum'>Back to all characters...</Link>
          </Typography>
        </CardContent>
      </Card>
    );
  }
};

export default Character;