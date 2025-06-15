import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { 
  getMoviesByGenre, 
  getPopularMovies, 
  getTopRatedMovies,
  getPopularTVShows, 
  getTopRatedTVShows,
  getTVShowsByGenre,
  getPopularWebSeries,
  getTopRatedWebSeries
} from '../services/api';
import './WhatToWatch.css';

const MoviePicker = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const questions = [
    {
      id: 'mood',
      question: "What's your mood today?",
      options: [
        { value: 'action', label: 'I want excitement and adrenaline!', emoji: '⚡' },
        { value: 'comedy', label: 'I need a good laugh', emoji: '😄' },
        { value: 'drama', label: 'Something deep and emotional', emoji: '🎭' },
        { value: 'horror', label: 'I want to be scared!', emoji: '😱' },
        { value: 'romance', label: 'Something romantic and sweet', emoji: '💕' }
      ]
    },
    {
      id: 'contentType',
      question: "What type of content do you prefer?",
      options: [
        { value: 'movie', label: 'Movies (2-3 hours)', emoji: '🎬' },
        { value: 'tv', label: 'TV Shows (Multiple episodes)', emoji: '📺' },
        { value: 'webseries', label: 'Web Series (Short episodes)', emoji: '💻' },
        { value: 'any', label: "I'm open to anything!", emoji: '🎯' }
      ]
    },
    {
      id: 'timeAvailable',
      question: "How much time do you have?",
      options: [
        { value: 'short', label: 'Under 30 minutes', emoji: '⏰' },
        { value: 'medium', label: '1-2 hours', emoji: '🕐' },
        { value: 'long', label: '2+ hours', emoji: '⏳' },
        { value: 'binge', label: 'All day - let me binge!', emoji: '🛋️' }
      ]
    },
    {
      id: 'era',
      question: "Which era appeals to you?",
      options: [
        { value: 'classic', label: 'Classic films (Before 2000)', emoji: '🎞️' },
        { value: 'modern', label: 'Modern hits (2000-2015)', emoji: '🎪' },
        { value: 'recent', label: 'Latest releases (2015+)', emoji: '✨' },
        { value: 'mixed', label: 'Mix of all eras', emoji: '🎨' }
      ]
    },
    {
      id: 'popularity',
      question: "Do you prefer...",
      options: [
        { value: 'popular', label: 'Popular blockbusters everyone talks about', emoji: '🔥' },
        { value: 'hidden', label: 'Hidden gems and underrated content', emoji: '💎' },
        { value: 'trending', label: 'What\'s trending right now', emoji: '📈' },
        { value: 'classic', label: 'Timeless classics', emoji: '👑' }
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateRecommendations({ ...answers, [questionId]: answer });
    }
  };

  const generateRecommendations = async (userAnswers) => {
    setLoading(true);
    setQuizComplete(true);
    
    try {
      let recommendations = [];
      
      // Enhanced genre mapping with TV genres
      const movieGenreMap = {
        action: [28, 53, 12], // Action, Thriller, Adventure
        comedy: [35, 10751], // Comedy, Family
        drama: [18, 10749, 36], // Drama, Romance, History
        horror: [27, 9648], // Horror, Mystery
        romance: [10749, 35, 18] // Romance, Comedy, Drama
      };

      const tvGenreMap = {
        action: [10759, 80], // Action & Adventure, Crime
        comedy: [35, 10751], // Comedy, Family
        drama: [18, 80, 9648], // Drama, Crime, Mystery
        horror: [9648, 80], // Mystery, Crime
        romance: [18, 10749] // Drama, Romance
      };

      const selectedMovieGenres = movieGenreMap[userAnswers.mood] || [28];
      const selectedTVGenres = tvGenreMap[userAnswers.mood] || [18];
      
      // Content type and time-based logic
      const contentType = userAnswers.contentType;
      const timeAvailable = userAnswers.timeAvailable;
      const era = userAnswers.era;
      const popularity = userAnswers.popularity;

      // Movie recommendations
      if (contentType === 'movie' || contentType === 'any') {
        let movieData;
        
        if (popularity === 'popular') {
          movieData = await getMoviesByGenre(selectedMovieGenres[0], 1);
        } else if (popularity === 'trending') {
          movieData = await getPopularMovies(1);
        } else if (popularity === 'hidden') {
          movieData = await getMoviesByGenre(selectedMovieGenres[1] || selectedMovieGenres[0], 2);
        } else {
          movieData = await getTopRatedMovies(1);
        }
        
        let filteredMovies = movieData.results;
        
        // Filter by era
        if (era !== 'mixed') {
          filteredMovies = filteredMovies.filter(movie => {
            if (!movie.release_date) return false;
            const year = new Date(movie.release_date).getFullYear();
            
            switch (era) {
              case 'classic': return year < 2000;
              case 'modern': return year >= 2000 && year <= 2015;
              case 'recent': return year > 2015;
              default: return true;
            }
          });
        }
        
        // Filter by time available (for movies, check runtime in future API call)
        const movieCount = timeAvailable === 'short' ? 3 : timeAvailable === 'binge' ? 8 : 6;
        recommendations.push(...filteredMovies.slice(0, movieCount));
      }
      
      // TV Show recommendations
      if (contentType === 'tv' || contentType === 'any') {
        let tvData;
        
        if (popularity === 'popular') {
          tvData = await getTVShowsByGenre(selectedTVGenres[0], 1);
        } else if (popularity === 'trending') {
          tvData = await getPopularTVShows(1);
        } else {
          tvData = await getTopRatedTVShows(1);
        }
        
        const transformedTv = tvData.results.slice(0, 4).map(show => ({
          ...show,
          title: show.name,
          release_date: show.first_air_date,
          media_type: 'tv'
        }));
        recommendations.push(...transformedTv);
      }
      
      // Web Series recommendations
      if (contentType === 'webseries' || contentType === 'any') {
        let webSeriesData;
        
        if (popularity === 'popular') {
          webSeriesData = await getPopularWebSeries(1);
        } else {
          webSeriesData = await getTopRatedWebSeries(1);
        }
        
        const transformedWebSeries = webSeriesData.results.slice(0, 4).map(series => ({
          ...series,
          title: series.name,
          release_date: series.first_air_date,
          media_type: 'webseries'
        }));
        recommendations.push(...transformedWebSeries);
      }
      
      // Enhanced sorting based on user preferences
      let sortedRecommendations = recommendations;
      
      if (popularity === 'popular') {
        sortedRecommendations = recommendations.sort((a, b) => b.popularity - a.popularity);
      } else if (popularity === 'classic') {
        sortedRecommendations = recommendations.sort((a, b) => b.vote_average - a.vote_average);
      } else if (popularity === 'trending') {
        sortedRecommendations = recommendations.sort((a, b) => b.vote_count - a.vote_count);
      }
      
      // Remove duplicates and limit results
      const uniqueRecommendations = sortedRecommendations.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      setRecommendations(uniqueRecommendations.slice(0, 12));
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback recommendations
      try {
        const fallbackData = await getPopularMovies(1);
        setRecommendations(fallbackData.results.slice(0, 8));
      } catch (fallbackError) {
        console.error('Error loading fallback recommendations:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setRecommendations([]);
    setQuizComplete(false);
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  if (quizComplete) {
    return (
      <div className="movie-picker-page">
        <div className="results-container">
          <div className="results-header">
            <div className="results-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h1>Your Perfect Matches!</h1>
            <p>Based on your preferences, here are our top recommendations:</p>
            
            <div className="results-actions">
              <button onClick={resetQuiz} className="btn btn-secondary">
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                Take Quiz Again
              </button>
              <Link to="/" className="btn btn-primary">
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Finding your perfect matches...</p>
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendations.map(item => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="movie-picker-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <Link to="/" className="back-btn">
            <svg viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
          </Link>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>
        
        <div className="question-container">
          <h1 className="question-title">{question.question}</h1>
          
          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                className="option-card"
                onClick={() => handleAnswer(question.id, option.value)}
              >
                <div className="option-emoji">{option.emoji}</div>
                <div className="option-text">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePicker;
