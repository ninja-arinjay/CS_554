import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams, NavLink} from 'react-router-dom';
import SearchShows from './SearchShows';
import noImage from '../img/download.jpeg';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography
} from '@mui/material';

import '../App.css';

const ShowList = () => {
  const regex = /(<([^>]+)>)/gi;
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState(undefined);
  const [showsData, setShowsData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [showError, setShowError] = useState(false);
  let { pagenum } = useParams();
  if(pagenum === ':pagenum'){
    pagenum = '0';
  }
  let card = null;
  useEffect(() => {
    console.log('on load useeffect');
    async function fetchData() {
      try {
        console.log('in useEffect Page',pagenum);
        const {data} = await axios.get(`http://api.tvmaze.com/shows?page=${pagenum}`);
        setShowsData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setShowError(true);
      }
    }
    fetchData();
  }, [pagenum]);
  useEffect(() => {
    console.log('search useEffect fired');
    async function fetchData() {
      try {
        console.log(`in fetch searchTerm: ${searchTerm}`);
        const {data} = await axios.get(
          'http://api.tvmaze.com/search/shows?q=' + searchTerm
        );
        setSearchData(data);
        setLoading(false);
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
            <Link to={`/shows/${show.id}`}>
              <CardMedia
                sx={{
                  height: '100%',
                  width: '100%'
                }}
                component='img'
                image={
                  show.image && show.image.original
                    ? show.image.original
                    : noImage
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
                  {show.summary
                    ? show.summary.replace(regex, '').substring(0, 139) + '...'
                    : 'No Summary'}
                  <span>More Info</span>
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
      searchData.map((shows) => {
        let {show} = shows;
        return buildCard(show);
      });
  } else {
    card =
      showsData &&
      showsData.map((show) => {
        return buildCard(show);
      });
  }
  if(showError){
    return (
      <div>
        <h2>Error 404 : Data Not Found!</h2>
      </div>
    );
  }
  else if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  }
   else {
    return (
      <div>
        <SearchShows searchValue={searchValue} />
        <br />
        <br />
        {parseInt(pagenum) === 0 ? null : (
          <p><NavLink to={`/shows/page/${parseInt(pagenum)-1}`}>Previous</NavLink></p>
        )}
        {parseInt(pagenum) === 269 ? null : (
          <p><NavLink to={`/shows/page/${parseInt(pagenum)+1}`}>Next</NavLink></p>
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

export default ShowList;
