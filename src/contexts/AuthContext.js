import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, createUserProfile, getUserProfile, updateUserProfile } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setUser(user);
        setProfileLoading(true);
        
        try {
          // Create user profile if it doesn't exist
          await createUserProfile(user);
          
          // Load complete user profile - fix: handle the returned structure properly
          const { profile, error } = await getUserProfile(user.uid);
          
          if (error) {
            console.error('Error loading user profile:', error);
            setUserProfile(null);
          } else {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateProfile = async (updates) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    setProfileLoading(true);
    
    try {
      // Update profile in Firestore
      const { error } = await updateUserProfile(user.uid, updates);
      
      if (error) {
        throw new Error(error);
      }
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshUserProfile = async (userId = null) => {
    const targetUserId = userId || user?.uid;
    if (!targetUserId) return;

    setProfileLoading(true);
    
    try {
      // Fix: handle the returned structure properly
      const { profile, error } = await getUserProfile(targetUserId);
      
      if (error) {
        console.error('Error refreshing profile:', error);
        setUserProfile(null);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    setUserProfile,
    loading,
    profileLoading,
    updateProfile,
    refreshProfile: refreshUserProfile, // Keep both names for compatibility
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};