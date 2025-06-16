import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('towatch'); // 'towatch' or 'watched'

  useEffect(() => {
    const loadWatchlist = () => {
      setLoading(true);
      
      // Load regular watchlist
      const savedWatchlist = localStorage.getItem('nextwatch-watchlist');
      if (savedWatchlist) {
        try {
          setWatchlist(JSON.parse(savedWatchlist));
        } catch (e) {
          console.error('Failed to parse watchlist from localStorage');
          setWatchlist([]);
        }
      }
      
      // Load watched movies
      const savedWatchedMovies = localStorage.getItem('nextwatch-watched');
      if (savedWatchedMovies) {
        try {
          setWatchedMovies(JSON.parse(savedWatchedMovies));
        } catch (e) {
          console.error('Failed to parse watched movies from localStorage');
          setWatchedMovies([]);
        }
      }
      
      setLoading(false);
    };

    loadWatchlist();

    // Listen for storage changes to update watchlist in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'nextwatch-watchlist' || e.key === 'nextwatch-watched') {
        loadWatchlist();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for same-tab updates
    const handleWatchlistUpdate = () => {
      loadWatchlist();
    };
    
    window.addEventListener('watchlistUpdated', handleWatchlistUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchlistUpdated', handleWatchlistUpdate);
    };
  }, []);

  const removeFromWatchlist = (movieId) => {
    const updatedWatchlist = watchlist.filter(movie => movie.id !== movieId);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('nextwatch-watchlist', JSON.stringify(updatedWatchlist));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const markAsWatched = (movie) => {
    // Remove from watchlist
    const updatedWatchlist = watchlist.filter(item => item.id !== movie.id);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('nextwatch-watchlist', JSON.stringify(updatedWatchlist));
    
    // Add to watched movies with timestamp
    const watchedMovie = {
      ...movie,
      watchedDate: new Date().toISOString()
    };
    
    const updatedWatchedMovies = [...watchedMovies, watchedMovie];
    setWatchedMovies(updatedWatchedMovies);
    localStorage.setItem('nextwatch-watched', JSON.stringify(updatedWatchedMovies));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const markAsUnwatched = (movie) => {
    // Remove from watched movies
    const updatedWatchedMovies = watchedMovies.filter(item => item.id !== movie.id);
    setWatchedMovies(updatedWatchedMovies);
    localStorage.setItem('nextwatch-watched', JSON.stringify(updatedWatchedMovies));
    
    // Add back to watchlist (remove watchedDate)
    const { watchedDate, ...movieWithoutDate } = movie;
    const updatedWatchlist = [...watchlist, movieWithoutDate];
    setWatchlist(updatedWatchlist);
    localStorage.setItem('nextwatch-watchlist', JSON.stringify(updatedWatchlist));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const removeFromWatched = (movieId) => {
    const updatedWatchedMovies = watchedMovies.filter(movie => movie.id !== movieId);
    setWatchedMovies(updatedWatchedMovies);
    localStorage.setItem('nextwatch-watched', JSON.stringify(updatedWatchedMovies));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const clearAllWatched = () => {
    if (window.confirm('Are you sure you want to clear all watched movies? This action cannot be undone.')) {
      setWatchedMovies([]);
      localStorage.removeItem('nextwatch-watched');
      window.dispatchEvent(new CustomEvent('watchlistUpdated'));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your watchlist...</p>
      </div>
    );
  }

  const currentMovies = activeTab === 'towatch' ? watchlist : watchedMovies;
  const totalMovies = watchlist.length + watchedMovies.length;

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1 className="page-title">My Watchlist</h1>
        {totalMovies > 0 && (
          <div className="watchlist-stats">
            <span className="movie-count">
              {watchlist.length} to watch • {watchedMovies.length} watched
            </span>
          </div>
        )}
      </div>
      
      {totalMovies > 0 ? (
        <>
          {/* Tab Navigation */}
          <div className="watchlist-tabs">
            <button 
              className={`tab-button ${activeTab === 'towatch' ? 'active' : ''}`}
              onClick={() => setActiveTab('towatch')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
              </svg>
              To Watch ({watchlist.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'watched' ? 'active' : ''}`}
              onClick={() => setActiveTab('watched')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Watched ({watchedMovies.length})
            </button>
          </div>

          {/* Clear All Button for Watched Tab */}
          {activeTab === 'watched' && watchedMovies.length > 0 && (
            <div className="section-actions">
              <button onClick={clearAllWatched} className="clear-all-btn">
                <svg className="clear-icon" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Clear All Watched
              </button>
            </div>
          )}
          
          {/* Movies Grid */}
          {currentMovies.length > 0 ? (
            <div className="watchlist-grid">
              {currentMovies.map(movie => (
                <div key={movie.id} className="watchlist-card">
                  <MovieCard movie={movie} />
                  
                  {/* Action buttons based on current tab */}
                  <div className="movie-actions">
                    {activeTab === 'towatch' ? (
                      <>
                        <button 
                          className="action-btn watched-btn" 
                          onClick={() => markAsWatched(movie)}
                          title="Mark as watched"
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Watched
                        </button>
                        <button 
                          className="action-btn remove-btn" 
                          onClick={() => removeFromWatchlist(movie.id)}
                          title="Remove from watchlist"
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="action-btn unwatch-btn" 
                          onClick={() => markAsUnwatched(movie)}
                          title="Mark as unwatched"
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                          </svg>
                          Unwatch
                        </button>
                        <button 
                          className="action-btn remove-btn" 
                          onClick={() => removeFromWatched(movie.id)}
                          title="Remove from history"
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Watched date for watched movies */}
                  {activeTab === 'watched' && movie.watchedDate && (
                    <div className="watched-date">
                      Watched on {new Date(movie.watchedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24">
                  {activeTab === 'towatch' ? (
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
                  ) : (
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  )}
                </svg>
              </div>
              <h3>
                {activeTab === 'towatch' 
                  ? 'No movies in your watchlist' 
                  : 'No watched movies yet'
                }
              </h3>
              <p>
                {activeTab === 'towatch'
                  ? 'Start adding content to keep track of what you want to watch'
                  : 'Mark content as watched to keep track of what you\'ve seen'
                }
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="empty-watchlist">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
            </svg>
          </div>
          <h3>Your watchlist is empty</h3>
          <p>Start adding movies to keep track of what you want to watch</p>
          <Link to="/movies" className="btn btn-primary">Browse Movies</Link>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
