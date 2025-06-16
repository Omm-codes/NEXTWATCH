import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile, getUserWatchlist } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import MovieCard from '../components/MovieCard';
import './Profile.css';

const Profile = () => {
  const { user, setUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    favoriteGenres: [],
    preferredLanguage: 'en'
  });
  const [watchlist, setWatchlist] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Load user profile
        const { profile, error: profileError } = await getUserProfile(user.uid);
        if (profileError) {
          setError('Failed to load profile data');
        } else if (profile) {
          setProfileData({
            displayName: profile.displayName || user.displayName || '',
            email: profile.email || user.email || '',
            favoriteGenres: profile.preferences?.favoriteGenres || [],
            preferredLanguage: profile.preferences?.preferredLanguage || 'en'
          });
          setUserProfile(profile);
        }

        // Load watchlist
        setWatchlistLoading(true);
        const { watchlist: userWatchlist, error: watchlistError } = await getUserWatchlist(user.uid);
        if (watchlistError) {
          console.error('Failed to load watchlist:', watchlistError);
        } else {
          setWatchlist(userWatchlist);
        }
        setWatchlistLoading(false);
        
      } catch (error) {
        setError('Failed to load user data');
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, navigate, setUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreToggle = (genre) => {
    setProfileData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName
      });

      // Update Firestore profile
      const { error } = await updateUserProfile(user.uid, {
        displayName: profileData.displayName,
        preferences: {
          favoriteGenres: profileData.favoriteGenres,
          preferredLanguage: profileData.preferredLanguage
        }
      });

      if (error) {
        setError('Failed to update profile');
      } else {
        setIsEditing(false);
        // Reload profile data
        const { profile } = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        }
      }
    } catch (error) {
      setError('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      displayName: user.displayName || '',
      email: user.email || '',
      favoriteGenres: profileData.favoriteGenres,
      preferredLanguage: profileData.preferredLanguage
    });
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} />
              ) : (
                <span>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
              )}
            </div>
          </div>
          <div className="profile-info">
            <h1>{user.displayName || 'User'}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{watchlist.length}</span>
                <span className="stat-label">Watchlist Items</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{profileData.favoriteGenres.length}</span>
                <span className="stat-label">Favorite Genres</span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="button-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Profile Content */}
        <div className="profile-content">
          {/* Profile Settings */}
          <div className="profile-section">
            <h2>Profile Information</h2>
            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="preferredLanguage">Preferred Language</label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={profileData.preferredLanguage}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                </select>
              </div>
            </div>
          </div>

          {/* Favorite Genres */}
          <div className="profile-section">
            <h2>Favorite Genres</h2>
            <div className="genres-grid">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`genre-tag ${profileData.favoriteGenres.includes(genre) ? 'selected' : ''}`}
                  onClick={() => isEditing && handleGenreToggle(genre)}
                  disabled={!isEditing}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Watchlist Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>My Watchlist</h2>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/watchlist')}
              >
                View All
                <svg viewBox="0 0 24 24">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </button>
            </div>
            
            {watchlistLoading ? (
              <div className="watchlist-loading">
                <div className="loading-spinner"></div>
                <p>Loading watchlist...</p>
              </div>
            ) : watchlist.length > 0 ? (
              <div className="watchlist-preview">
                {watchlist.slice(0, 6).map(movie => (
                  <div key={movie.id} className="watchlist-item">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-watchlist">
                <svg viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
                <h3>Your watchlist is empty</h3>
                <p>Start adding movies and shows you want to watch!</p>
                <button 
                  className="explore-btn"
                  onClick={() => navigate('/movies')}
                >
                  Explore Movies
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
