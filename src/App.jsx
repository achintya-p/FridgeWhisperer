import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User signed in:', user.email);
        setUser(user);
      } else {
        console.log('No user signed in');
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setError('Authentication state monitoring failed. Please refresh the page.');
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Log the current auth state
      console.log('Current auth state:', auth.currentUser);
      console.log('Starting Google sign in...');
      
      // Clear any existing auth state
      await auth.signOut();
      
      // Attempt sign in
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user.email);
      
      // Verify the credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      console.log('Credential verified:', credential);
      
    } catch (error) {
      console.error('Sign in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      if (error.email) {
        console.error('Email in use:', error.email);
      }
      
      let errorMessage = 'An error occurred during sign in.';
      
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = 'Please enable popups for this website and try again.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled. Please try again.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized for authentication. Please check Firebase Console settings.';
          break;
        case 'auth/configuration-not-found':
          errorMessage = 'Authentication configuration error. Please check Firebase settings.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/internal-error':
          errorMessage = 'Internal authentication error. Please try again.';
          break;
        default:
          errorMessage = `Authentication error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('Sign out successful');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            FridgeWhisperer
          </h1>
          {!user ? (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
                <p className="text-sm mt-2">
                  If this error persists, please try:
                  <ul className="list-disc list-inside ml-4">
                    <li>Clearing your browser cache</li>
                    <li>Using an incognito window</li>
                    <li>Checking your internet connection</li>
                    <li>Ensuring popups are enabled for this site</li>
                  </ul>
                </p>
              </div>
            )}
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              {user ? (
                <p className="text-gray-500">Welcome {user.displayName || user.email}! Upload your fridge photo to get started.</p>
              ) : (
                <p className="text-gray-500">Please sign in to use FridgeWhisperer!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 