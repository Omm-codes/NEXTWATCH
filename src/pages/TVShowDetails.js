import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTVShowDetails, getTVShowVideos, API_IMAGE_URL, POSTER_SIZE, BACKDROP_SIZE } from '../services/api';
import MovieCard from '../components/MovieCard';
import './MovieDetails.css';
import defaultPoster from '../assets/default-movie.png';

const TVShowDetails = () => {
  const { id } = useParams();
  const [tvShow, setTVShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);

  useEffect(() => {
    const fetchTVShowDetails = async () => {
      setLoading(true);
      try {
        const data = await getTVShowDetails(id);
        // Transform TV show data to match movie card format
        const transformedData = {
          ...data,
          title: data.name,
          release_date: data.first_air_date,
          media_type: 'tv'
        };
        setTVShow(transformedData);
        
        const watchlist = JSON.parse(localStorage.getItem('nextwatch-watchlist')) || [];
        setIsInWatchlist(watchlist.some(item => item.id === parseInt(id)));
        
        setError(null);
        document.title = `${data.name} - NextWatch`;
      } catch (err) {
        setError('Failed to load TV show details. Please try again later.');
        console.error('Error fetching TV show details:', err);
      } finally {
        setLoading(false);
      }
    };

    // Scroll to top when component mounts or ID changes
    window.scrollTo(0, 0);
    fetchTVShowDetails();
    
    return () => {
      document.title = 'NextWatch';
    };
  }, [id]);

  const handleWatchlistToggle = () => {
    if (!tvShow) return;
    
    let watchlist = JSON.parse(localStorage.getItem('nextwatch-watchlist')) || [];
    
    if (isInWatchlist) {
      watchlist = watchlist.filter(item => item.id !== parseInt(id));
      setIsInWatchlist(false);
    } else {
      const showToAdd = {
        id: tvShow.id,
        title: tvShow.title,
        poster_path: tvShow.poster_path,
        release_date: tvShow.release_date,
        vote_average: tvShow.vote_average,
        overview: tvShow.overview,
        media_type: tvShow.media_type
      };
      
      const existingIndex = watchlist.findIndex(item => item.id === tvShow.id);
      if (existingIndex === -1) {
        watchlist.push(showToAdd);
        setIsInWatchlist(true);
      }
    }
    
    localStorage.setItem('nextwatch-watchlist', JSON.stringify(watchlist));
    window.dispatchEvent(new CustomEvent('watchlistUpdated'));
  };

  const handleWatchTrailer = async () => {
    if (!tvShow) return;
    
    try {
      setTrailerLoading(true);
      const videos = await getTVShowVideos(tvShow.id);
      const trailer = videos.results.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) || videos.results.find(video => video.site === 'YouTube');
      
      if (trailer) {
        setTrailerKey(trailer.key);
        setShowTrailer(true);
      } else {
        alert('No trailer available for this TV show.');
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

  const closePlayer = () => {
    setShowPlayer(false);
  };

  const handleWatchShow = (showTitle) => {
    setShowPlayer(true);
    
    setTimeout(() => {
      window.open('https://netfree2.cc/home', '_blank');
      setShowPlayer(false);
    }, 2000);
  };

  // Keyboard event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showTrailer) {
          closeTrailer();
        }
        if (showPlayer) {
          closePlayer();
        }
      }
    };

    if (showTrailer || showPlayer) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showTrailer, showPlayer]);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-circle"></div>
        <p>Loading TV show details...</p>
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="error-page">
        <div className="error-content">
          <svg className="error-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <h2>Something went wrong</h2>
          <p>{error || 'TV show not found.'}</p>
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

  const posterUrl = tvShow.poster_path 
    ? `${API_IMAGE_URL}${POSTER_SIZE.LARGE}${tvShow.poster_path}`
    : defaultPoster;
    
  const backdropUrl = tvShow.backdrop_path 
    ? `${API_IMAGE_URL}${BACKDROP_SIZE.LARGE}${tvShow.backdrop_path}`
    : null;
    
  const creators = tvShow.created_by || [];
  
  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4caf50';
    if (rating >= 7) return '#ff9800';
    if (rating >= 6) return '#2196f3';
    return '#f44336';
  };

  return (
    <div className="movie-details-page">
      {/* Player Modal */}
      {showPlayer && (
        <div className="trailer-modal" onClick={closePlayer}>
          <div className="trailer-content redirect-content" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={closePlayer}>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="redirect-message">
              <div className="redirect-spinner"></div>
              <h2>Redirecting to Watch "{tvShow.title}"</h2>
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
                title="TV Show Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                onLoad={() => setTrailerLoading(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
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
              alt={`${tvShow.title} poster`} 
              className="hero-poster"
              onError={(e) => {e.target.onerror = null; e.target.src = defaultPoster}}
            />
            
            {tvShow.vote_average > 0 && (
              <div 
                className="rating-circle"
                style={{ '--rating-color': getRatingColor(tvShow.vote_average) }}
              >
                <div className="rating-value">{tvShow.vote_average.toFixed(1)}</div>
                <div className="rating-label">TMDB</div>
              </div>
            )}
          </div>
          
          <div className="movie-info">
            <div className="movie-badges">
              {tvShow.adult && <span className="badge adult">18+</span>}
              <span className="badge quality">HD</span>
              {tvShow.status === 'Ended' && <span className="badge status">Ended</span>}
              {tvShow.status === 'Returning Series' && <span className="badge status">Ongoing</span>}
            </div>
            
            <h1 className="movie-title">
              {tvShow.title}
              <span className="release-year">
                ({tvShow.release_date ? new Date(tvShow.release_date).getFullYear() : 'N/A'})
              </span>
            </h1>
            
            <div className="movie-meta">
              {tvShow.release_date && (
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" className="meta-icon">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  {new Date(tvShow.release_date).toLocaleDateString()}
                </span>
              )}
              {tvShow.number_of_seasons && (
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" className="meta-icon">
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5l-1 1v2h8v-2l-1-1h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H3V5h18v10z"/>
                  </svg>
                  {tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? 's' : ''}
                </span>
              )}
              {tvShow.spoken_languages?.length > 0 && (
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" className="meta-icon">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                  </svg>
                  {tvShow.spoken_languages[0].english_name}
                </span>
              )}
            </div>
            
            <div className="genres">
              {tvShow.genres?.map(genre => (
                <Link 
                  key={genre.id} 
                  to={`/tv?genre=${genre.id}`}
                  className="genre-tag"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
            
            {tvShow.tagline && (
              <div className="tagline">"{tvShow.tagline}"</div>
            )}
            
            <div className="overview-section">
              <h3>Overview</h3>
              <p className={showFullOverview ? 'expanded' : ''}>
                {tvShow.overview || 'No overview available.'}
              </p>
              {tvShow.overview && tvShow.overview.length > 300 && (
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
                onClick={() => handleWatchShow(tvShow.title)} 
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
                className={`btn btn-secondary btn-large ${isInWatchlist ? 'in-watchlist' : ''}`}
                onClick={handleWatchlistToggle}
              >
                <svg className="btn-icon" viewBox="0 0 24 24">
                  {isInWatchlist ? (
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  ) : (
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
                  )}
                </svg>
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="details-section">
        {/* Cast Section */}
        {tvShow.credits?.cast?.length > 0 && (
          <div className="cast-section">
            <h3 className="section-title">Cast</h3>
            <div className="cast-grid">
              {tvShow.credits.cast.slice(0, 8).map(person => (
                <div key={person.id} className="cast-card">
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

        {/* Creators Section */}
        {creators.length > 0 && (
          <div className="crew-section">
            <h3 className="section-title">Creators</h3>
            <div className="crew-grid">
              <div className="crew-item">
                <h4>Created by</h4>
                <p>{creators.map(c => c.name).join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {tvShow.recommendations?.results?.length > 0 && (
          <div className="recommendations-section">
            <h3 className="section-title">More Like This</h3>
            <div className="movies-grid">
              {tvShow.recommendations.results.slice(0, 6).map(show => (
                <MovieCard 
                  key={show.id} 
                  movie={{
                    ...show,
                    title: show.name,
                    release_date: show.first_air_date,
                    media_type: 'tv'
                  }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TVShowDetails;
