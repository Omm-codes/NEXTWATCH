import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies, searchTVShows, searchMulti } from '../services/api';
import MovieCard from '../components/MovieCard';
import { MovieCardSkeleton } from '../components/LoadingSkeleton';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', icon: '🔍' },
    { id: 'movie', label: 'Movies', icon: '🎬' },
    { id: 'tv', label: 'TV Shows', icon: '📺' },
  ];

  useEffect(() => {
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const filter = searchParams.get('type') || 'all';
    
    setSearchQuery(query);
    setCurrentPage(page);
    setActiveFilter(filter);
    
    if (!query) {
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
      return;
    }

    fetchSearchResults(query, page, filter);
  }, [searchParams]);

  const fetchSearchResults = async (query, page, type) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      switch (type) {
        case 'movie':
          data = await searchMovies(query, page);
          // Add media_type to movies
          data.results = data.results.map(item => ({
            ...item,
            media_type: 'movie'
          }));
          break;
        case 'tv':
          data = await searchTVShows(query, page);
          // Transform TV shows and add media_type
          data.results = data.results.map(item => ({
            ...item,
            title: item.name,
            release_date: item.first_air_date,
            media_type: 'tv'
          }));
          break;
        default:
          data = await searchMulti(query, page);
          // Transform mixed results
          data.results = data.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => ({
              ...item,
              title: item.title || item.name,
              release_date: item.release_date || item.first_air_date
            }));
          break;
      }
      
      setResults(data.results || []);
      setTotalPages(Math.min(data.total_pages || 0, 500));
      setTotalResults(data.total_results || 0);
    } catch (err) {
      setError('Failed to fetch search results. Please try again later.');
      console.error('Error searching:', err);
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams();
      newParams.set('query', searchQuery.trim());
      newParams.set('type', activeFilter);
      newParams.set('page', '1');
      setSearchParams(newParams);
    }
  };

  const handleFilterChange = (filterId) => {
    if (searchParams.get('query')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('type', filterId);
      newParams.set('page', '1');
      setSearchParams(newParams);
    }
    setActiveFilter(filterId);
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', page.toString());
      setSearchParams(newParams);
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        {/* Search Header */}
        <div className="search-header">
          <h1 className="search-title">Search</h1>
          <p className="search-subtitle">Discover movies, TV shows, and web series</p>
        </div>

        {/* Search Form */}
        <div className="search-form-container">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <svg className="search-input-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies, TV shows, actors..."
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-submit" disabled={!searchQuery.trim()}>
                Search
              </button>
            </div>
          </form>

          {/* Content Type Filters */}
          {searchParams.get('query') && (
            <div className="search-filters">
              <div className="filter-label">Filter by:</div>
              <div className="filter-tabs">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => handleFilterChange(filter.id)}
                  >
                    <span className="filter-emoji">{filter.icon}</span>
                    <span className="filter-text">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {searchParams.get('query') && (
          <div className="search-results">
            {/* Results Header */}
            <div className="results-header">
              <div className="results-info">
                {loading ? (
                  <div className="results-loading">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Searching...</span>
                  </div>
                ) : error ? (
                  <div className="results-error">
                    <svg className="error-icon" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="results-count">
                    <h2>
                      {formatNumber(totalResults)} result{totalResults !== 1 ? 's' : ''} for "{searchParams.get('query')}
                    </h2>
                    <p>
                      Showing page {currentPage} of {totalPages} 
                      {activeFilter !== 'all' && ` in ${filters.find(f => f.id === activeFilter)?.label}`}
                    </p>
                  </div>
                ) : (
                  <div className="no-results">
                    <h2>No results found for "{searchParams.get('query')}"</h2>
                    <p>Try different keywords or check your spelling</p>
                  </div>
                )}
              </div>

              {!loading && !error && results.length > 0 && (
                <div className="results-meta">
                  <div className="page-info">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="results-grid">
                {Array.from({ length: 20 }).map((_, index) => (
                  <div key={index} className="skeleton-stagger">
                    <MovieCardSkeleton />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="error-container">
                <svg className="error-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p>{error}</p>
                <button onClick={() => fetchSearchResults(searchParams.get('query'), currentPage, activeFilter)} className="retry-button">
                  Try Again
                </button>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="results-grid">
                  {results.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="animate-card"
                      style={{ animationDelay: `${index * 0.02}s` }}
                    >
                      <MovieCard movie={item} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
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
            ) : null}
          </div>
        )}

        {/* Empty State */}
        {!searchParams.get('query') && (
          <div className="search-empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <h2>Start your search</h2>
            <p>Enter a movie title, TV show, or actor name to discover amazing content</p>
            <div className="search-suggestions">
              <p>Popular searches:</p>
              <div className="suggestion-tags">
                <button onClick={() => setSearchQuery('Avengers')} className="suggestion-tag">Avengers</button>
                <button onClick={() => setSearchQuery('Breaking Bad')} className="suggestion-tag">Breaking Bad</button>
                <button onClick={() => setSearchQuery('The Office')} className="suggestion-tag">The Office</button>
                <button onClick={() => setSearchQuery('Stranger Things')} className="suggestion-tag">Stranger Things</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
