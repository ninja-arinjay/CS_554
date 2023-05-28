import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams, NavLink} from 'react-router-dom';
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
import Error from './Error';
import '../App.css';

const AttractionList = () => {
  const [loading, setLoading] = useState(true);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [searchData, setSearchData] = useState(undefined);
  const [attractionsData, setAttractionsData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  let card = null;
  let { page } = useParams();
  let pagenum = page;
  if(pagenum === ':page'){
    pagenum = '0';
  }
  useEffect(() => {
    console.log('on load useeffect');
    async function fetchData() {
      try {
        const t = await axios.get(`https://app.ticketmaster.com/discovery/v2/attractions.json?countryCode=US&apikey=eVZDZZnM6njxAC220G8fcwdEanYOm1eJ&page=${pagenum}`);
        const data = t.data._embedded.attractions;
        setAttractionsData(data);
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
    console.log('search useEffect fired');
    async function fetchData() {
      try {
        console.log(`in fetch searchTerm: ${searchTerm}`);
        const t = await axios.get(
          'https://app.ticketmaster.com/discovery/v2/attractions.json?countryCode=US&apikey=eVZDZZnM6njxAC220G8fcwdEanYOm1eJ&keyword=' + searchTerm
        );
        const data = t.data._embedded.attractions;
        setSearchData(data);
        setLoading(false);
        setErrorDisplay(false);
      } catch (e) {
        console.log(e);
      }
    }
    if (searchTerm) {
      console.log('searchTerm is set');
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
            border: '1px solid #1e8678',
            boxShadow:
              '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
          }}
        >
          <CardActionArea>
            <Link to={`/attractions/${show.id}`}>
              <CardMedia
                sx={{
                  height: '100%',
                  width: '100%'
                }}
                component='img'
                image= {
                  show.images ? show.images[9].url : noImage
                }
                title='show image'
              />

              <CardContent>
                <Typography
                  sx={{
                    borderBottom: '1px solid #1e8678',
                    fontWeight: 'bold'
                  }}
                  gutterBottom
                  variant='h6'
                  component='h3'
                >
                  {show.name}
                </Typography>
                <Typography variant='body2' color='textSecondary' component='p'>
                  {show.classifications && show.classifications[0] && show.classifications[0].genre
                    ? 'Genre : ' + show.classifications[0].genre.name
                    : 'Genre : Data Unavailable'}
                  <br></br>
                  {show.classifications[0].segment ? 'Segment : ' + show.classifications[0].segment.name  : 'Segment : Data Unavailable' }
                </Typography>
              </CardContent>
            </Link>
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
      attractionsData &&
      attractionsData.map((show) => {
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
        {parseInt(pagenum) === 0 || searchTerm ? null : (
          <p><NavLink to={`/attractions/page/${parseInt(pagenum)-1}`}>Previous</NavLink></p>
        )}
        {parseInt(pagenum) === 49 || searchTerm ? null : (
          <p><NavLink to={`/attractions/page/${parseInt(pagenum)+1}`}>Next</NavLink></p>
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

export default AttractionList;
