import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';
import noImage from '../img/download.jpeg';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardHeader
} from '@mui/material';
import '../App.css';
import Error from './Error';

const Venue = (props) => {
  const [venueData, setVenueData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [errorDisplay, setErrorDisplay] = useState(false);
  let {id} = useParams();
  useEffect(() => {
    console.log('SHOW useEffect fired');
    async function fetchData() {
      try {
        const t = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/venues/${id}?apikey=eVZDZZnM6njxAC220G8fcwdEanYOm1eJ&locale=*`
        );
        const show = t.data;
        setVenueData(show);
        setLoading(false);
        setErrorDisplay(false);
      } catch (e) {
        setLoading(false);
        setErrorDisplay(true);
        console.log(e);
      }
    }
    fetchData();
  }, [id]);

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
          title={venueData.name}
          sx={{
            borderBottom: '1px solid #1e8678',
            fontWeight: 'bold'
          }}
        />
        <CardMedia
          component='img'
          image={
            venueData.images ? venueData.images[venueData.images.length -1].url : noImage
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
                <dt className='title'>Address :</dt>
                {venueData && venueData.address ? (
                  <dd>{venueData.address.line1}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>City :</dt>
                {venueData && venueData.city ? (
                    <dd>{venueData.city.name}</dd>
                  ) : (
                    <dd>N/A</dd>
                  )}
              </p>
              <p>
                <dt className='title'>State :</dt>
                {venueData && venueData.state ? (
                    <dd>{venueData.state.name}</dd>
                  ) : (
                    <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Venue Site:</dt>
                {venueData && venueData.url ? (
                  <dd>
                    <a
                      rel='noopener noreferrer'
                      target='_blank'
                      href={venueData.url}
                    >
                      Click to Visit!
                    </a>
                  </dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Twitter Handle :</dt>
                {venueData && venueData.social && venueData.social.twitter ? (
                  <dd>{venueData.social.twitter.handle}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Upcoming Events :</dt>
                {venueData && venueData.upcomingEvents && venueData.upcomingEvents._total ? (
                  <dd>{venueData.upcomingEvents._total}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>

              <p>
                <dt className='title'>General Rule :</dt>
                {venueData && venueData.generalInfo && venueData.generalInfo.generalRule ? (
                  <dd>{venueData.generalInfo.generalRule}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
            </dl>
            <Link to='/venues/page/:page?'>Back to all Venues...</Link>
          </Typography>
        </CardContent>
      </Card>
    );
  }
};

export default Venue;
