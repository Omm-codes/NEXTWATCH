import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../services/api';
import MovieCard from '../components/MovieCard';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const query = searchParams.get('query') || '';
    setSearchQuery(query);
    
    if (!query) {
      setMovies([]);
      setTotalPages(0);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const data = await searchMovies(query, currentPage);
        setMovies(data.results);
        setTotalPages(Math.min(data.total_pages, 500)); // TMDB API limits to 500 pages
        setError(null);
      } catch (err) {
        setError('Failed to fetch search results. Please try again later.');
        console.error('Error searching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ query: searchQuery.trim() });
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Optionally update URL with page number
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page);
    setSearchParams(newSearchParams);
    window.scrollTo(0, 0);
  };

  return (
    <div className="search-page">
      <h1 className="page-title">Search Movies</h1>
      
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for movies..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : searchParams.get('query') && error ? (
        <div className="error-message">{error}</div>
      ) : searchParams.get('query') ? (
        <>
          <div className="search-results-header">
            {movies.length > 0 ? (
              <h2>Search results for "{searchParams.get('query')}"</h2>
            ) : (
              <h2>No results found for "{searchParams.get('query')}"</h2>
            )}
          </div>
          
          <div className="movies-grid">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="page-info">Page {currentPage} of {totalPages}</span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="search-prompt">
          <p>Enter a movie title to search</p>
        </div>
      )}
    </div>
  );
};

export default Search;
