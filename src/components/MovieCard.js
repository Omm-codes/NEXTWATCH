import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_IMAGE_URL, POSTER_SIZE } from '../services/api';
import defaultMoviePoster from '../assets/default-movie.png';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const navigate = useNavigate();
  
  const posterPath = movie.poster_path
    ? `${API_IMAGE_URL}${POSTER_SIZE.MEDIUM}${movie.poster_path}`
    : defaultMoviePoster;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  
  // Check if movie is in watchlist
  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem('nextwatch-watchlist')) || [];
    setIsInWatchlist(watchlist.some(item => item.id === movie.id));
  }, [movie.id]);

  // Handle watchlist toggle
  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let watchlist = JSON.parse(localStorage.getItem('nextwatch-watchlist')) || [];
    
    if (isInWatchlist) {
      watchlist = watchlist.filter(item => item.id !== movie.id);
      setIsInWatchlist(false);
    } else {
      const movieToAdd = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview,
        media_type: movie.media_type || 'movie'
      };
      watchlist.push(movieToAdd);
      setIsInWatchlist(true);
    }
    
    localStorage.setItem('nextwatch-watchlist', JSON.stringify(watchlist));
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
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
        
        