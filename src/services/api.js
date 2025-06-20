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

// Add missing TV Show API functions
export const getPopularTVShows = (page = 1) => {
  return getApiData('/tv/popular', { page });
};

export const getPopularWebSeries = (page = 1) => {
  // Web series can be filtered TV shows or use popular TV shows
  return getApiData('/tv/popular', { page });
};

export const getTVShowDetails = (tvId) => {
  return getApiData(`/tv/${tvId}`, {
    append_to_response: 'credits,videos,images,recommendations'
  });
};

export const getTVShowVideos = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show videos:', error);
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
export const getTopRatedTVShows = (page = 1) => {
  return getApiData('/tv/top_rated', { page });
};

export const getOnTheAirTVShows = (page = 1) => {
  return getApiData('/tv/on_the_air', { page });
};

// Web Series (using TV shows with specific genres)
export const getWebSeries = (page = 1) => {
  // Get TV shows with Drama, Crime, Mystery genres (typical web series genres)
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648', // Drama, Crime, Mystery
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

// Add the missing getDistinctWebSeries function
export const getDistinctWebSeries = (page = 1) => {
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648,10759', // Drama, Crime, Mystery, Action & Adventure
    sort_by: 'popularity.desc',
    'vote_count.gte': 50,
    'first_air_date.gte': '2018-01-01', // Modern web series
    page
  });
};

// Add getCurrentWebSeries function
export const getCurrentWebSeries = (page = 1) => {
  return getApiData('/discover/tv', {
    with_genres: '18,80,9648,10759,10765', // Popular web series genres
    sort_by: 'first_air_date.desc',
    'first_air_date.gte': '2020-01-01', // Recent web series
    'vote_count.gte': 10,
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

// Multi-search functionality (movies, TV shows, and people)
export const searchMulti = (query, page = 1) => {
  return getApiData('/search/multi', { 
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

// Add streaming providers function
export const getMovieProviders = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie providers:', error);
    throw error;
  }
};

export const getTVProviders = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/watch/providers?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV providers:', error);
    throw error;
  }
};

// Add reviews API functions
export const getMovieReviews = async (movieId, page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    throw error;
  }
};

export const getTVReviews = async (tvId, page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/reviews?api_key=${API_KEY}&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV reviews:', error);
    throw error;
  }
};

// Add function to search for multiple titles
export const searchMultipleTitles = async (titles) => {
  try {
    const searchPromises = titles.map(async (title) => {
      try {
        // Try multi-search first (searches movies, TV shows, and people)
        const multiResults = await searchMulti(title, 1);
        
        // Filter out people and get only movies/TV shows
        const mediaResults = multiResults.results.filter(
          item => item.media_type === 'movie' || item.media_type === 'tv'
        );
        
        if (mediaResults.length > 0) {
          return mediaResults[0]; // Return the best match
        }
        
        // If no results from multi-search, try movie search
        const movieResults = await searchMovies(title, 1);
        if (movieResults.results.length > 0) {
          return { ...movieResults.results[0], media_type: 'movie' };
        }
        
        // If no movie results, try TV search
        const tvResults = await searchTVShows(title, 1);
        if (tvResults.results.length > 0) {
          return { 
            ...tvResults.results[0], 
            media_type: 'tv',
            title: tvResults.results[0].name,
            release_date: tvResults.results[0].first_air_date
          };
        }
        
        return null;
      } catch (error) {
        console.error(`Error searching for "${title}":`, error);
        return null;
      }
    });
    
    const results = await Promise.all(searchPromises);
    
    // Filter out null results and add media_type if missing
    return results
      .filter(result => result !== null)
      .map(result => ({
        ...result,
        title: result.title || result.name,
        release_date: result.release_date || result.first_air_date,
        media_type: result.media_type || 'movie'
      }));
  } catch (error) {
    console.error('Error searching multiple titles:', error);
    return [];
  }
};

// Add function to get enhanced content with AI descriptions
export const getEnhancedContentDetails = async (id, mediaType = 'movie', userPreferences = null) => {
  try {
    let contentData;
    
    if (mediaType === 'tv') {
      contentData = await getTVShowDetails(id);
      contentData = {
        ...contentData,
        title: contentData.name,
        release_date: contentData.first_air_date,
        media_type: 'tv'
      };
    } else {
      contentData = await getMovieDetails(id);
      contentData = {
        ...contentData,
        media_type: 'movie'
      };
    }

    // Import AI functions dynamically to avoid circular dependencies
    const { generateSmartDescription } = await import('./openai');
    
    // Generate smart description
    const { description: aiDescription, error } = await generateSmartDescription(contentData, userPreferences);
    
    if (!error && aiDescription && aiDescription !== contentData.overview) {
      contentData.ai_description = aiDescription;
      contentData.has_ai_description = true;
    }

    return contentData;
  } catch (error) {
    console.error('Error getting enhanced content details:', error);
    // Return basic details if AI enhancement fails
    if (mediaType === 'tv') {
      const data = await getTVShowDetails(id);
      return {
        ...data,
        title: data.name,
        release_date: data.first_air_date,
        media_type: 'tv'
      };
    } else {
      const data = await getMovieDetails(id);
      return {
        ...data,
        media_type: 'movie'
      };
    }
  }
};

// Add function to get enhanced search results with AI highlights
export const getEnhancedSearchResults = async (titles, userMood = null) => {
  try {
    const searchResults = await searchMultipleTitles(titles);
    
    if (userMood && searchResults.length > 0) {
      const { generateMoodBasedHighlight } = await import('./openai');
      
      // Add mood-based highlights to top 3 results
      const enhancedResults = await Promise.all(
        searchResults.slice(0, 3).map(async (movie, index) => {
          try {
            const { highlight } = await generateMoodBasedHighlight(movie, userMood);
            return {
              ...movie,
              mood_highlight: highlight,
              is_top_match: index === 0
            };
          } catch (error) {
            console.error('Error generating highlight:', error);
            return movie;
          }
        })
      );
      
      // Combine enhanced results with remaining results
      return [
        ...enhancedResults,
        ...searchResults.slice(3)
      ];
    }
    
    return searchResults;
  } catch (error) {
    console.error('Error getting enhanced search results:', error);
    return await searchMultipleTitles(titles);
  }
};

export default api;