'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import RecipeCard from '@/components/RecipeCard';
import CuisineSelect from '@/components/CuisineSelect';
import DietSelect from '@/components/DietSelect';
import WeatherDisplay from '@/components/WeatherDisplay';
import { analyzeImage } from '@/lib/geminiClient';
import { findRecipesByIngredients } from '@/lib/spoonacularClient';
import { getCurrentWeather, WeatherData } from '@/lib/weatherClient';
import type { Recipe } from '@/lib/types';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Fetch weather data on component mount
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const weatherData = await getCurrentWeather(latitude, longitude);
        setWeather(weatherData);
      } catch (err) {
        console.error('Error getting weather:', err);
        // Don't show error to user - weather is optional
      }
    };

    fetchWeather();
  }, []);

  const handleImageSelect = async (base64: string) => {
    setIsLoading(true);
    setError('');
    setDebugInfo('');
    setRecipes([]);

    try {
      console.log('Analyzing image...');
      const ingredients = await analyzeImage(base64);
      console.log('Detected ingredients:', ingredients);
      
      if (!ingredients || ingredients.length === 0) {
        throw new Error('No ingredients detected in the image. Please try a clearer photo of your fridge contents.');
      }

      console.log('Generating recipes...');
      // Extract just the ingredient names for Spoonacular
      const ingredientNames = ingredients.map(ing => ing.name);
      const generatedRecipes = await findRecipesByIngredients(
        ingredientNames,
        selectedCuisine || undefined,
        selectedDiet || undefined,
        weather || undefined,
        3 // Get 3 recipes
      );
      console.log('Generated recipes:', generatedRecipes);

      if (!generatedRecipes || generatedRecipes.length === 0) {
        throw new Error('No recipes could be generated. Please try different ingredients or dietary preferences.');
      }

      setRecipes(generatedRecipes);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to analyze image or generate recipes. Please try again.');
      
      if (err.message?.includes('API key')) {
        setDebugInfo('Please make sure your Spoonacular API key is properly configured.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            FridgeWhisperer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take a photo of your fridge, and let AI suggest delicious recipes with what you have
          </p>
        </div>

        {/* Weather Display */}
        <div className="max-w-2xl mx-auto">
          <WeatherDisplay />
        </div>

        {/* Preferences */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CuisineSelect
              selectedCuisine={selectedCuisine}
              onCuisineChange={setSelectedCuisine}
            />
            <DietSelect
              selectedDiet={selectedDiet}
              onDietChange={setSelectedDiet}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="max-w-2xl mx-auto">
          <ImageUpload onImageSelect={handleImageSelect} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-center">{error}</p>
            {debugInfo && (
              <p className="mt-2 text-sm text-gray-600 text-center">{debugInfo}</p>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-2xl mx-auto">
            <RecipeCard
              recipe={{
                name: '',
                description: '',
                ingredients: [],
                instructions: [],
                nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                dietTags: []
              }}
              isLoading={true}
            />
          </div>
        )}

        {/* Recipe Grid */}
        {recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={index}
                recipe={recipe}
                isLoading={false}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 