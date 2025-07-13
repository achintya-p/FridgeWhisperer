import React, { useState } from 'react';
import FridgeUpload from './components/FridgeUpload';
import MealSuggestions from './components/MealSuggestions';
import ChatBot from './components/ChatBot';
import MoodSelector from './components/MoodSelector';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [userId] = useState(() => localStorage.getItem('userId') || Math.random().toString(36).substring(7));
  const [isLoading, setIsLoading] = useState(false);
  const [meals, setMeals] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [mood, setMood] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', userId);
    if (mood) formData.append('mood', mood);

    try {
      const response = await fetch(`${API_BASE_URL}/meals/suggest`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to process image');

      const data = await response.json();
      setMeals(data.meals);
      setIngredients(data.ingredients_found);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (mealId, rating, completed) => {
    try {
      await fetch(`${API_BASE_URL}/meals/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          meal_id: mealId,
          rating,
          completed
        })
      });
    } catch (err) {
      console.error('Failed to send feedback:', err);
    }
  };

  const handleChat = async (message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: message,
          user_id: userId,
          ingredients,
          user_state: {
            mood
          }
        })
      });

      if (!response.ok) throw new Error('Chat request failed');

      const data = await response.json();
      return data.response;
    } catch (err) {
      console.error('Chat error:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FridgeWhisperer 🧊
          </h1>
          <p className="text-lg text-gray-600">
            Turn your ingredients into delicious meals with AI
          </p>
        </header>

        <div className="space-y-8">
          <MoodSelector
            selectedMood={mood}
            onMoodSelect={setMood}
          />

          <FridgeUpload
            onUpload={handleUpload}
            isLoading={isLoading}
          />

          {error && (
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          )}

          {meals.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8">
              <MealSuggestions
                meals={meals}
                onFeedback={handleFeedback}
              />
              <ChatBot
                onSendMessage={handleChat}
                ingredients={ingredients}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 