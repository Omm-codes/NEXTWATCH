import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserWatchlist, 
  getUserWatchedMovies, 
  removeFromWatchlist, 
  markAsWatched,
  removeFromWatched
} from '../services/firebase';
import MovieCard from '../components/MovieCard';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('towatch');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: { pathname: '/watchlist' },
          message: 'Please sign in to access your watchlist' 
        }
      });
      return;
    }

    const loadWatchlistData = async () => {
      setLoading(true);
      try {
        const [watchlistResult, watchedResult] = await Promise.all([
          getUserWatchlist(user.uid),
          getUserWatchedMovies(user.uid)
        ]);

        if (!watchlistResult.error) {
          setWatchlist(watchlistResult.watchlist || []);
        } else {
          console.error('Failed to load watchlist:', watchlistResult.error);
          setWatchlist([]);
        }

        if (!watchedResult.error) {
          setWatchedMovies(watchedResult.watchedMovies || []);
        } else {
          console.error('Failed to load watched movies:', watchedResult.error);
          setWatchedMovies([]);
        }
      } catch (error) {
        console.error('Error loading watchlist data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlistData();
  }, [user, navigate]);

  const handleRemoveFromWatchlist = async (movieId) => {
    if (!user) return;

    try {
      const { error } = await removeFromWatchlist(user.uid, movieId);
      if (!error) {
        setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleMarkAsWatched = async (movie) => {
    if (!user) return;

    try {
      await Promise.all([
        removeFromWatchlist(user.uid, movie.id),
        markAsWatched(user.uid, movie)
      ]);
      setWatchlist(prev => prev.filter(item => item.id !== movie.id));
      setWatchedMovies(prev => [...prev, { ...movie, watchedAt: new Date().toISOString() }]);
    } catch (error) {
      console.error('Error marking as watched:', error);
    }
  };

  const handleMarkAsUnwatched = (movie) => {
    const updatedWatchedMovies = watchedMovies.filter(item => item.id !== movie.id);
    setWatchedMovies(updatedWatchedMovies);

    const { watchedDate, watchedAt, ...movieWithoutDate } = movie;
    const updatedWatchlist = [...watchlist, movieWithoutDate];
    setWatchlist(updatedWatchlist);
  };

  const handleRemoveFromWatched = async (movieId) => {
    if (!user) return;

    try {
      const { error } = await removeFromWatched(user.uid, movieId);
      if (!error) {
        setWatchedMovies(prev => prev.filter(movie => movie.id !== movieId));
      }
    } catch (error) {
      console.error('Error removing from watched:', error);
    }
  };

  const clearAllWatched = async () => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to clear all watched movies? This action cannot be undone.')) {
      try {
        // Remove all watched movies from Firebase
        const removePromises = watchedMovies.map(movie => removeFromWatched(user.uid, movie.id));
        await Promise.all(removePromises);
        setWatchedMovies([]);
      } catch (error) {
        console.error('Error clearing watched movies:', error);
      }
    }
  };

  if (!user) {
    return null;
  }

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

          {currentMovies.length > 0 ? (
            <div className="watchlist-grid">
              {currentMovies.map(movie => (
                <div key={movie.id} className="watchlist-card">
                  <MovieCard movie={movie} />

                  <div className="movie-actions">
                    {activeTab === 'towatch' ? (
                      <>
                        <button 
                          className="action-btn watched-btn" 
                          onClick={() => handleMarkAsWatched(movie)}
                          title="Mark as watched"
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Watched
                        </button>
                        <button 
                          className="action-btn remove-btn" 
                          onClick={() => handleRemoveFromWatchlist(movie.id)}
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
                          onClick={() => handleMarkAsUnwatched(movie)}
                          title="Mark as unwatched"
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                          </svg>
                          Unwatch
                        </button>
                        <button 
                          className="action-btn remove-btn" 
                          onClick={() => handleRemoveFromWatched(movie.id)}
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

                  {activeTab === 'watched' && (movie.watchedDate || movie.watchedAt) && (
                    <div className="watched-date">
                      Watched on {new Date(movie.watchedDate || movie.watchedAt).toLocaleDateString()}
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
