import Layout from '../../components/MyLayout';
import Head from 'next/head'
import axios from 'axios';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardHeader
} from '@mui/material';
export default function events({data}) {
  return (
    <Layout>
      <Head>
        <title>Events</title>
      </Head>
      <h1>Events</h1>
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
          title={data.name}
          sx={{
            borderBottom: '1px solid #1e8678',
            fontWeight: 'bold'
          }}
        />
        <CardMedia
          component='img'
          image={
            data.images && data.images[9].url ? data.images[9].url : 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930'
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
                {data && data.dates.start.localDate ? (
                  <dd>{data.dates.start.localDate}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Price Range :</dt>
                {data.priceRanges && data.priceRanges[0].min ? (
                  <dd>{data.priceRanges[0].min.toString() + ' to ' + data.priceRanges[0].max.toString() + ' USD'}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Genre :</dt>
                {data.classifications && data.classifications[0].genre ? (
                  <dd>{data.classifications[0].genre.name}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Ticket Site:</dt>
                {data && data.url ? (
                  <dd>
                    <a
                      rel='noopener noreferrer'
                      target='_blank'
                      href={data.url}
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
                {data && data.promoter ? (
                  <dd>{data.promoter.name}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Ticket Limit :</dt>
                {data && data.ticketLimit ? (
                  <dd>{data.ticketLimit.info}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Note :</dt>
                {data && data.info ? (
                  <dd>{data.info}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
            </dl>
            <Link href='/events/page/1'>Back to all events...</Link>
          </Typography>
        </CardContent>
      </Card>
      <style jsx>{`
        ul {
          list-style-type: none;
        }
      `}</style>
    </Layout>
  );
}

async function getShowData(id) {
  try{
    const t = await axios.get(`https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=eVZDZZnM6njxAC220G8fcwdEanYOm1eJ&locale=*`);
    return t.data;
  }catch(e){
    return undefined;
  }
  //console.log('dat function',id);
  
}
export async function getServerSideProps(context) {
  const {id} = context.query;
  //console.log(id);
  const data = await getShowData(id);
  if(!data){
    return {
      notFound: true,
    };
  }
  //console.log(data);
  return {
    props: {data}
  };
}
