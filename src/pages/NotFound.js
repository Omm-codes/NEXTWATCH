import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css'; // We'll create this next

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link to="/movies" className="btn btn-outline">
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;