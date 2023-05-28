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

const Event = (props) => {
  const [eventData, setEventData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [errorDisplay, setErrorDisplay] = useState(false);
  let {id} = useParams();
  const formatDate = (eventdate) => {
    var year = eventdate.substring(0, 4);
    var month = eventdate.substring(5, 7);
    var day = eventdate.substring(8, 10);
    return month + '/' + day + '/' + year;
  };
  useEffect(() => {
    console.log('SHOW useEffect fired');
    async function fetchData() {
      try {
        const t = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=eVZDZZnM6njxAC220G8fcwdEanYOm1eJ&locale=*`
        );
        const show = t.data;
        setEventData(show);
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
          title={eventData.name}
          sx={{
            borderBottom: '1px solid #1e8678',
            fontWeight: 'bold'
          }}
        />
        <CardMedia
          component='img'
          image={
            eventData.images && eventData.images[9].url ? eventData.images[9].url : noImage
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
                <dt className='title'>Start Date :</dt>
                {eventData && eventData.dates.start.localDate ? (
                  <dd>{formatDate(eventData.dates.start.localDate)}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Price Range :</dt>
                {eventData.priceRanges && eventData.priceRanges[0].min ? (
                  <dd>{eventData.priceRanges[0].min.toString() + ' to ' + eventData.priceRanges[0].max.toString() + ' USD'}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Genre :</dt>
                {eventData.classifications && eventData.classifications[0].genre ? (
                  <dd>{eventData.classifications[0].genre.name}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Ticket Site:</dt>
                {eventData && eventData.url ? (
                  <dd>
                    <a
                      rel='noopener noreferrer'
                      target='_blank'
                      href={eventData.url}
                    >
                      Click to Buy!
                    </a>
                  </dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Promoter :</dt>
                {eventData && eventData.promoter ? (
                  <dd>{eventData.promoter.name}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Ticket Limit :</dt>
                {eventData && eventData.ticketLimit ? (
                  <dd>{eventData.ticketLimit.info}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Note :</dt>
                {eventData && eventData.info ? (
                  <dd>{eventData.info}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
            </dl>
            <Link to='/events/page/:page?'>Back to all events...</Link>
          </Typography>
        </CardContent>
      </Card>
    );
  }
};

export default Event;
