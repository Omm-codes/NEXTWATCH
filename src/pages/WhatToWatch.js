import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { searchMovies, getPopularMovies, getTrendingMovies, getGenres, getTVShowsByGenre, getPopularTVShows, getDistinctWebSeries, searchMultipleTitles, getEnhancedSearchResults } from '../services/api';
import { getAIRecommendations } from '../services/openai';
import './WhatToWatch.css';

const WhatToWatch = () => {
  const [moodInput, setMoodInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeTab, setActiveTab] = useState('mood'); // 'mood' or 'quiz'
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [moodHighlights, setMoodHighlights] = useState({});

  const exampleMoods = [
    "I'm with my cousins and want something fun and lighthearted",
    "Looking for a romantic movie to watch with my girlfriend",
    "I want to binge-watch a thrilling series this weekend",
    "Need something funny after a long day at work",
    "Want to watch an action-packed movie with friends",
    "Looking for a feel-good family movie",
    "I'm in the mood for something scary and suspenseful",
    "Want to learn something new through documentaries"
  ];

  const quizQuestions = [
    {
      id: 'mood',
      question: 'How are you feeling right now?',
      options: [
        { value: 'happy', label: 'Happy & Energetic' },
        { value: 'relaxed', label: 'Calm & Relaxed' },
        { value: 'adventurous', label: 'Adventurous' },
        { value: 'romantic', label: 'Romantic' },
        { value: 'thoughtful', label: 'Thoughtful' }
      ]
    },
    {
      id: 'time',
      question: 'How much time do you have?',
      options: [
        { value: 'short', label: 'Less than 2 hours' },
        { value: 'medium', label: '2-3 hours' },
        { value: 'long', label: 'Whole evening (3+ hours)' },
        { value: 'series', label: 'Multiple episodes/days' }
      ]
    },
    {
      id: 'genre',
      question: 'What genre appeals to you most?',
      options: [
        { value: 'action', label: 'Action & Adventure' },
        { value: 'comedy', label: 'Comedy' },
        { value: 'drama', label: 'Drama' },
        { value: 'thriller', label: 'Thriller & Mystery' },
        { value: 'scifi', label: 'Sci-Fi & Fantasy' },
        { value: 'romance', label: 'Romance' }
      ]
    },
    {
      id: 'company',
      question: 'Who are you watching with?',
      options: [
        { value: 'alone', label: 'Just me' },
        { value: 'partner', label: 'Partner/Date' },
        { value: 'friends', label: 'Friends' },
        { value: 'family', label: 'Family' }
      ]
    },
    {
      id: 'preference',
      question: 'What do you prefer?',
      options: [
        { value: 'new', label: 'Latest releases' },
        { value: 'popular', label: 'Popular favorites' },
        { value: 'classic', label: 'Classic films' },
        { value: 'hidden', label: 'Hidden gems' }
      ]
    }
  ];

  const analyzeMood = (input) => {
    const text = input.toLowerCase();
    
    // Genre mapping with more keywords
    const genreKeywords = {
      'comedy': ['funny', 'laugh', 'humor', 'lighthearted', 'fun', 'comedy', 'hilarious', 'comic'],
      'action': ['action', 'adventure', 'exciting', 'thrilling', 'adrenaline', 'fast', 'intense'],
      'drama': ['emotional', 'deep', 'meaningful', 'serious', 'touching', 'drama', 'dramatic'],
      'horror': ['scary', 'horror', 'frightening', 'suspenseful', 'terrifying', 'spooky'],
      'romance': ['romantic', 'love', 'date', 'girlfriend', 'boyfriend', 'relationship', 'romantic'],
      'documentary': ['learn', 'educational', 'documentary', 'informative', 'knowledge', 'facts'],
      'thriller': ['suspense', 'mystery', 'thriller', 'intense', 'crime', 'detective']
    };

    // Enhanced time-based keywords
    const timeKeywords = {
      'series': ['series', 'binge', 'episodes', 'show', 'tv show', 'web series', 'season', 'seasons'],
      'movie': ['movie', 'film', 'quick', 'short', 'cinema', 'flick']
    };

    // Content type keywords
    const contentTypeKeywords = {
      'webseries': ['web series', 'webseries', 'online series', 'streaming series'],
      'tv': ['tv show', 'television', 'tv series'],
      'movie': ['movie', 'film', 'cinema']
    };

    let detectedGenre = '';
    let detectedType = 'movie';
    let detectedContentType = '';
    
    // Detect genre
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        detectedGenre = genre;
        break;
      }
    }

    // Detect time preference
    for (const [type, keywords] of Object.entries(timeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        detectedType = type;
        break;
      }
    }

    // Detect specific content type
    for (const [contentType, keywords] of Object.entries(contentTypeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        detectedContentType = contentType;
        break;
      }
    }

    // Override type based on content type detection
    if (detectedContentType === 'webseries' || detectedContentType === 'tv') {
      detectedType = 'series';
    }

    return { 
      genre: detectedGenre, 
      type: detectedType,
      contentType: detectedContentType 
    };
  };

  const getRecommendations = async (searchParams, useAI = true, userInput = '', isQuiz = false, quizAnswers = null) => {
    try {
      let results = [];
      
      if (useAI && (userInput || isQuiz)) {
        // Use OpenAI for intelligent recommendations
        const { titles, error } = await getAIRecommendations(userInput, isQuiz, quizAnswers);
        
        if (!error && titles.length > 0) {
          // Get enhanced search results with mood-based highlights
          const userMood = isQuiz ? quizAnswers.mood : userInput;
          const aiResults = await getEnhancedSearchResults(titles, userMood);
          
          if (aiResults.length > 0) {
            // Store mood highlights
            const highlights = {};
            aiResults.forEach(movie => {
              if (movie.mood_highlight) {
                highlights[movie.id] = movie.mood_highlight;
              }
            });
            setMoodHighlights(highlights);
            
            return aiResults.slice(0, 12);
          }
        }
        
        // If AI fails, fall back to traditional method
        console.log('AI recommendations failed, falling back to traditional method');
      }
      
      // Traditional recommendation logic (fallback)
      const movieGenreMap = {
        'comedy': '35',
        'action': '28',
        'drama': '18',
        'horror': '27',
        'romance': '10749',
        'thriller': '53',
        'documentary': '99'
      };

      const tvGenreMap = {
        'comedy': '35',
        'action': '10759',
        'drama': '18',
        'horror': '27',
        'romance': '10749',
        'thriller': '9648',
        'documentary': '99'
      };
      
      if (searchParams.genre) {
        const movieGenreId = movieGenreMap[searchParams.genre];
        const tvGenreId = tvGenreMap[searchParams.genre];
        
        if (searchParams.type === 'series') {
          const [tvShows, webSeries] = await Promise.all([
            tvGenreId ? getTVShowsByGenre(tvGenreId, 1) : getPopularTVShows(1),
            getDistinctWebSeries(1)
          ]);
          
          const transformedTVShows = (tvShows.results || []).slice(0, 6).map(show => ({
            ...show,
            title: show.name,
            release_date: show.first_air_date,
            media_type: 'tv'
          }));
          
          const transformedWebSeries = (webSeries.results || []).slice(0, 6).map(series => ({
            ...series,
            title: series.name,
            release_date: series.first_air_date,
            media_type: 'webseries'
          }));
          
          results = [...transformedTVShows, ...transformedWebSeries];
        } else {
          if (movieGenreId) {
            const movieResponse = await getPopularMovies(1, movieGenreId);
            results = (movieResponse.results || []).slice(0, 8).map(movie => ({
              ...movie,
              media_type: 'movie'
            }));
          }
          
          const tvResponse = await getPopularTVShows(1);
          const transformedTV = (tvResponse.results || []).slice(0, 4).map(show => ({
            ...show,
            title: show.name,
            release_date: show.first_air_date,
            media_type: 'tv'
          }));
          
          results = [...results, ...transformedTV];
        }
      }
      
      if (results.length === 0) {
        const [movies, tvShows, webSeries] = await Promise.all([
          getTrendingMovies(),
          getPopularTVShows(1),
          getDistinctWebSeries(1)
        ]);
        
        const transformedMovies = (movies.results || []).slice(0, 4).map(movie => ({
          ...movie,
          media_type: 'movie'
        }));
        
        const transformedTVShows = (tvShows.results || []).slice(0, 4).map(show => ({
          ...show,
          title: show.name,
          release_date: show.first_air_date,
          media_type: 'tv'
        }));
        
        const transformedWebSeries = (webSeries.results || []).slice(0, 4).map(series => ({
          ...series,
          title: series.name,
          release_date: series.first_air_date,
          media_type: 'webseries'
        }));
        
        results = [...transformedMovies, ...transformedTVShows, ...transformedWebSeries];
      }
      
      return results.sort(() => Math.random() - 0.5).slice(0, 12);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    
    if (!moodInput.trim()) {
      setError('Please describe your mood or what you\'re looking for');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      const analysis = analyzeMood(moodInput);
      
      // Use AI-powered recommendations with the user input
      const results = await getRecommendations(analysis, true, moodInput, false, null);
      
      setRecommendations(results);
      
      let contentTypeText = 'content';
      if (analysis.type === 'series') {
        contentTypeText = 'TV shows and web series';
      } else if (analysis.contentType === 'movie') {
        contentTypeText = 'movies';
      } else {
        contentTypeText = 'movies and shows';
      }
      
      setAnalysisResult(
        `Based on your mood, I found some great ${analysis.genre || 'personalized'} ${contentTypeText} recommendations for you!`
      );
    } catch (error) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setMoodInput(example);
  };

  // Quiz functions
  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setQuizAnswers({});
    setQuizCompleted(false);
  };

  const handleQuizAnswer = (questionId, answer) => {
    const newAnswers = { ...quizAnswers, [questionId]: answer };
    setQuizAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = async (answers) => {
    setQuizCompleted(true);
    setLoading(true);
    
    try {
      const searchParams = mapQuizAnswersToSearch(answers);
      
      // Use AI-powered recommendations with quiz answers
      const results = await getRecommendations(searchParams, true, '', true, answers);
      
      setRecommendations(results);
      setHasSearched(true);
      setAnalysisResult(generateQuizAnalysis(answers));
    } catch (error) {
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mapQuizAnswersToSearch = (answers) => {
    const genreMapping = {
      'action': 'action',
      'comedy': 'comedy',
      'drama': 'drama',
      'thriller': 'thriller',
      'scifi': 'action',
      'romance': 'romance'
    };

    return {
      genre: genreMapping[answers.genre] || '',
      type: answers.time === 'series' ? 'series' : 'movie'
    };
  };

  const generateQuizAnalysis = (answers) => {
    const mood = answers.mood || 'good';
    const genre = answers.genre || 'popular';
    const company = answers.company || 'yourself';
    const time = answers.time || 'medium';
    
    let contentType = 'content';
    if (time === 'series') {
      contentType = 'TV shows and web series';
    } else if (time === 'short') {
      contentType = 'movies';
    } else {
      contentType = 'movies, TV shows, and web series';
    }
    
    return `Perfect! Based on your ${mood} mood and preference for ${genre} ${contentType}, I've found some great recommendations for you${company !== 'alone' ? ` and your ${company}` : ''}!`;
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setQuizAnswers({});
    setRecommendations([]);
    setHasSearched(false);
    setAnalysisResult('');
  };

  const resetMood = () => {
    setMoodInput('');
    setRecommendations([]);
    setHasSearched(false);
    setAnalysisResult('');
    setError('');
  };

  return (
    <div className="movie-picker-page">
      <div className="mood-container">
        <div className="mood-header">
          <div className="mood-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14 14 11.99 14 9.5 11.99 5 9.5 5Z"/>
            </svg>
          </div>
          <h1 className="mood-title">What to Watch?</h1>
          <p className="mood-subtitle">
            Tell us your mood or take our quick quiz to get personalized recommendations 
            for movies, TV shows, and web series.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="recommendation-tabs">
          <button 
            className={`tab-btn ${activeTab === 'mood' ? 'active' : ''}`}
            onClick={() => setActiveTab('mood')}
          >
            Describe Your Mood
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            Take Quiz
          </button>
        </div>

        {/* Mood Input Tab */}
        {activeTab === 'mood' && (
          <div className="tab-content">
            <div className="mood-input-section">
              <form onSubmit={handleMoodSubmit} className="mood-form">
                <div className="mood-input-container">
                  <textarea
                    className="mood-input"
                    value={moodInput}
                    onChange={(e) => setMoodInput(e.target.value)}
                    placeholder="Describe your mood, who you're with, or what type of content you're looking for..."
                    rows="4"
                  />
                </div>
                
                <div className="mood-examples">
                  {exampleMoods.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      className="example-chip"
                      onClick={() => handleExampleClick(example)}
                    >
                      {example}
                    </button>
                  ))}
                </div>

                <div className="mood-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !moodInput.trim()}
                  >
                    {loading ? 'Finding recommendations...' : 'Get Recommendations'}
                  </button>
                  
                  {hasSearched && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={resetMood}
                    >
                      Start Over
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="tab-content">
            {!quizStarted ? (
              <div className="quiz-intro">
                <h3>Quick Recommendation Quiz</h3>
                <p>Answer 5 simple questions to get personalized recommendations</p>
                <button className="btn btn-primary" onClick={startQuiz}>
                  Start Quiz
                </button>
              </div>
            ) : !quizCompleted ? (
              <div className="quiz-container">
                <div className="quiz-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </span>
                </div>

                <div className="quiz-question">
                  <h3>{quizQuestions[currentQuestion].question}</h3>
                  <div className="quiz-options">
                    {quizQuestions[currentQuestion].options.map((option) => (
                      <button
                        key={option.value}
                        className="quiz-option"
                        onClick={() => handleQuizAnswer(quizQuestions[currentQuestion].id, option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="quiz-complete">
                <h3>Quiz Complete!</h3>
                <p>Getting your personalized recommendations...</p>
                <button className="btn btn-secondary" onClick={resetQuiz}>
                  Take Quiz Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <div className="results-section">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Finding perfect recommendations for you...</p>
              </div>
            ) : (
              <>
                {analysisResult && (
                  <div className="analysis-result">
                    <h3>Here's what I found:</h3>
                    <p>{analysisResult}</p>
                  </div>
                )}
                
                {recommendations.length > 0 ? (
                  <div className="recommendations-grid">
                    {recommendations.map((movie) => (
                      <div key={movie.id} className="recommendation-item">
                        <MovieCard movie={movie} />
                        {moodHighlights[movie.id] && (
                          <div className="mood-highlight">
                            <div className="highlight-badge">
                              <svg viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              Perfect Match
                            </div>
                            <p className="highlight-text">{moodHighlights[movie.id]}</p>
                          </div>
                        )}
                        {movie.is_top_match && (
                          <div className="top-match-badge">
                            <svg viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            Top Pick
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No recommendations found. Try describing your mood differently or browse our categories.</p>
                    <Link to="/movies" className="btn btn-secondary">
                      Browse Movies
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};



export default WhatToWatch;
