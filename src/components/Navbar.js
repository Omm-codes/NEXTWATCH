import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { searchMovies } from '../services/api';
import logo from '../assets/logo.png';
import './Navbar.css';;

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Auto-hide navbar functionality - now using transparency
  useEffect(() => {
    let hideTimer;

    const handleMouseMove = (e) => {
      const mouseY = e.clientY;
      
      // Show navbar fully when mouse is in the top 80px of the screen
      if (mouseY <= 80) {
        if (!isVisible) {
          setIsVisible(true);
        }
        clearTimeout(hideTimer);
      } else {
        // Make navbar transparent when mouse moves away from top area
        if (isVisible) {
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => {
            setIsVisible(false);
          }, 500); // Slightly longer delay for better UX
        }
      }
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
      clearTimeout(hideTimer);
    };

    const handleMouseLeave = (e) => {
      const mouseY = e.clientY;
      // Make transparent if mouse leaves navbar and is not in top area
      if (mouseY > 80) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 300); // Quick transparency when leaving navbar
      }
    };

    // Add global mouse move listener
    document.addEventListener('mousemove', handleMouseMove);

    // Add navbar-specific listeners
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.addEventListener('mouseenter', handleMouseEnter);
      navbar.addEventListener('mouseleave', handleMouseLeave);
    }

    // Keep navbar visible when mobile menu is open
    if (mobileMenuOpen) {
      setIsVisible(true);
      clearTimeout(hideTimer);
    }

    // Make navbar transparent initially after component mounts
    const initialHideTimer = setTimeout(() => {
      if (!mobileMenuOpen) {
        setIsVisible(false);
      }
    }, 4000); // Make transparent after 4 seconds initially

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (navbar) {
        navbar.removeEventListener('mouseenter', handleMouseEnter);
        navbar.removeEventListener('mouseleave', handleMouseLeave);
      }
      clearTimeout(hideTimer);
      clearTimeout(initialHideTimer);
    };
  }, [isVisible, mobileMenuOpen]);

  // Handle scroll effect - show navbar briefly when scrolling
  useEffect(() => {
    let scrollTimer;
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }

      // Show navbar fully when scrolling, then make it transparent again
      setIsVisible(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsVisible(false);
      }, 1500); // Make transparent after 1.5 seconds of no scrolling
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [scrolled]);

  // Search suggestions functionality
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchMovies(searchQuery.trim(), 1);
          setSearchSuggestions(results.results.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          setSearchSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
      setMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (movie) => {
    // Scroll to top immediately
    window.scrollTo(0, 0);
    
    // Check if it's a TV show based on available properties
    const isTV = movie.media_type === 'tv' || movie.first_air_date || movie.name;
    
    if (isTV) {
      navigate(`/tv/${movie.id}`);
    } else {
      navigate(`/movie/${movie.id}`);
    }
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    setMobileMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          handleSuggestionClick(searchSuggestions[selectedSuggestion]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
      default:
        break;
    }
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isVisible ? 'navbar-visible' : 'navbar-hidden'} ${mobileMenuOpen ? 'navbar-mobile-open' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <div className="logo-container">
              <img src={logo} alt="NextWatch" className="logo-image" />
            </div>
          </Link>
        </div>
        
        <button 
          className={`navbar-toggler ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span>Home</span>
            </Link>
            
            <Link 
              to="/whattowatch" 
              className={isActive('/whattowatch') ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14 14 11.99 14 9.5 11.99 5 9.5 5Z" />
              </svg>
              <span>What to Watch</span>
            </Link>
            
            <Link 
              to="/watchlist" 
              className={isActive('/watchlist') ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
              <span>My Watchlist</span>
            </Link>
          </div>
          
          <div className="navbar-search" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="search-input-container">
                <svg className="search-icon" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search movies, shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  className="search-button"
                  aria-label="Search"
                  disabled={!searchQuery.trim()}
                >
                  {isSearching ? (
                    <svg className="search-submit-icon" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                  ) : (
                    <svg className="search-submit-icon" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions" ref={suggestionsRef}>
                {searchSuggestions.map((movie, index) => (
                  <div
                    key={movie.id}
                    className={`suggestion-item ${index === selectedSuggestion ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(movie)}
                    onMouseEnter={() => setSelectedSuggestion(index)}
                  >
                    <div className="suggestion-poster">
                      {movie.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="no-poster">
                          <svg viewBox="0 0 24 24">
                            <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">{movie.title}</div>
                      <div className="suggestion-year">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </div>
                    </div>
                    <div className="suggestion-rating">
                      <svg className="star-icon" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                ))}
                
                {searchQuery.trim() && (
                  <div 
                    className="suggestion-item view-all"
                    onClick={handleSearch}
                  >
                    <div className="view-all-content">
                      <svg className="view-all-icon" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      <span>View all results for "{searchQuery}"</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="navbar-actions">
            <div className="auth-links">
              <Link to="/login" className="auth-link login">Log In</Link>
              <Link to="/signup" className="auth-link signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && <div className="backdrop" onClick={() => setMobileMenuOpen(false)}></div>}
    </nav>
  );
};

export default Navbar;