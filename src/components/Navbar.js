import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { searchMovies } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser, getProfilePhotoLocally } from '../services/firebase';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [localPhotoURL, setLocalPhotoURL] = useState(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);

  const ADMIN_EMAIL = 'omsanjay975@gmail.com';

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
    setShowUserMenu(false);
    setSearchExpanded(false);
  }, [location.pathname]);

  // Netflix-style scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        setSearchExpanded(false);
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
      setSearchExpanded(false);
    }
  };

  const handleSuggestionClick = (movie) => {
    window.scrollTo(0, 0);
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
    setSearchExpanded(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
        setSearchExpanded(false);
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

  // Load local profile photo when user or userProfile changes
  useEffect(() => {
    if (user) {
      const localPhoto = getProfilePhotoLocally(user.uid);
      setLocalPhotoURL(localPhoto);
    } else {
      setLocalPhotoURL(null);
    }
  }, [user, userProfile]);

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${mobileMenuOpen ? 'navbar-mobile-open' : ''}`}>
      <div className="navbar-container">
        {/* Left side - Logo and Navigation */}
        <div className="navbar-left">
          <div className="navbar-brand">
            <Link to="/">
              <img src={logo} alt="NextWatch" className="logo-image" />
            </Link>
          </div>
          
          <div className="navbar-links">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Home
            </Link>
            
            <Link 
              to="/movies" 
              className={location.pathname.startsWith('/movies') ? 'active' : ''}
            >
              Movies
            </Link>
            
            <Link 
              to="/tv" 
              className={location.pathname.startsWith('/tv') ? 'active' : ''}
            >
              TV Shows
            </Link>
            
            <Link 
              to="/webseries" 
              className={location.pathname.startsWith('/webseries') ? 'active' : ''}
            >
              Web Series
            </Link>
            
            <Link 
              to="/whattowatch" 
              className={location.pathname.startsWith('/whattowatch') ? 'active' : ''}
            >
              What to Watch
            </Link>
            
            {user && (
              <Link 
                to="/watchlist" 
                className={location.pathname.startsWith('/watchlist') ? 'active' : ''}
              >
                My List
              </Link>
            )}
            
            {user && user.email === ADMIN_EMAIL && (
              <Link 
                to="/admin" 
                className={location.pathname.startsWith('/admin') ? 'active' : ''}
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Right side - Search and User */}
        <div className="navbar-right">
          <div className="navbar-search" ref={searchRef}>
            <div className={`search-container ${searchExpanded ? 'expanded' : ''}`}>
              <button 
                className="search-toggle"
                onClick={() => setSearchExpanded(!searchExpanded)}
                aria-label="Toggle search"
              >
                <svg className="search-icon" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
              
              <form onSubmit={handleSearch} className={`search-form ${searchExpanded ? 'visible' : ''}`}>
                <input
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setSearchExpanded(true);
                    if (searchQuery.length >= 2) setShowSuggestions(true);
                  }}
                  autoComplete="off"
                />
              </form>
            </div>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && searchExpanded && (
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
                          alt={movie.title || movie.name}
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
                      <div className="suggestion-title">{movie.title || movie.name}</div>
                      <div className="suggestion-year">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 
                         movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : 'N/A'}
                      </div>
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

          {/* User Menu */}
          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button 
                className="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
              >
                <div className="avatar-circle">
                  {localPhotoURL ? (
                    <img src={localPhotoURL} alt={userProfile?.displayName || user.displayName} />
                  ) : user.photoURL ? (
                    <img src={user.photoURL} alt={userProfile?.displayName || user.displayName} />
                  ) : (
                    <span>
                      {userProfile?.firstName?.charAt(0) || 
                       userProfile?.displayName?.charAt(0) || 
                       user.displayName?.charAt(0) || 
                       user.email?.charAt(0) || 'U'}
                    </span>
                  )}
                  <div className="avatar-status"></div>
                </div>
                <div className="user-greeting">
                  <span className="greeting-text">Hi, </span>
                  <span className="user-name-text">
                    {userProfile?.firstName || 
                     userProfile?.displayName?.split(' ')[0] || 
                     user.displayName?.split(' ')[0] || 
                     'User'}
                  </span>
                </div>
                <svg className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`} viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {localPhotoURL ? (
                        <img src={localPhotoURL} alt={userProfile?.displayName || user.displayName} />
                      ) : user.photoURL ? (
                        <img src={user.photoURL} alt={userProfile?.displayName || user.displayName} />
                      ) : (
                        <span>
                          {userProfile?.firstName?.charAt(0) || 
                           userProfile?.displayName?.charAt(0) || 
                           user.displayName?.charAt(0) || 
                           user.email?.charAt(0) || 'U'}
                        </span>
                      )}
                      <div className="user-status-indicator"></div>
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {userProfile?.firstName && userProfile?.lastName 
                          ? `${userProfile.firstName} ${userProfile.lastName}`
                          : userProfile?.displayName || user.displayName || 'User'}
                      </div>
                      <div className="user-email">{user.email}</div>
                      {userProfile?.stats && (
                        <div className="user-stats-preview">
                          <span className="stat-item">
                            <svg viewBox="0 0 24 24">
                              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                            </svg>
                            {userProfile.stats.totalWatchlistItems || 0} in list
                          </span>
                          <span className="stat-item">
                            <svg viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            {(userProfile.stats.totalWatchedMovies || 0) + (userProfile.stats.totalWatchedTVShows || 0)} watched
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <div className="dropdown-section">
                    <Link to="/profile" className="dropdown-item primary" onClick={() => setShowUserMenu(false)}>
                      <div className="dropdown-item-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <div className="dropdown-item-content">
                        <span className="dropdown-item-title">Manage Profile</span>
                        <span className="dropdown-item-subtitle">Edit your personal information</span>
                      </div>
                    </Link>
                    
                    <Link to="/watchlist" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <div className="dropdown-item-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                        </svg>
                      </div>
                      <div className="dropdown-item-content">
                        <span className="dropdown-item-title">My Watchlist</span>
                        <span className="dropdown-item-subtitle">Movies and shows to watch</span>
                      </div>
                    </Link>
                    
                    <Link to="/whattowatch" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <div className="dropdown-item-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div className="dropdown-item-content">
                        <span className="dropdown-item-title">What to Watch</span>
                        <span className="dropdown-item-subtitle">Get mood-based recommendations</span>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <div className="dropdown-section">
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <div className="dropdown-item-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                      </div>
                      <div className="dropdown-item-content">
                        <span className="dropdown-item-title">Sign Out</span>
                        <span className="dropdown-item-subtitle">Sign out of NextWatch</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-btn login-btn">
                <svg className="auth-btn-icon" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Sign In
              </Link>
              <Link to="/signup" className="auth-btn signup-btn">
                <svg className="auth-btn-icon" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button 
          className={`navbar-toggler ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/movies" onClick={() => setMobileMenuOpen(false)}>Movies</Link>
              <Link to="/tv" onClick={() => setMobileMenuOpen(false)}>TV Shows</Link>
              <Link to="/webseries" onClick={() => setMobileMenuOpen(false)}>Web Series</Link>
              <Link to="/whattowatch" onClick={() => setMobileMenuOpen(false)}>What to Watch</Link>
              <Link to="/watchlist" onClick={() => setMobileMenuOpen(false)}>My List</Link>
              
              {user && user.email === ADMIN_EMAIL && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
              )}
            </div>
          </div>
          <div className="backdrop" onClick={() => setMobileMenuOpen(false)}></div>
        </>
      )}
    </nav>
  );
};

export default Navbar;