import Layout from '../../../components/MyLayout';
import Head from 'next/head'
import axios from 'axios';
import Link from 'next/link';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography
} from '@mui/material';
export default function events({data, id:page}) {
  return (
    <Layout>
      <Head>
        <title>Events</title>
      </Head>
      <h1>Events</h1>
      {data.map((show) => (
        <Grid item xs={12} sm={7} md={5} lg={4} xl={3} key={show.id}>
        <Card
          variant='outlined'
          sx={{
            maxWidth: 250,
            height: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: 5,
            border: '1px solid #125bc9',
            boxShadow:
              '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
          }}
        >
          <CardActionArea>
              <CardMedia
                sx={{
                  height: '100%',
                  width: '100%'
                }}
                component='img'
                image= {
                  show.images ? show.images[9].url : 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930'
                }
                title='show image'
              />

              <CardContent>
                <Link href={`/events/${show.id}`}>
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
                </Link>
                <Typography variant='body2' color='textSecondary' component='p'>
                  {show.dates
                    ? 'Start Date - ' + show.dates.start.localDate
                    : 'Start Date - Data Unavailable'}
                  <br></br>
                  {show.priceRanges && show.priceRanges[0].min ? 'Price Range : ' + show.priceRanges[0].min.toString() + ' to ' + show.priceRanges[0].max.toString() + ' USD': 'Price Range : Data Unavailable' }
                </Typography>
              </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      ))}
      {page > 1 && (
        <Link href={`/events/page/${parseInt(page)-1}`}>
          <a>Previous</a>
        </Link>
      )}
      {page <= 48 && (
        <Link href={`/events/page/${parseInt(page)+1}`}>
          <a>Next</a>
        </Link>
      )}
      <style jsx>{`
        ul {
          list-style-type: none;
        }
      `}</style>
    </Layout>
  );
}

async function getShowData(id) {
  //console.log('dat function',id);
  try{
    const t = await axios.get(`https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&apikey=eVZDZZnM6njxAC220G8fcwdEanYOm1eJ&page=${id}`);
    return t.data._embedded.events;
  }catch(e){
    return undefined;
  }
  
}
export async function getServerSideProps(context) {
  const {id} = context.query;
  if(parseInt(id)<1 || parseInt(id)>49 || isNaN(parseInt(id))){
    return {
      notFound: true,
    };
  }
  //console.log(id);
  const data = await getShowData(id);
  if(!data){
    return {
      notFound: true,
    };
  }
  //console.log(data);
  return {
    props: {data, id}
  };
}
