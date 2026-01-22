import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserWatchlist,
  getUserWatchedMovies,
  updateUserStats,
  deleteUserAccount,
  updateUserProfileSimple,
  getProfilePhotoLocally,
  deleteProfilePhotoLocally
} from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import MovieCard from '../components/MovieCard';
import './Profile.css';

const Profile = () => {
  const { user, userProfile, setUserProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    favoriteGenres: [],
    preferredLanguage: 'en',
    notifications: true,
    privacy: 'public'
  });
  const [watchlist, setWatchlist] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [userStats, setUserStats] = useState({
    totalWatchedMovies: 0,
    totalWatchedTVShows: 0,
    totalWatchlistItems: 0,
    joinDate: new Date().toISOString()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [localPhotoURL, setLocalPhotoURL] = useState(null);

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'PRF' },
    { id: 'watchlist', label: 'Watchlist', icon: 'WL' },
    { id: 'watched', label: 'Watched', icon: 'WCH' },
    { id: 'stats', label: 'Statistics', icon: 'STS' }
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
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || user.email || '',
            favoriteGenres: profile.preferences?.favoriteGenres || [],
            preferredLanguage: profile.preferences?.preferredLanguage || 'en',
            notifications: profile.preferences?.notifications !== false,
            privacy: profile.preferences?.privacy || 'public'
          });
          setUserStats(profile.stats || {
            totalWatchedMovies: 0,
            totalWatchedTVShows: 0,
            totalWatchlistItems: 0,
            joinDate: profile.createdAt || new Date().toISOString()
          });
          setUserProfile(profile);
        }

        // Load local profile photo
        const localPhoto = getProfilePhotoLocally(user.uid);
        setLocalPhotoURL(localPhoto);

        // Load watchlist and watched movies
        setWatchlistLoading(true);
        const [watchlistResult, watchedResult] = await Promise.all([
          getUserWatchlist(user.uid),
          getUserWatchedMovies(user.uid)
        ]);
        
        if (watchlistResult.error) {
          console.error('Failed to load watchlist:', watchlistResult.error);
        } else {
          setWatchlist(watchlistResult.watchlist);
        }
        
        if (watchedResult.error) {
          console.error('Failed to load watched movies:', watchedResult.error);
        } else {
          setWatchedMovies(watchedResult.watchedMovies);
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
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemovePhoto = async () => {
    if (localPhotoURL) {
      setPhotoUploading(true);
      try {
        const { error } = deleteProfilePhotoLocally(user.uid);
        if (error) {
          setError('Failed to remove profile photo');
        } else {
          setLocalPhotoURL(null);
        }
      } catch (error) {
        setError('Failed to remove profile photo');
        console.error('Error removing profile photo:', error);
      } finally {
        setPhotoUploading(false);
      }
    }
    
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      console.log('Starting profile save...');
      const fullDisplayName = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // Prepare the profile data
      const profileUpdateData = {
        displayName: fullDisplayName || profileData.displayName,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        preferences: {
          favoriteGenres: profileData.favoriteGenres,
          preferredLanguage: profileData.preferredLanguage,
          notifications: profileData.notifications,
          privacy: profileData.privacy
        }
      };

      console.log('Calling updateUserProfileSimple...');
      
      // Update profile with photo if a new photo was selected
      const { error, photoURL, profile: updatedProfile } = await updateUserProfileSimple(
        user.uid, 
        profileUpdateData, 
        photoFile
      );

      if (error) {
        console.error('Profile update failed:', error);
        setError(`Failed to update profile: ${error}`);
      } else {
        console.log('Profile updated successfully');
        setIsEditing(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        
        // Update local photo URL if new photo was uploaded
        if (photoURL) {
          setLocalPhotoURL(photoURL);
        }
        
        // Update the auth context with the new profile data
        if (updatedProfile) {
          setUserProfile(updatedProfile);
          
          // Update local profile data state
          setProfileData(prev => ({
            ...prev,
            displayName: updatedProfile.displayName || '',
            firstName: updatedProfile.firstName || '',
            lastName: updatedProfile.lastName || '',
            favoriteGenres: updatedProfile.preferences?.favoriteGenres || [],
            preferredLanguage: updatedProfile.preferences?.preferredLanguage || 'en',
            notifications: updatedProfile.preferences?.notifications !== false,
            privacy: updatedProfile.preferences?.privacy || 'public'
          }));
        } else {
          // Fallback: refresh profile from Firestore
          console.log('Refreshing profile from Firestore...');
          await refreshUserProfile(user.uid);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      displayName: user.displayName || '',
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: user.email || '',
      favoriteGenres: profileData.favoriteGenres,
      preferredLanguage: profileData.preferredLanguage,
      notifications: profileData.notifications,
      privacy: profileData.privacy
    });
    setIsEditing(false);
    setError('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    
    try {
      const { error } = await deleteUserAccount(user.uid);
      
      if (error) {
        setError('Failed to delete account. Please try again or contact support.');
      } else {
        // Account deleted successfully - user will be automatically signed out
        navigate('/', { 
          replace: true,
          state: { message: 'Your account has been successfully deleted.' }
        });
      }
    } catch (error) {
      setError('An unexpected error occurred while deleting your account.');
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" />
              ) : localPhotoURL ? (
                <img src={localPhotoURL} alt={userProfile?.displayName || user.displayName} />
              ) : (user.photoURL) ? (
                <img src={user.photoURL} alt={userProfile?.displayName || user.displayName} />
              ) : (
                <span>
                  {profileData.firstName?.charAt(0) || 
                   profileData.displayName?.charAt(0) || 
                   userProfile?.displayName?.charAt(0) ||
                   user.displayName?.charAt(0) ||
                   user.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            {isEditing && (
              <div className="photo-upload-controls">
                <input
                  type="file"
                  id="photoUpload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="photo-upload-input"
                />
                <label htmlFor="photoUpload" className="photo-upload-btn">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                  {photoFile || localPhotoURL || user.photoURL ? 'Change' : 'Add'} Photo
                </label>
                {(photoFile || localPhotoURL || user.photoURL) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="photo-remove-btn"
                    disabled={photoUploading}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>
              {profileData.firstName && profileData.lastName 
                ? `${profileData.firstName} ${profileData.lastName}`
                : profileData.displayName || user.displayName || 'User'}
            </h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{userStats.totalWatchlistItems || watchlist.length}</span>
                <span className="stat-label">Watchlist</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userStats.totalWatchedMovies + userStats.totalWatchedTVShows}</span>
                <span className="stat-label">Watched</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{profileData.favoriteGenres.length}</span>
                <span className="stat-label">Genres</span>
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

        {/* Tab Navigation */}
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-emoji">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="delete-account-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Delete Account</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              
              <div className="modal-content">
                <div className="warning-section">
                  <div className="warning-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <h3>This action cannot be undone</h3>
                  <p>
                    Deleting your account will permanently remove:
                  </p>
                  <ul>
                    <li>Your profile information</li>
                    <li>Your watchlist ({watchlist.length} items)</li>
                    <li>Your watch history ({watchedMovies.length} items)</li>
                    <li>Your preferences and settings</li>
                    <li>All associated account data</li>
                  </ul>
                </div>
                
                <div className="confirmation-section">
                  <label htmlFor="deleteConfirm">
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    disabled={isDeleting}
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  className="delete-btn"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                >
                  {isDeleting ? (
                    <>
                      <div className="button-spinner"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                    />
                  </div>
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

                <div className="form-row">
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

                  <div className="form-group">
                    <label htmlFor="privacy">Privacy Setting</label>
                    <select
                      id="privacy"
                      name="privacy"
                      value={profileData.privacy}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={profileData.notifications}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <span className="checkbox-custom"></span>
                    Enable email notifications
                  </label>
                </div>
              </div>

              {/* Favorite Genres */}
              <div className="genres-section">
                <h3>Favorite Genres</h3>
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

              {/* Danger Zone */}
              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <div className="danger-zone-content">
                  <div className="danger-zone-info">
                    <h4>Delete Account</h4>
                    <p>
                      Permanently delete your NextWatch account and all associated data. 
                      This action cannot be undone.
                    </p>
                  </div>
                  <button 
                    className="danger-btn"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={saving}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>My Watchlist ({watchlist.length})</h2>
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
                <div className="content-grid">
                  {watchlist.slice(0, 12).map(movie => (
                    <div key={movie.id} className="content-item">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-section">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
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
          )}

          {activeTab === 'watched' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Recently Watched ({watchedMovies.length})</h2>
              </div>
              
              {watchedMovies.length > 0 ? (
                <div className="content-grid">
                  {watchedMovies.slice(0, 12).map(movie => (
                    <div key={movie.id} className="content-item">
                      <MovieCard movie={movie} />
                      <div className="watched-date">
                        Watched on {formatDate(movie.watchedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-section">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <h3>No watched content yet</h3>
                  <p>Mark movies and shows as watched to see them here!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="profile-section">
              <h2>Your Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">MOV</div>
                  <div className="stat-content">
                    <h3>{userStats.totalWatchedMovies}</h3>
                    <p>Movies Watched</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">TV</div>
                  <div className="stat-content">
                    <h3>{userStats.totalWatchedTVShows}</h3>
                    <p>TV Shows Watched</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">WL</div>
                  <div className="stat-content">
                    <h3>{watchlist.length}</h3>
                    <p>Watchlist Items</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">JOIN</div>
                  <div className="stat-content">
                    <h3>{formatDate(userStats.joinDate)}</h3>
                    <p>Member Since</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

