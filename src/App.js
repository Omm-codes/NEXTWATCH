import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles/App.css'; // Updated import path

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import OfflineIndicator from './components/OfflineIndicator';

// Pages 
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import WebSeries from './pages/WebSeries';
import MovieDetails from './pages/MovieDetails';
import TVShowDetails from './pages/TVShowDetails';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import MoviePicker from './pages/WhatToWatch';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function App() {
  const [theme, setTheme] = useState('dark-mode');
  
  useEffect(() => {
    // Apply theme class to body
    document.body.className = theme;
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark-mode' ? 'light-mode' : 'dark-mode');
  };

  return (
    <AuthProvider>
      <Router>
        <div className={`App ${theme}`}>
          <OfflineIndicator />
          <ScrollToTop />
          <Navbar toggleTheme={toggleTheme} currentTheme={theme} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/tv" element={<TVShows />} />
              <Route path="/webseries" element={<WebSeries />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/tv/:id" element={<TVShowDetails />} />
              <Route path="/search" element={<Search />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/WhatToWatch" element={<MoviePicker />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

