import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies, 
  getMoviesByGenre,
  getMovieGenres
} from '../services/api';
import './Movies.css';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'popular';
  const genreId = searchParams.get('genre') || '';
  
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGenreName, setSelectedGenreName] = useState('');

  // Update currentPage when URL changes
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(urlPage);
  }, [searchParams]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getMovieGenres();
        setGenres(genresData.genres);
        
        if (genreId) {
          const selectedGenre = genresData.genres.find(g => g.id.toString() === genreId);
          if (selectedGenre) {
            setSelectedGenreName(selectedGenre.name);
          }
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    
    fetchGenres();
  }, [genreId]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      
      // Validate page number
      if (currentPage < 1) {
        setError('Invalid page number');
        setLoading(false);
        return;
      }
      
      try {
        let data;
        
        if (genreId) {
          data = await getMoviesByGenre(genreId, currentPage);
        } else {
          switch (category) {
            case 'top_rated':
              data = await getTopRatedMovies(currentPage);
              break;
            case 'now_playing':
              data = await getNowPlayingMovies(currentPage);
              break;
            case 'upcoming':
              data = await getUpcomingMovies(currentPage);
              break;
            case 'popular':
            default:
              data = await getPopularMovies(currentPage);
              break;
          }
        }
        
        setMovies(data.results || []);
        setTotalPages(Math.min(data.total_pages || 0, 500)); // TMDB API limits to 500 pages
      } catch (err) {
        setError('Failed to fetch movies. Please try again later.');
        console.error('Error fetching movies:', err);
        setMovies([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [category, genreId, currentPage]);

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', page.toString());
      setSearchParams(newParams, { replace: true });
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryChange = (newCategory) => {
    if (newCategory !== category) {
      const newParams = new URLSearchParams();
      newParams.set('category', newCategory);
      newParams.set('page', '1');
      setSearchParams(newParams);
      setCurrentPage(1);
    }
  };

  const handleGenreChange = (e) => {
    const selectedGenreId = e.target.value;
    const newParams = new URLSearchParams();
    
    if (selectedGenreId) {
      newParams.set('genre', selectedGenreId);
    } else {
      newParams.set('category', 'popular');
    }
    
    newParams.set('page', '1');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const getCategoryTitle = () => {
    if (genreId) return `${selectedGenreName} Movies`;
    
    switch (category) {
      case 'popular': return 'Popular Movies';
      case 'top_rated': return 'Top Rated Movies';
      case 'now_playing': return 'Now Playing';
      case 'upcoming': return 'Upcoming Movies';
      default: return 'Movies';
    }
  };

  // Generate page range for pagination
  const getPageRange = () => {
    const range = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  };

  return (
    <div className="movies-page">
      <div className="header-container">
        <h1 className="page-title">{getCategoryTitle()}</h1>
        
        <div className="filter-controls">
          <div className="filter-left">
            <div className="category-tabs">
              <button 
                className={`category-tab ${!genreId && category === 'popular' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('popular')}
              >
                Popular
              </button>
              <button 
                className={`category-tab ${!genreId && category === 'now_playing' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('now_playing')}
              >
                Now Playing
              </button>
              <button 
                className={`category-tab ${!genreId && category === 'top_rated' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('top_rated')}
              >
                Top Rated
              </button>
              <button 
                className={`category-tab ${!genreId && category === 'upcoming' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('upcoming')}
              >
                Upcoming
              </button>
            </div>
          </div>
          
          <div className="filter-right">
            <div className="genre-filter">
              <select 
                value={genreId} 
                onChange={handleGenreChange}
                className="genre-select"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Link to="/whattowatch" className="help-button" title="Get personalized recommendations">
              <svg className="help-icon" viewBox="0 0 24 24">
                <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
              </svg>
              Need Help Choosing?
            </Link>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading movies...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <svg className="error-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {movies.length === 0 ? (
            <div className="no-results">
              <svg className="no-results-icon" viewBox="0 0 24 24">
                <path d="M18 13v7H4V6h5.02c.05-.71.22-1.38.48-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5l-2-2zm-1.5 5h-11l2.75-3.53 1.96 2.36 2.75-3.54L16.5 18zm2.8-9.11c.44-.7.7-1.51.7-2.39C20 4.01 17.99 2 15.5 2S11 4.01 11 6.5s2.01 4.5 4.49 4.5c.88 0 1.7-.26 2.39-.7L21 13.42 22.42 12 19.3 8.89zM15.5 9C14.12 9 13 7.88 13 6.5S14.12 4 15.5 4 18 5.12 18 6.5 16.88 9 15.5 9z" />
              </svg>
              <p>No movies found for this selection.</p>
              <button onClick={() => handleCategoryChange('popular')} className="reset-button">
                View Popular Movies
              </button>
            </div>
          ) : (
            <>
              <div className="movies-grid">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(1)} 
                    disabled={currentPage === 1}
                    className="pagination-btn first-page"
                    title="First Page"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="pagination-btn prev-page"
                    title="Previous Page"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
                    </svg>
                  </button>
                  
                  <div className="page-numbers">
                    {getPageRange().map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`page-number ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn next-page"
                    title="Next Page"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handlePageChange(totalPages)} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn last-page"
                    title="Last Page"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Movies;