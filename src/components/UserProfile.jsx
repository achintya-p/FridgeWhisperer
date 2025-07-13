import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

const UserProfile = () => {
  const { user, preferences, signInWithGoogle, signOutUser, updatePreferences } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(
    preferences?.dietaryRestrictions || []
  );

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSavePreferences = async () => {
    await updatePreferences({
      dietaryRestrictions
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Welcome to FridgeWhisperer</h2>
        <p className="mb-4">Sign in to save your preferences and get personalized recipe suggestions!</p>
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-red-500 hover:text-red-600"
        >
          Sign Out
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Dietary Restrictions</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-500 text-sm"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'].map((restriction) => (
                  <label
                    key={restriction}
                    className="flex items-center gap-2 bg-gray-100 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={dietaryRestrictions.includes(restriction)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDietaryRestrictions([...dietaryRestrictions, restriction]);
                        } else {
                          setDietaryRestrictions(
                            dietaryRestrictions.filter((r) => r !== restriction)
                          );
                        }
                      }}
                      className="rounded text-blue-500"
                    />
                    {restriction}
                  </label>
                ))}
              </div>
              <button
                onClick={handleSavePreferences}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {preferences?.dietaryRestrictions.map((restriction) => (
                <span
                  key={restriction}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {restriction}
                </span>
              ))}
              {preferences?.dietaryRestrictions.length === 0 && (
                <span className="text-gray-500">No dietary restrictions set</span>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Recipe Preferences</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(preferences?.weights || {}).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-gray-600 capitalize mb-1">{key}</p>
                <div className="font-medium">{Math.round(value * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 