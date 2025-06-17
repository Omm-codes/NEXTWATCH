import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section brand-section">
          <div className="logo-container">
            <img src={logo} alt="NextWatch" className="footer-logo-image" />
            <h3></h3>
          </div>
          <p>Discover. Watch. Enjoy. Your personal cinema companion for the best movies and TV shows.</p>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/om-chavan003" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/om_chavan_003" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </a>
            <a href="https://www.pinterest.com/Om_mmi" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <svg viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C8.46,20.5 8.15,19.13 8.41,18.02C8.64,17 9.74,12.65 9.74,12.65C9.74,12.65 9.45,12.08 9.45,11.22C9.45,9.85 10.28,8.83 11.32,8.83C12.2,8.83 12.62,9.47 12.62,10.25C12.62,11.13 12.04,12.45 11.74,13.66C11.5,14.61 12.18,15.4 13.11,15.4C14.81,15.4 16.09,13.58 16.09,10.91C16.09,8.55 14.37,6.95 12,6.95C9.23,6.95 7.6,9 7.6,11.21C7.6,12.08 7.91,13 8.31,13.45C8.4,13.55 8.41,13.64 8.38,13.75C8.31,14.03 8.17,14.65 8.14,14.78C8.1,14.95 8,15 7.81,14.9C6.67,14.38 5.95,12.6 5.95,11.16C5.95,7.95 8.23,5.03 12.29,5.03C15.59,5.03 18.16,7.33 18.16,10.84C18.16,14.56 15.97,17.5 12.94,17.5C11.89,17.5 10.91,16.96 10.58,16.3C10.58,16.3 10.05,18.25 9.93,18.73C9.68,19.64 9.07,20.83 8.67,21.54C9.74,21.83 10.85,22 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/whattowatch">What to Watch</Link></li>
            <li><Link to="/watchlist">My Watchlist</Link></li>
            <li><Link to="/search">Search</Link></li>
            <li><Link to="/movies">Browse Movies</Link></li>
            <li><Link to="/tv">Browse TV Shows</Link></li>
            <li><Link to="/webseries">Browse Web Series</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/movies?category=popular">Popular Movies</Link></li>
            <li><Link to="/webseries?category=popular">Popular Web Series</Link></li>
            <li><Link to="/movies?category=upcoming">Coming Soon</Link></li>
            <li><Link to="/movies?category=now_playing">In Theaters</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About NextWatch</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><a href="mailto:omsanjay975@gmail.com">Email Support</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><a href="https://www.themoviedb.org/terms-of-use" target="_blank" rel="noopener noreferrer">TMDB Terms</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-divider"></div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <p>&copy; {currentYear} NextWatch. Made with ❤️ for movie lovers everywhere.</p>
          <p>
            Movie data provided by{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="tmdb-link"
            >
              The Movie Database (TMDB)
            </a>
          </p>
        </div>
        <div className="footer-bottom-right">
          <div className="app-links">
            <span>Connect with us:</span>
            <Link to="/contact" className="app-link">
              <svg viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

