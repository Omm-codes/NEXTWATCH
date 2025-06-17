import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_IMAGE_URL, POSTER_SIZE } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/firebase';
import defaultMoviePoster from '../assets/default-movie.png';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const [isInWatchlistState, setIsInWatchlistState] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const posterPath = movie.poster_path
    ? `${API_IMAGE_URL}${POSTER_SIZE.MEDIUM}${movie.poster_path}`
    : defaultMoviePoster;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  
  // Check if movie is in watchlist - now using Firebase for authenticated users
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (user) {
        // For authenticated users, check Firebase
        const { isInList } = await isInWatchlist(user.uid, movie.id);
        setIsInWatchlistState(isInList);
      } else {
        // For non-authenticated users, check localStorage (legacy support)
        const watchlist = JSON.parse(localStorage.getItem('nextwatch-watchlist')) || [];
        setIsInWatchlistState(watchlist.some(item => item.id === movie.id));
      }
    };

    checkWatchlistStatus();
  }, [movie.id, user]);

  // Handle watchlist toggle with authentication check
  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!user) {
      // Redirect to login page with current location
      navigate('/login', { 
        state: { 
          from: location,
          message: 'Please sign in to add movies to your watchlist' 
        }
      });
      return;
    }

    setWatchlistLoading(true);
    
    try {
      if (isInWatchlistState) {
        // Remove from watchlist
        const { error } = await removeFromWatchlist(user.uid, movie.id);
        if (!error) {
          setIsInWatchlistState(false);
        }
      } else {
        // Add to watchlist
        const movieData = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          overview: movie.overview,
          media_type: movie.media_type || 'movie'
        };
        
        const { error } = await addToWatchlist(user.uid, movieData);
        if (!error) {
          setIsInWatchlistState(true);
        }
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultMoviePoster;
  };

  // Get details route based on media type
  const getDetailsRoute = () => {
    const mediaType = movie.media_type || 'movie';
    switch (mediaType) {
      case 'tv':
      case 'webseries':
        return `/tv/${movie.id}`;
      default:
        return `/movie/${movie.id}`;
    }
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate(getDetailsRoute());
  };

  return (
    <div className="movie-card-wrapper">
      <Link to={getDetailsRoute()} className="movie-card-link" onClick={handleCardClick}>
        <div className="movie-card-poster-container">
          <img
            src={posterPath}
            alt={`${movie.title} poster`}
            className="movie-card-poster"
            loading="lazy"
            onError={handleImageError}
          />
          
          {/* Rating badge - only show if rating exists */}
          {rating && parseFloat(rating) > 0 && (
            <div className="movie-card-rating">
              <svg className="movie-card-star-icon" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {rating}
            </div>
          )}

          {/* Watchlist button with loading state */}
          <button 
            className={`watchlist-button ${isInWatchlistState ? 'in-watchlist' : ''} ${watchlistLoading ? 'loading' : ''} ${!user ? 'requires-auth' : ''}`}
            onClick={handleWatchlistToggle}
            disabled={watchlistLoading}
            aria-label={
              !user 
                ? "Sign in to add to watchlist"
                : isInWatchlistState 
                  ? "Remove from watchlist" 
                  : "Add to watchlist"
            }
            title={
              !user 
                ? "Sign in to add to watchlist"
                : isInWatchlistState 
                  ? "Remove from watchlist" 
                  : "Add to watchlist"
            }
          >
            {watchlistLoading ? (
              <svg className="watchlist-icon loading-spin" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
            ) : !user ? (
              <svg className="watchlist-icon" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            ) : (
              <svg className="watchlist-icon" viewBox="0 0 24 24">
                {isInWatchlistState ? (
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                ) : (
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                )}
              </svg>
            )}
          </button>
        </div>
        
        <div className="movie-card-info">
          <h3 className="movie-card-title" title={movie.title}>
            {movie.title}
          </h3>
          <p className="movie-card-year">{releaseYear}</p>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;

