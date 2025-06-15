import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1 className="about-title">About NextWatch</h1>
            <p className="about-subtitle">
              Your Personal Cinema Companion for Discovering Amazing Content
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-section">
          <div className="section-content">
            <h2 className="section-title">Our Mission</h2>
            <p className="section-text">
              NextWatch is designed to solve the eternal question: "What should I watch next?" 
              We understand that with thousands of movies, TV shows, and web series available, 
              choosing what to watch can be overwhelming. Our platform combines powerful search 
              capabilities with personalized recommendations to help you discover content that 
              matches your mood, preferences, and available time.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="about-section">
          <div className="section-content">
            <h2 className="section-title">What We Offer</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14 14 11.99 14 9.5 11.99 5 9.5 5Z"/>
                  </svg>
                </div>
                <h3>Smart Discovery</h3>
                <p>
                  Take our personalized quiz to get tailored recommendations based on your mood, 
                  available time, and content preferences.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </div>
                <h3>Comprehensive Search</h3>
                <p>
                  Search through thousands of movies, TV shows, and web series with advanced 
                  filtering options by genre, rating, and release date.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <h3>Personal Watchlist</h3>
                <p>
                  Save movies and shows to your personal watchlist to keep track of what 
                  you want to watch later.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3>Trending Content</h3>
                <p>
                  Stay up-to-date with the latest trending movies and shows, plus discover 
                  what's popular and highly rated.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                  </svg>
                </div>
                <h3>Detailed Information</h3>
                <p>
                  Get comprehensive details about each title including cast, ratings, 
                  trailers, and user reviews.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5l-1 1v2h8v-2l-1-1h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H3V5h18v10z"/>
                  </svg>
                </div>
                <h3>Multi-Platform</h3>
                <p>
                  Browse movies, TV shows, and web series all in one place with a clean, 
                  intuitive interface that works on all devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="about-section">
          <div className="section-content">
            <h2 className="section-title">Built With Modern Technology</h2>
            <p className="section-text">
              NextWatch is built using cutting-edge web technologies to provide you with 
              a fast, responsive, and enjoyable browsing experience. Our platform is powered 
              by The Movie Database (TMDB) API, ensuring you get the most up-to-date and 
              comprehensive information about movies and TV shows.
            </p>
            
            <div className="tech-stack">
              <div className="tech-item">
                <span className="tech-name">React</span>
                <span className="tech-description">Modern JavaScript framework</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">TMDB API</span>
                <span className="tech-description">Comprehensive movie database</span>
              </div>
              <div className="tech-item">
                <span className="tech-name">Responsive Design</span>
                <span className="tech-description">Works on all devices</span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-cta">
          <div className="cta-content">
            <h2>Ready to Discover Your Next Favorite?</h2>
            <p>
              Start exploring thousands of movies, TV shows, and web series today. 
              Take our quiz to get personalized recommendations or browse by category.
            </p>
            <div className="cta-buttons">
              <Link to="/whattowatch" className="cta-button primary">
                <svg className="button-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Take the Quiz
              </Link>
              <Link to="/movies" className="cta-button secondary">
                <svg className="button-icon" viewBox="0 0 24 24">
                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                </svg>
                Browse Movies
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
