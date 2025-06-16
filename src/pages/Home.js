import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { MovieCardSkeleton, HeroSkeleton } from '../components/LoadingSkeleton';
import { 
  getTrendingMovies, 
  getPopularMovies, 
  getUpcomingMovies,
  getPopularTVShows,
  getPopularWebSeries,
  searchMovies
} from '../services/api';
import './Home.css';

const Home = () => {
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [popularMovies, setPopularMovies] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // Add filter state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, popular, webSeriesData, tvShows, upcoming] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(1),
          getPopularWebSeries(1),
          getPopularTVShows(1),
          getUpcomingMovies(1)
        ]);

        setHeroMovies(trending.results.slice(0, 5));
        setPopularMovies(popular.results.slice(0, 10));
        setWebSeries(webSeriesData.results.slice(0, 10));
        setPopularTVShows(tvShows.results.slice(0, 10));
        setUpcomingMovies(upcoming.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate hero slides
  useEffect(() => {
    if (heroMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prevIndex) => 
          prevIndex === heroMovies.length - 1 ? 0 : prevIndex + 1
        );
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [heroMovies.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Filter content based on active filter
  const getFilteredSections = () => {
    const allSections = [
      {
        id: 'popular-movies',
        title: 'Popular Movies',
        link: '/movies?category=popular',
        data: popularMovies,
        type: 'movies'
      },
      {
        id: 'web-series',
        title: 'Popular Web Series',
        link: '/webseries?category=popular',
        data: webSeries.map(series => ({
          ...series,
          title: series.name,
          release_date: series.first_air_date,
          media_type: 'webseries'
        })),
        type: 'webseries'
      },
      {
        id: 'tv-shows',
        title: 'Popular TV Shows',
        link: '/tv?category=popular',
        data: popularTVShows.map(show => ({
          ...show,
          title: show.name,
          release_date: show.first_air_date,
          media_type: 'tv'
        })),
        type: 'tv'
      },
      {
        id: 'upcoming-movies',
        title: 'Coming Soon',
        link: '/movies?category=upcoming',
        data: upcomingMovies,
        type: 'movies'
      }
    ];

    switch (activeFilter) {
      case 'movies':
        return allSections.filter(section => section.type === 'movies');
      case 'webseries':
        return allSections.filter(section => section.type === 'webseries');
      case 'tv':
        return allSections.filter(section => section.type === 'tv');
      default:
        return allSections;
    }
  };

  const currentHeroMovie = heroMovies[currentHeroIndex];

  if (loading) {
    return (
      <div className="home-page">
        {/* Hero Skeleton */}
        <HeroSkeleton />

        {/* Quiz Section - Show even during loading */}
        <section className="quiz-section">
          <div className="container">
            <div className="quiz-content">
              <div className="quiz-info">
                <div className="quiz-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14 14 11.99 14 9.5 11.99 5 9.5 5Z"/>
                    <path d="M10.29 8.44L9.5 6l-.79 2.44-.81.25.81.25.79 2.44.79-2.44.81-.25-.81-.25Z"/>
                  </svg>
                </div>
                <div className="quiz-text">
                  <h2>Not Sure What to Watch?</h2>
                  <p>Take our quick quiz and we'll recommend the perfect movie, TV show, or web series just for you!</p>
                  <Link to="/whattowatch" className="quiz-btn">
                    <svg className="quiz-btn-icon" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Start Quiz
                  </Link>
                </div>
              </div>
              <div className="quiz-preview">
                <div className="quiz-card">
                  <div className="quiz-card-icon">❓</div>
                  <h3>Quick & Fun</h3>
                  <p>5 simple questions</p>
                </div>
                <div className="quiz-card">
                  <div className="quiz-card-icon">🎯</div>
                  <h3>Personalized</h3>
                  <p>Tailored recommendations</p>
                </div>
                <div className="quiz-card">
                  <div className="quiz-card-icon">⚡</div>
                  <h3>Instant Results</h3>
                  <p>Get suggestions now</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Filter Section */}
        <section className="content-filter-section">
          <div className="container">
            <div className="filter-header">
              <h2>Browse Content</h2>
              <p>Discover amazing movies, web series and TV shows</p>
            </div>
            
            <div className="content-filter-tabs">
              <button className="filter-tab active">
                <svg className="filter-icon" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                All Content
              </button>
              
              <button className="filter-tab">
                <svg className="filter-icon" viewBox="0 0 24 24">
                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                </svg>
                Movies
              </button>
              
              <button className="filter-tab">
                <svg className="filter-icon" viewBox="0 0 24 24">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5l-1 1v2h8v-2l-1-1h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H3V5h18v10z"/>
                </svg>
                Web Series
              </button>
              
              <button className="filter-tab">
                <svg className="filter-icon" viewBox="0 0 24 24">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5l-1 1v2h8v-2l-1-1h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H3V5h18v10z"/>
                </svg>
                TV Shows
              </button>
            </div>
          </div>
        </section>

        {/* Content Sections with Skeletons */}
        <div className="content-sections">
          <section className="content-section">
            <div className="container">
              <div className="section-header">
                <h2>Popular Movies</h2>
              </div>
              
              <div className="movies-scroll-container">
                <div className="movies-grid-horizontal">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="skeleton-stagger">
                      <MovieCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="content-section">
            <div className="container">
              <div className="section-header">
                <h2>Popular Web Series</h2>
              </div>
              
              <div className="movies-scroll-container">
                <div className="movies-grid-horizontal">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="skeleton-stagger">
                      <MovieCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="content-section">
            <div className="container">
              <div className="section-header">
                <h2>Popular TV Shows</h2>
              </div>
              
              <div className="movies-scroll-container">
                <div className="movies-grid-horizontal">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="skeleton-stagger">
                      <MovieCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="content-section">
            <div className="container">
              <div className="section-header">
                <h2>Coming Soon</h2>
              </div>
              
              <div className="movies-scroll-container">
                <div className="movies-grid-horizontal">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="skeleton-stagger">
                      <MovieCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section with animation */}
      {currentHeroMovie && (
        <section className="hero-section animate-fade-in">
          <div 
            className="hero-background"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${currentHeroMovie.backdrop_path})`
            }}
          />
          <div className="hero-overlay" />
          
          <div className="hero-content">
            <div className="hero-info">
              <div className="hero-badges">
                <span className="badge trending">Trending</span>
                <span className="badge rating">
                  ⭐ {currentHeroMovie.vote_average?.toFixed(1)}
                </span>
              </div>
              
              <h1 className="hero-title">{currentHeroMovie.title}</h1>
              
              <p className="hero-overview">
                {currentHeroMovie.overview?.length > 300 
                  ? currentHeroMovie.overview.substring(0, 300) + '...'
                  : currentHeroMovie.overview}
              </p>
              
              <div className="hero-actions">
                <Link 
                  to={`/movie/${currentHeroMovie.id}`} 
                  className="btn btn-primary btn-large"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch Details
                </Link>
                
                <Link to="/movies" className="btn btn-secondary btn-large">
                  <svg className="btn-icon" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Explore Movies
                </Link>
              </div>
            </div>
            
            <div className="hero-poster">
              <img 
                src={`https://image.tmdb.org/t/p/w500${currentHeroMovie.poster_path}`}
                alt={currentHeroMovie.title}
                className="hero-poster-img"
              />
            </div>
          </div>
          
          {/* Hero Navigation Dots */}
          <div className="hero-navigation">
            {heroMovies.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === currentHeroIndex ? 'active' : ''}`}
                onClick={() => setCurrentHeroIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quiz Section */}
      <section className="quiz-section animate-section" style={{ animationDelay: '0.2s' }}>
        <div className="container">
          <div className="quiz-content">
            <div className="quiz-info">
              <div className="quiz-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14 14 11.99 14 9.5 11.99 5 9.5 5Z"/>
                  <path d="M10.29 8.44L9.5 6l-.79 2.44-.81.25.81.25.79 2.44.79-2.44.81-.25-.81-.25Z"/>
                </svg>
              </div>
              <div className="quiz-text">
                <h2>Not Sure What to Watch?</h2>
                <p>Take our quick quiz and we'll recommend the perfect movie, TV show, or web series just for you!</p>
                <Link to="/whattowatch" className="quiz-btn">
                  <svg className="quiz-btn-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Start Quiz
                </Link>
              </div>
            </div>
            <div className="quiz-preview">
              <div className="quiz-card">
                <div className="quiz-card-icon">❓</div>
                <h3>Quick & Fun</h3>
                <p>5 simple questions</p>
              </div>
              <div className="quiz-card">
                <div className="quiz-card-icon">🎯</div>
                <h3>Personalized</h3>
                <p>Tailored recommendations</p>
              </div>
              <div className="quiz-card">
                <div className="quiz-card-icon">⚡</div>
                <h3>Instant Results</h3>
                <p>Get suggestions now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Filter Section */}
      <section className="content-filter-section animate-section" style={{ animationDelay: '0.3s' }}>
        <div className="container">
          <div className="filter-header">
            <h2>Browse Content</h2>
            <p>Discover amazing movies, web series and TV shows</p>
          </div>
          
          <div className="content-filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <svg className="filter-icon" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              All Content
            </button>
            
            <button 
              className={`filter-tab ${activeFilter === 'movies' ? 'active' : ''}`}
              onClick={() => handleFilterChange('movies')}
            >
              <svg className="filter-icon" viewBox="0 0 24 24">
                <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
              </svg>
              Movies
            </button>
            
            <button 
              className={`filter-tab ${activeFilter === 'webseries' ? 'active' : ''}`}
              onClick={() => handleFilterChange('webseries')}
            >
              <svg className="filter-icon" viewBox="0 0 24 24">
                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5l-1 1v2h8v-2l-1-1h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H3V5h18v10z"/>
              </svg>
              Web Series
            </button>
            
            <button 
              className={`filter-tab ${activeFilter === 'tv' ? 'active' : ''}`}
              onClick={() => handleFilterChange('tv')}
            >
              <svg className="filter-icon" viewBox="0 0 24 24">
                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5l-1 1v2h8v-2l-1-1h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H3V5h18v10z"/>
              </svg>
              TV Shows
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections with stagger animation */}
      <div className="content-sections">
        {getFilteredSections().map((section, sectionIndex) => (
          <section 
            key={section.id} 
            className={`content-section animate-section`}
            style={{ animationDelay: `${0.4 + sectionIndex * 0.1}s` }}
          >
            <div className="container">
              <div className="section-header">
                <h2>{section.title}</h2>
                <Link to={section.link} className="view-all-link">
                  View All
                  <svg viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </Link>
              </div>
              
              <div className="movies-scroll-container">
                <div className="movies-grid-horizontal">
                  {section.data.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="animate-card"
                      style={{ animationDelay: `${0.5 + index * 0.02}s` }}
                    >
                      <MovieCard movie={item} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;
