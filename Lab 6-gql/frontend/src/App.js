import React from 'react';
import logo from './img/Marvel_Logo.png';
import './App.css';
import CharacterList from './components/CharacterList';
import Collectors from './components/Collector';
import Character from './components/Character';
import Home from './components/Home.js';
import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "http://localhost:4000",
  }),
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className='App'>
          <header className='App-header'>
            <img src={logo} className='App-logo' alt='logo' />
            <h1 className='App-title'>
              Welcome to the Marvel API
            </h1>
            <Link className='showlink' to='/'>
              Home
            </Link>
            <Link className='showlink' to='/marvel-characters/page/:pagenum'>
              Characters
            </Link>
            <Link className='showlink' to='/collectors'>
              Collectors
            </Link>
          </header>
          <br />
          <br />
          <div className='App-body'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/marvel-characters/page/:pagenum' element={<CharacterList />} />
              <Route path='/marvel-characters/:id' element={<Character />} />
              <Route path='/collectors' element={<Collectors />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ApolloProvider>
  );
};

export default App;