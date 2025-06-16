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
  sendPasswordResetEmail
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
  getDocs
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
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

// Firestore functions for user profiles and watchlist
export const createUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        watchlist: [],
        preferences: {
          favoriteGenres: [],
          preferredLanguage: 'en'
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString()
      });
    }
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
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
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const addToWatchlist = async (userId, movieData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      watchlist: arrayUnion({
        id: movieData.id,
        title: movieData.title,
        poster_path: movieData.poster_path,
        release_date: movieData.release_date,
        vote_average: movieData.vote_average,
        media_type: movieData.media_type || 'movie',
        addedAt: new Date().toISOString()
      })
    });
    
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
          watchlist: arrayRemove(movieToRemove)
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

export default app;
