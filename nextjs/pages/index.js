import Head from 'next/head'
import Layout from '../components/MyLayout';

const Index = () => (
  <Layout>
    <Head>
      <title>Ticketmaster API</title>
    </Head>
    <h1>Welcome to the Ticket Master API Next.js Version</h1>
    <p>
      The Ticketmaster API is a web service that allows developers to access Ticketmaster's vast database of live event information, including concerts, sports games, theater performances, and more.
      </p>
      <a href='https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/'> Click to learn more !</a>
  </Layout>
);

export default Index;
