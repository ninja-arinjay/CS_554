import React from 'react';
import logo from './img/Ticketmaster.png';
import './App.css';
import EventList from './components/EventList';
import VenueList from './components/VenueList';
import Event from './components/Event';
import Venue from './components/Venue';
import Attraction from './components/Attraction';
import Home from './components/Home';
import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom';
import AttractionList from './components/AttractionList';

const App = () => {
  return (
    <Router>
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h1 className='App-title'>
            Welcome to the TicketMaster API
          </h1>
          <Link className='showlink' to='/'>
            Home
          </Link>
          <Link className='showlink' to='/attractions/page/:page?'>
            Attractions
          </Link>
          <Link className='showlink' to='/events/page/:page?'>
            Events
          </Link>
          <Link className='showlink' to='/venues/page/:page?'>
            Venues
          </Link>
        </header>
        <br />
        <br />
        <div className='App-body'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/events/page/:page?' element={<EventList />} />
            <Route path='/events/:id' element={<Event />} />
            <Route path='/venues/:id' element={<Venue />} />
            <Route path='/attractions/:id' element={<Attraction />} />
            <Route path='/venues/page/:page?' element={<VenueList />} />
            <Route path='/attractions/page/:page?' element={<AttractionList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
