import { useState, useEffect } from 'react';
import { WeatherData, getCurrentWeather, getWeatherBasedRecipePreferences } from '@/lib/weatherClient';

// Weather icon mapping
const WEATHER_ICONS: { [key: string]: string } = {
  'Clear': '☀️',
  'Clouds': '☁️',
  'Rain': '🌧️',
  'Thunderstorm': '⛈️',
  'Snow': '❄️',
  'Mist': '🌫️',
  'default': '🌡️'
};

export default function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const weatherData = await getCurrentWeather(latitude, longitude);
        setWeather(weatherData);
        setError('');
      } catch (err: any) {
        console.error('Error getting weather:', err);
        setError('Unable to get weather information');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return null; // Hide the component if there's an error
  }

  if (!weather) {
    return null;
  }

  const preferences = getWeatherBasedRecipePreferences(weather);
  const weatherIcon = WEATHER_ICONS[weather.main] || WEATHER_ICONS.default;

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {weatherIcon} {weather.temp}°C
          </h3>
          <p className="text-gray-600 capitalize">{weather.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Feels like: {weather.feels_like}°C</p>
          <p className="text-sm text-gray-500">Humidity: {weather.humidity}%</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-700 font-medium">{preferences.description}</p>
        
        {preferences.preferredTypes.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Perfect for:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {preferences.preferredTypes.map((type, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {preferences.avoidTypes.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Maybe avoid:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {preferences.avoidTypes.map((type, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 