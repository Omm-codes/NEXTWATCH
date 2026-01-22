import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize messaging only if supported
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase messaging not supported:', error);
  }
}
export { messaging };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const createUserAccount = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Create user profile in Firestore
    const { profile } = await createUserProfile(userCredential.user);
    
    return { user: userCredential.user, profile, error: null };
  } catch (error) {
    return { user: null, profile: null, error: error.message };
  }
};

export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get existing user profile (don't create new one, just update last login)
    const { profile } = await updateExistingUserProfile(userCredential.user);
    
    return { user: userCredential.user, profile, error: null };
  } catch (error) {
    return { user: null, profile: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists, if not create profile, if yes update profile
    const { profile } = await createUserProfile(user);
    
    return { user, profile, error: null };
  } catch (error) {
    return { user: null, profile: null, error: error.message };
  }
};

// New function for signup with Google (creates account or signs in existing)
export const signUpWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // For signup, always try to create or update profile
    const { profile } = await createUserProfile(user);
    
    return { user, profile, error: null };
  } catch (error) {
    return { user: null, profile: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Enhanced Firestore functions for user profiles and watchlist
export const createUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        // Remove photoURL from Firestore - we'll use local storage
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        watchlist: [],
        watchedMovies: [],
        stats: {
          totalWatchedMovies: 0,
          totalWatchedTVShows: 0,
          totalWatchlistItems: 0,
          joinDate: new Date().toISOString()
        },
        preferences: {
          favoriteGenres: [],
          preferredLanguage: 'en',
          notifications: true,
          privacy: 'public'
        },
        isActive: true
      };
      
      await setDoc(userRef, userData);
      return { profile: userData, error: null };
    } else {
      const existingData = userSnap.data();
      const updatedData = {
        ...existingData,
        lastLogin: new Date().toISOString(),
        firstName: existingData.firstName || (user.displayName ? user.displayName.split(' ')[0] : ''),
        lastName: existingData.lastName || (user.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''),
        stats: {
          totalWatchedMovies: 0,
          totalWatchedTVShows: 0,
          totalWatchlistItems: existingData.watchlist?.length || 0,
          joinDate: existingData.createdAt || new Date().toISOString(),
          ...existingData.stats
        },
        preferences: {
          favoriteGenres: [],
          preferredLanguage: 'en',
          notifications: true,
          privacy: 'public',
          ...existingData.preferences
        },
        isActive: true
      };
      
      await updateDoc(userRef, updatedData);
      return { profile: updatedData, error: null };
    }
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return { profile: null, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { profile: userSnap.data(), error: null };
    } else {
      return { profile: null, error: 'User profile not found' };
    }
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    // Handle nested updates properly
    if (profileData.preferences) {
      const currentDoc = await getDoc(userRef);
      if (currentDoc.exists()) {
        const currentPrefs = currentDoc.data().preferences || {};
        updateData.preferences = {
          ...currentPrefs,
          ...profileData.preferences
        };
      }
    }
    
    await updateDoc(userRef, updateData);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Add function to update user stats
export const updateUserStats = async (userId, statsUpdate) => {
  try {
    const userRef = doc(db, 'users', userId);
    const currentDoc = await getDoc(userRef);
    
    if (currentDoc.exists()) {
      const currentStats = currentDoc.data().stats || {};
      const updatedStats = {
        ...currentStats,
        ...statsUpdate,
        lastUpdated: new Date().toISOString()
      };
      
      await updateDoc(userRef, {
        stats: updatedStats,
        updatedAt: new Date().toISOString()
      });
      
      return { error: null };
    }
    
    return { error: 'User profile not found' };
  } catch (error) {
    return { error: error.message };
  }
};

// Enhanced watchlist functions
export const addToWatchlist = async (userId, movieData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const movieItem = {
      id: movieData.id,
      title: movieData.title || movieData.name,
      poster_path: movieData.poster_path,
      release_date: movieData.release_date || movieData.first_air_date,
      vote_average: movieData.vote_average,
      media_type: movieData.media_type || 'movie',
      genre_ids: movieData.genre_ids || [],
      addedAt: new Date().toISOString()
    };
    
    await updateDoc(userRef, {
      watchlist: arrayUnion(movieItem),
      updatedAt: new Date().toISOString()
    });
    
    // Update stats - get current watchlist count
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const currentWatchlist = userDoc.data().watchlist || [];
      await updateUserStats(userId, {
        totalWatchlistItems: currentWatchlist.length
      });
    }
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const removeFromWatchlist = async (userId, movieId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const watchlist = userDoc.data().watchlist || [];
      const movieToRemove = watchlist.find(movie => movie.id === movieId);
      
      if (movieToRemove) {
        await updateDoc(userRef, {
          watchlist: arrayRemove(movieToRemove),
          updatedAt: new Date().toISOString()
        });
        
        // Update stats
        await updateUserStats(userId, {
          totalWatchlistItems: watchlist.length - 1
        });
      }
    }
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const getUserWatchlist = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const watchlist = userSnap.data().watchlist || [];
      return { watchlist, error: null };
    } else {
      return { watchlist: [], error: null };
    }
  } catch (error) {
    return { watchlist: [], error: error.message };
  }
};

export const isInWatchlist = async (userId, movieId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const watchlist = userSnap.data().watchlist || [];
      return { isInList: watchlist.some(movie => movie.id === movieId), error: null };
    }
    
    return { isInList: false, error: null };
  } catch (error) {
    return { isInList: false, error: error.message };
  }
};

// Add function to mark movie as watched
export const markAsWatched = async (userId, movieData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const watchedItem = {
      ...movieData,
      watchedAt: new Date().toISOString(),
      rating: null // User can add rating later
    };
    
    await updateDoc(userRef, {
      watchedMovies: arrayUnion(watchedItem),
      updatedAt: new Date().toISOString()
    });
    
    // Update stats
    const mediaType = movieData.media_type || 'movie';
    const userDoc = await getDoc(userRef);
    const currentStats = userDoc.exists() ? userDoc.data().stats || {} : {};
    
    const statsUpdate = {};
    if (mediaType === 'movie') {
      statsUpdate.totalWatchedMovies = (currentStats.totalWatchedMovies || 0) + 1;
    } else {
      statsUpdate.totalWatchedTVShows = (currentStats.totalWatchedTVShows || 0) + 1;
    }
    
    await updateUserStats(userId, statsUpdate);
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Complete the getUserWatchedMovies function
export const getUserWatchedMovies = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const watchedMovies = userSnap.data().watchedMovies || [];
      return { watchedMovies, error: null };
    } else {
      return { watchedMovies: [], error: null };
    }
  } catch (error) {
    return { watchedMovies: [], error: error.message };
  }
};

// New function to update existing user profile without creating new one
export const updateExistingUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // User exists, update last login
      const existingData = userSnap.data();
      const updatedData = {
        ...existingData,
        lastLogin: new Date().toISOString(),
        isActive: true
      };
      
      await updateDoc(userRef, updatedData);
      return { profile: updatedData, error: null };
    } else {
      // User doesn't exist in Firestore, create profile
      return await createUserProfile(user);
    }
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

// Add function to delete user account completely
export const deleteUserAccount = async (userId) => {
  try {
    // Delete the Firebase Auth user first to avoid orphaning auth accounts.
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
      return { error: 'Unauthorized account deletion request' };
    }

    await deleteUser(currentUser);

    // Delete user document from Firestore after auth deletion succeeds.
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { error: error.message };
  }
};

// Add function to remove watched movie from Firebase
export const removeFromWatched = async (userId, movieId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const watchedMovies = userDoc.data().watchedMovies || [];
      const movieToRemove = watchedMovies.find(movie => movie.id === movieId);
      
      if (movieToRemove) {
        await updateDoc(userRef, {
          watchedMovies: arrayRemove(movieToRemove),
          updatedAt: new Date().toISOString()
        });
        
        // Update stats
        const mediaType = movieToRemove.media_type || 'movie';
        const currentStats = userDoc.data().stats || {};
        
        const statsUpdate = {};
        if (mediaType === 'movie') {
          statsUpdate.totalWatchedMovies = Math.max(0, (currentStats.totalWatchedMovies || 0) - 1);
        } else {
          statsUpdate.totalWatchedTVShows = Math.max(0, (currentStats.totalWatchedTVShows || 0) - 1);
        }
        
        await updateUserStats(userId, statsUpdate);
      }
    }
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Local storage functions for profile photos
export const saveProfilePhotoLocally = async (userId, file) => {
  try {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for local storage
      throw new Error('Image size must be less than 2MB');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataURL = e.target.result;
          localStorage.setItem(`profile_photo_${userId}`, dataURL);
          resolve({ url: dataURL, error: null });
        } catch (error) {
          reject({ url: null, error: 'Failed to save photo locally' });
        }
      };
      reader.onerror = () => {
        reject({ url: null, error: 'Failed to read image file' });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    return { url: null, error: error.message };
  }
};

export const getProfilePhotoLocally = (userId) => {
  try {
    const photoURL = localStorage.getItem(`profile_photo_${userId}`);
    return photoURL;
  } catch (error) {
    console.error('Error getting profile photo from local storage:', error);
    return null;
  }
};

export const deleteProfilePhotoLocally = (userId) => {
  try {
    localStorage.removeItem(`profile_photo_${userId}`);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Simplified update user profile function
export const updateUserProfileSimple = async (userId, profileData, photoFile = null) => {
  try {
    console.log('Starting simple profile update for user:', userId);
    
    const userRef = doc(db, 'users', userId);
    let photoURL = null;

    // Handle photo upload to local storage if provided
    if (photoFile) {
      console.log('Saving photo locally...');
      const { url, error } = await saveProfilePhotoLocally(userId, photoFile);
      if (error) {
        console.error('Photo save failed:', error);
        throw new Error(error);
      }
      photoURL = url;
      console.log('Photo saved locally successfully');
    }

    // Get current document to preserve existing data
    const currentDoc = await getDoc(userRef);
    const currentData = currentDoc.exists() ? currentDoc.data() : {};

    // Prepare update data
    const updateData = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    // Handle nested updates properly
    if (profileData.preferences) {
      const currentPrefs = currentData.preferences || {};
      updateData.preferences = {
        ...currentPrefs,
        ...profileData.preferences
      };
    }

    console.log('Updating Firestore document...');
    // Update the document (without photoURL in Firestore)
    await updateDoc(userRef, updateData);

    console.log('Updating Firebase Auth profile...');
    // Update Firebase Auth profile
    const user = auth.currentUser;
    if (user) {
      const authUpdateData = {
        displayName: profileData.displayName || user.displayName
      };
      
      await updateProfile(user, authUpdateData);
    }

    console.log('Profile update completed successfully');
    
    // Return updated profile data
    const { profile: updatedProfile } = await getUserProfile(userId);
    return { error: null, photoURL, profile: updatedProfile };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: error.message || 'Failed to update profile' };
  }
};

// Add function to submit feedback
export const submitFeedback = async (feedbackData) => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const feedbackItem = {
      ...feedbackData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'new', // new, read, resolved
      priority: feedbackData.type === 'bug' ? 'high' : 
                feedbackData.type === 'support' ? 'medium' : 'normal'
    };
    
    await setDoc(doc(feedbackRef, feedbackItem.id), feedbackItem);
    return { error: null, id: feedbackItem.id };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { error: error.message };
  }
};

// Add function to get all feedback (admin only)
export const getAllFeedback = async () => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const q = query(feedbackRef, orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const feedback = [];
    querySnapshot.forEach((doc) => {
      feedback.push({ id: doc.id, ...doc.data() });
    });
    
    return { feedback, error: null };
  } catch (error) {
    console.error('Error getting feedback:', error);
    return { feedback: [], error: error.message };
  }
};

// Add function to update feedback status
export const updateFeedbackStatus = async (feedbackId, status) => {
  try {
    const feedbackRef = doc(db, 'feedback', feedbackId);
    await updateDoc(feedbackRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    return { error: null };
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return { error: error.message };
  }
};

// Add function to delete feedback
export const deleteFeedback = async (feedbackId) => {
  try {
    const feedbackRef = doc(db, 'feedback', feedbackId);
    await deleteDoc(feedbackRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return { error: error.message };
  }
};



