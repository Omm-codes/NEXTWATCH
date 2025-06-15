import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_IMAGE_URL, POSTER_SIZE } from '../services/api';
import defaultMoviePoster from '../assets/default-movie.png';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const posterPath = movie.poster_path
    ? `${API_IMAGE_URL}${POSTER_SIZE.MEDIUM}${movie.poster_path}`
    : defaultMoviePoster;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  
  // Check if movie is in watchlist when component mounts
  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem('nextwatch-watchlist')) || [];
    setIsInWatchlist(watchlist.some(item => item.id === movie.id));
  }, [movie.id]);

  // Handle adding/removing from watchlist
  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let watchlist = JSON.parse(localStorage.getItem('nextwatch-watchlist')) || [];
    
    if (isInWatchlist) {
      // Remove from watchlist
      watchlist = watchlist.filter(item => item.id !== movie.id);
      setIsInWatchlist(false);
    } else {
      // Add to watchlist
      const movieToAdd = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview
      };
      watchlist.push(movieToAdd);
      setIsInWatchlist(true);
    }
    
    localStorage.setItem('nextwatch-watchlist', JSON.stringify(watchlist));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultMoviePoster;
  };

  return (
    <div className="movie-card-wrapper">
      <Link to={`/movie/${movie.id}`} className="movie-card-link">
        <div className="movie-card-poster-container">
          <img
            src={posterPath}
            alt={`${movie.title} poster`}
            className="movie-card-poster"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          
          {/* Rating badge */}
          {rating !== 'N/A' && (
            <div className="movie-card-rating">
              <svg className="movie-card-star-icon" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {rating}
            </div>
          )}

          {/* Watchlist button */}
          <button 
            className={`watchlist-button ${isInWatchlist ? 'in-watchlist' : ''}`}
            onClick={handleWatchlistToggle}
            aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            <svg className="watchlist-icon" viewBox="0 0 24 24">
              {isInWatchlist ? (
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              ) : (
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
              )}
            </svg>
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
