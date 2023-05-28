import {
  NavLink,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
import Home from "./pages/Home";
import MyLikes from "./pages/MyLikes";
import NewLocation from "./pages/NewLocation";
import MyLocations from "./pages/MyLocations";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "http://localhost:4000",
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          <header className="App-header">
            <h1 className="App-title">
              BoreSquare
            </h1>
            <nav>
              <NavLink className="showlink" to="/">
                Home
              </NavLink>
              <NavLink className="showlink" to="/my-likes">
                MY Likes
              </NavLink>
              <NavLink className="showlink" to="/my-locations">
                My Locations
              </NavLink>
            </nav>
          </header>
          <div className="App-body">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-likes" element={<MyLikes />} />
              <Route path="/my-locations" element={<MyLocations />} />
              <Route path="/new-location" element={<NewLocation />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
