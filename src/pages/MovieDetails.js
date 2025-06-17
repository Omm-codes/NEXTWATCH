import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getMovieDetails, getTVShowDetails, getMovieVideos, getTVShowVideos, API_IMAGE_URL, POSTER_SIZE, BACKDROP_SIZE } from '../services/api';
import MovieCard from '../components/MovieCard';
import './MovieDetails.css';
import defaultPoster from '../assets/default-movie.png';
import { DetailsSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/firebase';

const MovieDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlistState, setIsInWatchlistState] = useState(false); // Renamed to avoid conflict
  const [showTrailer, setShowTrailer] = useState(false);
  const [showMoviePlayer, setShowMoviePlayer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Determine if this is a TV show or movie based on the route
  const isTV = location.pathname.startsWith('/tv/');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        let data;
        if (isTV) {
          data = await getTVShowDetails(id);
          // Transform TV show data to match movie format
          data = {
            ...data,
            title: data.name,
            release_date: data.first_air_date,
            media_type: 'tv'
          };
        } else {
          data = await getMovieDetails(id);
          data = {
            ...data,
            media_type: 'movie'
          };
        }
        
        setMovie(data);
        
        if (user) {
          // For authenticated users, check Firebase
          const { isInList } = await isInWatchlist(user.uid, parseInt(id));
          setIsInWatchlistState(isInList);
        } else {
          // For non-authenticated users, check localStorage
          const watchlist = JSON.parse(localStorage.getItem('nextwatch-watchlist')) || [];
          setIsInWatchlistState(watchlist.some(item => item.id === parseInt(id)));
        }
        
        setError(null);
        document.title = `${data.title} - NextWatch`;
      } catch (err) {
        setError(`Failed to load ${isTV ? 'TV show' : 'movie'} details. Please try again later.`);
        console.error(`Error fetching ${isTV ? 'TV show' : 'movie'} details:`, err);
      } finally {
        setLoading(false);
      }
    };

    // Scroll to top when component mounts or ID changes
    window.scrollTo(0, 0);
    fetchDetails();
    
    return () => {
      document.title = 'NextWatch';
    };
  }, [id, isTV, user]);

  const handleWatchlistToggle = async () => {
    if (!movie) return;
    
    // Check if user is authenticated
    if (!user) {
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
        const { error } = await removeFromWatchlist(user.uid, movie.id);
        if (!error) {
          setIsInWatchlistState(false);
        }
      } else {
        const movieData = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          overview: movie.overview,
          media_type: movie.media_type || (isTV ? 'tv' : 'movie')
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

  const handleWatchTrailer = async () => {
    if (!movie) return;
    
    try {
      setTrailerLoading(true);
      let videos;
      if (isTV) {
        videos = await getTVShowVideos(movie.id);
      } else {
        videos = await getMovieVideos(movie.id);
      }
      
      const trailer = videos.results.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) || videos.results.find(video => video.site === 'YouTube');
      
      if (trailer) {
        setTrailerKey(trailer.key);
        setShowTrailer(true);
      } else {
        alert(`No trailer available for this ${isTV ? 'TV show' : 'movie'}.`);
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      alert('Failed to load trailer. Please try again.');
    } finally {
      setTrailerLoading(false);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerKey(null);
    setTrailerLoading(false);
  };

  const closeMoviePlayer = () => {
    setShowMoviePlayer(false);
  };

  const handleWatchMovie = (movieTitle) => {
    // Show a loading/redirect modal briefly before opening the external site
    setShowMoviePlayer(true);
    
    // Add a small delay to show the redirect message
    setTimeout(() => {
      window.open('https://netfree2.cc/home', '_blank');
      setShowMoviePlayer(false);
    }, 2000);
  };

  // Keyboard event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showTrailer) {
          closeTrailer();
        }
        if (showMoviePlayer) {
          closeMoviePlayer();
        }
      }
    };

    if (showTrailer || showMoviePlayer) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showTrailer, showMoviePlayer]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !movie) {
    return (
      <div className="error-page">
        <div className="error-content">
          <svg className="error-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <h2>Something went wrong</h2>
          <p>{error || 'Movie not found.'}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Try Again
            </button>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const posterUrl = movie.poster_path 
    ? `${API_IMAGE_URL}${POSTER_SIZE.LARGE}${movie.poster_path}`
    : defaultPoster;
    
  const backdropUrl = movie.backdrop_path 
    ? `${API_IMAGE_URL}${BACKDROP_SIZE.LARGE}${movie.backdrop_path}`
    : null;
    
  const directors = movie.credits.crew.filter(person => person.job === 'Director');
  
  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4caf50';
    if (rating >= 7) return '#ff9800';
    if (rating >= 6) return '#2196f3';
    return '#f44336';
  };

  return (
    <div className="movie-details-page animate-page">
      {/* Movie Player Modal - Now shows redirect message */}
      {showMoviePlayer && (
        <div className="trailer-modal" onClick={closeMoviePlayer}>
          <div className="trailer-content redirect-content" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={closeMoviePlayer}>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="redirect-message">
              <div className="redirect-spinner"></div>
              <h2>Redirecting to Watch "{movie.title}"</h2>
              <p>Opening streaming site in a new tab...</p>
              <p className="redirect-note">If the page doesn't open automatically, please allow pop-ups for this site.</p>
            </div>
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="trailer-modal" onClick={closeTrailer}>
          <div className="trailer-content" onClick={e => e.stopPropagation()}>
            {trailerLoading && (
              <div className="trailer-loading">
                <div className="trailer-loading-spinner"></div>
                <p>Loading trailer...</p>
              </div>
            )}
            
            <button className="trailer-close" onClick={closeTrailer}>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            {trailerKey && (
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                onLoad={() => setTrailerLoading(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Hero Section with animation */}
      <div className="hero-section animate-hero">
        {backdropUrl && (
          <div 
            className="hero-backdrop" 
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}
        <div className="hero-overlay" />
        
        <div className="hero-content">
          <div className="movie-poster-container">
            <img 
              src={posterUrl} 
              alt={`${movie.title} poster`} 
              className="hero-poster"
              onError={(e) => {e.target.onerror = null; e.target.src = defaultPoster}}
            />
            
            {movie.vote_average > 0 && (
              <div 
                className="rating-circle"
                style={{ '--rating-color': getRatingColor(movie.vote_average) }}
              >
                <div className="rating-value">{movie.vote_average.toFixed(1)}</div>
                <div className="rating-label">TMDB</div>
              </div>
            )}
          </div>
          
          <div className="movie-info">
            <div className="movie-badges">
              {movie.adult && <span className="badge adult">18+</span>}
              <span className="badge quality">HD</span>
              {movie.status === 'Released' && <span className="badge status">Released</span>}
            </div>
            
            <h1 className="movie-title">
              {movie.title}
              <span className="release-year">
                ({movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'})
              </span>
            </h1>
            
            <div className="movie-meta">
              {movie.release_date && (
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" className="meta-icon">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  {new Date(movie.release_date).toLocaleDateString()}
                </span>
              )}
              {movie.runtime > 0 && (
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" className="meta-icon">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  {formatRuntime(movie.runtime)}
                </span>
              )}
              {movie.spoken_languages?.length > 0 && (
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" className="meta-icon">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                  </svg>
                  {movie.spoken_languages[0].english_name}
                </span>
              )}
            </div>
            
            <div className="genres">
              {movie.genres.map(genre => (
                <Link 
                  key={genre.id} 
                  to={`/movies?genre=${genre.id}`}
                  className="genre-tag"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
            
            {movie.tagline && (
              <div className="tagline">"{movie.tagline}"</div>
            )}
            
            <div className="overview-section">
              <h3>Overview</h3>
              <p className={showFullOverview ? 'expanded' : ''}>
                {movie.overview || 'No overview available.'}
              </p>
              {movie.overview && movie.overview.length > 300 && (
                <button 
                  className="read-more-btn"
                  onClick={() => setShowFullOverview(!showFullOverview)}
                >
                  {showFullOverview ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                onClick={() => handleWatchMovie(movie.title)} 
                className="btn btn-primary btn-large"
              >
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Now
              </button>
              
              <button 
                onClick={handleWatchTrailer} 
                className="btn btn-secondary btn-large"
                disabled={trailerLoading}
              >
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                {trailerLoading ? 'Loading...' : 'Watch Trailer'}
              </button>
              
              <button 
                className={`btn btn-secondary btn-large ${isInWatchlistState ? 'in-watchlist' : ''} ${!user ? 'requires-auth' : ''}`}
                onClick={handleWatchlistToggle}
                disabled={watchlistLoading}
              >
                <svg className="btn-icon" viewBox="0 0 24 24">
                  {!user ? (
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  ) : isInWatchlistState ? (
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  ) : (
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                  )}
                </svg>
                {watchlistLoading ? 'Loading...' : !user ? 'Sign in to Add' : isInWatchlistState ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section with stagger animation */}
      <div className="details-section">
        {/* Cast Section */}
        {movie.credits?.cast?.length > 0 && (
          <div className="cast-section animate-section" style={{ animationDelay: '0.2s' }}>
            <h3 className="section-title">Cast</h3>
            <div className="cast-grid">
              {movie.credits.cast.slice(0, 8).map((person, index) => (
                <div 
                  key={person.id} 
                  className="cast-card animate-card"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <div className="cast-photo-container">
                    {person.profile_path ? (
                      <img 
                        src={`${API_IMAGE_URL}${POSTER_SIZE.SMALL}${person.profile_path}`} 
                        alt={person.name}
                        className="cast-photo" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="default-cast-photo">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="cast-info">
                    <div className="cast-name">{person.name}</div>
                    <div className="cast-character">{person.character}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crew Section */}
        {directors.length > 0 && (
          <div className="crew-section">
            <h3 className="section-title">Crew</h3>
            <div className="crew-grid">
              <div className="crew-item">
                <h4>Director{directors.length > 1 ? 's' : ''}</h4>
                <p>{directors.map(d => d.name).join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {movie.recommendations.results.length > 0 && (
          <div className="recommendations-section">
            <h3 className="section-title">More Like This</h3>
            <div className="movies-grid">
              {movie.recommendations.results.slice(0, 6).map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;