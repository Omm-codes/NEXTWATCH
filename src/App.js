import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles/App.css'; // Updated import path

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import WebSeries from './pages/WebSeries';
import MovieDetails from './pages/MovieDetails';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import MoviePicker from './pages/WhatToWatch';
import About from './pages/About';
import Contact from './pages/Contact';

import NotFound from './pages/NotFound';

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
    <Router>
      <div className={`App ${theme}`}>
        <Navbar toggleTheme={toggleTheme} currentTheme={theme} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/webseries" element={<WebSeries />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/WhatToWatch" element={<MoviePicker />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

