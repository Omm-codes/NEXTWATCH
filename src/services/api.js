import axios from 'axios';
const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// TMDB API configuration
export const API_IMAGE_URL = 'https://image.tmdb.org/t/p/';

export const POSTER_SIZE = {
  SMALL: 'w185',
  MEDIUM: 'w342',
  LARGE: 'w500',
  ORIGINAL: 'original'
};

export const BACKDROP_SIZE = {
  SMALL: 'w300',
  MEDIUM: 'w780',
  LARGE: 'w1280',
  ORIGINAL: 'original'
};

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.REACT_APP_API_KEY,
    language: 'en-US',
  },
});

// Helper function to handle API responses
const getApiData = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

// Movies API methods
export const getPopularMovies = (page = 1) => {
  return getApiData('/movie/popular', { page });
};

export const getTopRatedMovies = (page = 1) => {
  return getApiData('/movie/top_rated', { page });
};

export const getNowPlayingMovies = (page = 1) => {
  return getApiData('/movie/now_playing', { page });
};

export const getUpcomingMovies = (page = 1) => {
  return getApiData('/movie/upcoming', { page });
};

export const getMovieGenres = () => {
  return getApiData('/genre/movie/list');
};

export const getMoviesByGenre = (genreId, page = 1) => {
  return getApiData('/discover/movie', { 
    with_genres: genreId,
    page
  });
};

export const searchMovies = (query, page = 1) => {
  return getApiData('/search/movie', { 
    query,
    page 
  });
};

export const getMovieDetails = (movieId) => {
  return getApiData(`/movie/${movieId}`, {
    append_to_response: 'credits,videos,images,recommendations'
  });
};

export const getMovieVideos = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    throw error;
  }
};

// Add trending movies function
export const getTrendingMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

// Add trending TV shows function
export const getTrendingTVShows = async () => {
  try {
    const response = await fetch(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    throw error;
  }
};

// TV Shows endpoints
export const getPopularTVShows = (page = 1) => {
  return getApiData('/tv/popular', { page });
};

export const getTopRatedTVShows = (page = 1) => {
  return getApiData('/tv/top_rated', { page });
};

export const getOnTheAirTVShows = (page = 1) => {
  return getApiData('/tv/on_the_air', { page });
};

export const getTVShowDetails = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,recommendations`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw error;
  }
};

export const getTVShowVideos = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${id}/videos?api_key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show videos:', error);
    throw error;
  }
};

// Web Series (using TV shows with specific genres)
export const getWebSeries = (page = 1) => {
  // Get TV shows with Drama, Crime, Mystery genres (typical web series genres)
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648', // Drama, Crime, Mystery
    page
  });
};

export const getPopularWebSeries = (page = 1) => {
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648',
    sort_by: 'popularity.desc',
    page
  });
};

export const getTopRatedWebSeries = (page = 1) => {
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648',
    sort_by: 'vote_average.desc',
    'vote_count.gte': 100,
    page
  });
};

// Enhanced Web Series endpoints
export const getEnhancedWebSeries = (page = 1) => {
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648,10765', // Drama, Crime, Mystery, Sci-Fi & Fantasy
    sort_by: 'popularity.desc',
    'vote_count.gte': 50,
    page
  });
};

export const getPopularEnhancedWebSeries = (page = 1) => {
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648,10765',
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
    page
  });
};

export const getTopRatedEnhancedWebSeries = (page = 1) => {
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648,10765',
    sort_by: 'vote_average.desc',
    'vote_count.gte': 200,
    page
  });
};

// Enhanced recommendation function
export const getRecommendationsByGenreAndYear = async (genres, startYear, endYear, mediaType = 'movie', page = 1) => {
  const endpoint = mediaType === 'movie' ? '/discover/movie' : '/discover/tv';
  
  return getApiData(endpoint, {
    with_genres: genres.join(','),
    'primary_release_date.gte': `${startYear}-01-01`,
    'primary_release_date.lte': `${endYear}-12-31`,
    sort_by: 'vote_average.desc',
    'vote_count.gte': 100,
    page
  });
};

// Search functionality for TV shows and web series
export const searchTVShows = (query, page = 1) => {
  return getApiData('/search/tv', { 
    query,
    page 
  });
};

// TV Show genres
export const getTVGenres = () => {
  return getApiData('/genre/tv/list');
};

export const getTVShowsByGenre = (genreId, page = 1) => {
  return getApiData('/discover/tv', { 
    with_genres: genreId,
    page
  });
};

export default api;