import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';
import noImage from '../img/download.jpeg';
import Error from './Error';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardHeader
} from '@mui/material';
import '../App.css';

const Attraction = (props) => {
  const [attractionData, setAttractionData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [errorDisplay, setErrorDisplay] = useState(false);
  let {id} = useParams();
  useEffect(() => {
    console.log('SHOW useEffect fired');
    async function fetchData() {
      try {
        const t = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/attractions/${id}?apikey=eVZDZZnM6njxAC220G8fcwdEanYOm1eJ&locale=*`
        );
        const show = t.data;
        setAttractionData(show);
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
          title={attractionData.name}
          sx={{
            borderBottom: '1px solid #1e8678',
            fontWeight: 'bold'
          }}
        />
        <CardMedia
          component='img'
          image={
            attractionData.images  ? attractionData.images[attractionData.images.length-1].url : noImage
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
                <dt className='title'>Genre :</dt>
                {attractionData && attractionData.classifications &&  attractionData.classifications[0].genre? (
                  <dd>{attractionData.classifications[0].genre.name}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Segment :</dt>
                {attractionData && attractionData.classifications &&  attractionData.classifications[0].segment? (
                    <dd>{attractionData.classifications[0].segment.name}</dd>
                  ) : (
                    <dd>N/A</dd>
                  )}
              </p>
              
              <p>
                <dt className='title'>Attraction Site:</dt>
                {attractionData && attractionData.url ? (
                  <dd>
                    <a
                      rel='noopener noreferrer'
                      target='_blank'
                      href={attractionData.url}
                    >
                      Click to Visit!
                    </a>
                  </dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Twitter :</dt>
                {attractionData && attractionData.externalLinks && attractionData.externalLinks.twitter ? (
                  <dd>
                    <a
                    rel='noopener noreferrer'
                    target='_blank'
                    href={attractionData.externalLinks.twitter[0].url}
                    >
                    Link !
                    </a>
                  </dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Upcoming Events :</dt>
                {attractionData && attractionData.upcomingEvents && attractionData.upcomingEvents._total ? (
                  <dd>{attractionData.upcomingEvents._total}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
            </dl>
            <Link to='/attractions/page/:page?'>Back to all Attractions...</Link>
          </Typography>
        </CardContent>
      </Card>
    );
  }
};

export default Attraction;
