import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ 
  width = '100%', 
  height = '200px', 
  borderRadius = '8px',
  variant = 'rectangular',
  lines = 1,
  className = ''
}) => {
  if (variant === 'text') {
    return (
      <div className={`skeleton-container ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="skeleton skeleton-text"
            style={{
              width: index === lines - 1 ? '80%' : width,
              height: height,
              borderRadius
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={`skeleton skeleton-circular ${className}`}
        style={{
          width: width,
          height: height,
          borderRadius: '50%'
        }}
      />
    );
  }

  return (
    <div
      className={`skeleton skeleton-rectangular ${className}`}
      style={{
        width,
        height,
        borderRadius
      }}
    />
  );
};

export const MovieCardSkeleton = () => (
  <div className="movie-card-skeleton">
    <LoadingSkeleton 
      height="300px" 
      borderRadius="12px 12px 0 0"
      className="skeleton-poster"
    />
    <div className="skeleton-info">
      <LoadingSkeleton 
        variant="text" 
        height="16px" 
        lines={2}
        className="skeleton-title"
      />
      <LoadingSkeleton 
        variant="text" 
        height="12px" 
        width="60%"
        className="skeleton-year"
      />
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="hero-skeleton">
    <LoadingSkeleton 
      height="500px" 
      borderRadius="0"
      className="skeleton-hero-bg"
    />
    <div className="hero-skeleton-content">
      <div className="hero-skeleton-info">
        <LoadingSkeleton 
          variant="text" 
          height="24px" 
          width="300px"
          className="skeleton-hero-title"
        />
        <LoadingSkeleton 
          variant="text" 
          height="16px" 
          lines={3}
          className="skeleton-hero-description"
        />
        <div className="skeleton-hero-buttons">
          <LoadingSkeleton width="120px" height="44px" borderRadius="8px" />
          <LoadingSkeleton width="140px" height="44px" borderRadius="8px" />
        </div>
      </div>
      <LoadingSkeleton 
        width="200px" 
        height="300px" 
        borderRadius="12px"
        className="skeleton-hero-poster"
      />
    </div>
  </div>
);

export const DetailsSkeleton = () => (
  <div className="details-skeleton">
    <div className="details-skeleton-hero">
      <LoadingSkeleton 
        height="600px" 
        borderRadius="0"
        className="skeleton-details-bg"
      />
      <div className="details-skeleton-content">
        <LoadingSkeleton 
          width="300px" 
          height="450px" 
          borderRadius="16px"
          className="skeleton-details-poster"
        />
        <div className="details-skeleton-info">
          <LoadingSkeleton variant="text" height="40px" width="400px" />
          <LoadingSkeleton variant="text" height="16px" lines={4} />
          <div className="skeleton-details-buttons">
            <LoadingSkeleton width="140px" height="48px" borderRadius="8px" />
            <LoadingSkeleton width="160px" height="48px" borderRadius="8px" />
            <LoadingSkeleton width="180px" height="48px" borderRadius="8px" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
