import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Load user preferences
        await loadUserPreferences(user.uid);
      } else {
        setUser(null);
        setPreferences(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load user preferences from Firestore
  const loadUserPreferences = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setPreferences(userDoc.data().preferences);
      } else {
        // Initialize new user preferences
        const initialPreferences = {
          dietaryRestrictions: [],
          favoriteIngredients: [],
          mealHistory: [],
          weights: {
            healthiness: 0.5,
            complexity: 0.5,
            time: 0.5
          }
        };
        await setDoc(doc(db, 'users', userId), {
          preferences: initialPreferences
        });
        setPreferences(initialPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Update user preferences
  const updatePreferences = async (newPreferences) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        preferences: { ...preferences, ...newPreferences }
      });
      setPreferences(prev => ({ ...prev, ...newPreferences }));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  // Update RL weights
  const updateWeights = async (newWeights) => {
    if (!user) return;

    try {
      const updatedPreferences = {
        ...preferences,
        weights: { ...preferences.weights, ...newWeights }
      };
      await updateDoc(doc(db, 'users', user.uid), {
        preferences: updatedPreferences
      });
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating weights:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    preferences,
    loading,
    signInWithGoogle,
    signOutUser,
    updatePreferences,
    updateWeights
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
} 