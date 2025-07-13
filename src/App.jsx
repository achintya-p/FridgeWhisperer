import React, { useState, useCallback } from 'react';
import FridgeUpload from './components/FridgeUpload';
import MealSuggestions from './components/MealSuggestions';
import ChatBot from './components/ChatBot';
import MoodSelector from './components/MoodSelector';
import UserProfile from './components/UserProfile';
import { UserProvider } from './contexts/UserContext';

// Memoize static components
const MemoizedUserProfile = React.memo(UserProfile);
const MemoizedMoodSelector = React.memo(MoodSelector);
const MemoizedMealSuggestions = React.memo(MealSuggestions);
const MemoizedChatBot = React.memo(ChatBot);

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);

  // Memoize the callback to prevent unnecessary re-renders
  const handleAnalysisComplete = useCallback((results) => {
    console.log('Analysis results:', results);
    setAnalysisResults(results);
  }, []);

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">FridgeWhisperer 🧊</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <MemoizedUserProfile />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FridgeUpload onAnalysisComplete={handleAnalysisComplete} />
              <MemoizedMoodSelector />
            </div>
            <div className="space-y-6">
              <MemoizedMealSuggestions />
              <MemoizedChatBot />
            </div>
          </div>

          {analysisResults && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {analysisResults}
              </pre>
            </div>
          )}
        </main>
      </div>
    </UserProvider>
  );
}

// Wrap the entire App in memo since it doesn't need to re-render unless props change
export default React.memo(App); 