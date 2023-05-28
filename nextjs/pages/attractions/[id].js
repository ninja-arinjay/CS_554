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
export default function attractions({data}) {
  return (
    <Layout>
      <Head>
        <title>Attractions</title>
      </Head>
      <h1>Attractions</h1>
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
            data.images  ? data.images[data.images.length-1].url : 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930'
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
                {data && data.classifications &&  data.classifications[0].genre? (
                  <dd>{data.classifications[0].genre.name}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
              <p>
                <dt className='title'>Segment :</dt>
                {data && data.classifications &&  data.classifications[0].segment? (
                    <dd>{data.classifications[0].segment.name}</dd>
                  ) : (
                    <dd>N/A</dd>
                  )}
              </p>
              
              <p>
                <dt className='title'>Attraction Site:</dt>
                {data && data.url ? (
                  <dd>
                    <a
                      rel='noopener noreferrer'
                      target='_blank'
                      href={data.url}
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
                {data && data.externalLinks && data.externalLinks.twitter ? (
                  <dd>
                    <a
                    rel='noopener noreferrer'
                    target='_blank'
                    href={data.externalLinks.twitter[0].url}
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
                {data && data.upcomingEvents && data.upcomingEvents._total ? (
                  <dd>{data.upcomingEvents._total}</dd>
                ) : (
                  <dd>N/A</dd>
                )}
              </p>
            </dl>
            <Link href='/attractions/page/1'>Back to all Attractions...</Link>
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
  //console.log('dat function',id);
  try{
    const t = await axios.get(`https://app.ticketmaster.com/discovery/v2/attractions/${id}?apikey=eVZDZZnM6njxAC220G8fcwdEanYOm1eJ&locale=*`);
    return t.data;
  }
  catch(e){
    return undefined;
  }
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
