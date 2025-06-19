import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { 
  getPopularEnhancedWebSeries,
  getTopRatedEnhancedWebSeries, 
  getCurrentWebSeries,
  getTVShowsByGenre,
  getTVGenres
} from '../services/api';
import './Movies.css'; // Reuse Movies.css styles

const WebSeries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'popular';
  const genreId = searchParams.get('genre') || '';
  
  const [webSeries, setWebSeries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getTVGenres();
        // Filter genres more relevant to web series
        const webSeriesGenres = genresData.genres.filter(genre => 
          [18, 80, 9648, 10759, 10765, 35, 10766, 99].includes(genre.id)
        ); // Drama, Crime, Mystery, Action & Adventure, Sci-Fi & Fantasy, Comedy, Soap, Documentary
        setGenres(webSeriesGenres);
      } catch (err) {
        console.error('Error fetching TV genres:', err);
      }
    };
    
    fetchGenres();
  }, [genreId]);

  useEffect(() => {
    const fetchWebSeries = async () => {
      setLoading(true);
      try {
        let data;
        
        if (genreId) {
          data = await getTVShowsByGenre(genreId, currentPage);
          // Filter results to focus on web series characteristics
          data.results = data.results.filter(show => 
            show.first_air_date >= '2015-01-01' && show.vote_count >= 10
          );
        } else {
          switch (category) {
            case 'top_rated':
              data = await getTopRatedEnhancedWebSeries(currentPage);
              break;
            case 'current':
              data = await getCurrentWebSeries(currentPage);
              break;
            case 'popular':
            default:
              data = await getPopularEnhancedWebSeries(currentPage);
              break;
          }
        }
        
        // Transform TV show data to match movie card format
        const transformedShows = data.results.map(show => ({
          ...show,
          title: show.name,
          release_date: show.first_air_date,
          media_type: 'webseries'
        }));
        
        setWebSeries(transformedShows);
        setTotalPages(Math.min(data.total_pages, 500));
        setError(null);
      } catch (err) {
        setError('Failed to fetch web series. Please try again later.');
        console.error('Error fetching web series:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWebSeries();
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', currentPage.toString());
    setSearchParams(newParams);
  }, [category, genreId, currentPage, searchParams, setSearchParams]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (newCategory) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', newCategory);
    newParams.delete('genre');
    newParams.set('page', '1');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleGenreChange = (e) => {
    const selectedGenreId = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    
    if (selectedGenreId) {
      newParams.set('genre', selectedGenreId);
      newParams.delete('category');
    } else {
      newParams.delete('genre');
      if (!newParams.has('category')) {
        newParams.set('category', 'popular');
      }
    }
    
    newParams.set('page', '1');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const getCategoryTitle = () => {
    if (genreId) return `${genres.find(g => g.id.toString() === genreId)?.name || ''} Web Series`;
    
    switch (category) {
      case 'popular': return 'Popular Web Series';
      case 'top_rated': return 'Top Rated Web Series';
      case 'current': return 'Latest Web Series';
      default: return 'Web Series';
    }
  };

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
                className={`category-tab ${!genreId && category === 'current' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('current')}
              >
                Latest
              </button>
              <button 
                className={`category-tab ${!genreId && category === 'top_rated' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('top_rated')}
              >
                Top Rated
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
                <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
              </svg>
              Need Help Choosing?
            </Link>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading web series...</p>
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
          <div className="movies-grid">
            {webSeries.map(show => (
              <MovieCard key={show.id} movie={show} />
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
    </div>
  );
};

export default WebSeries;
