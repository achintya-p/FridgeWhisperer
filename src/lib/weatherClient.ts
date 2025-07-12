const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  main: string; // Clear, Rain, Snow, etc.
  isDay: boolean;
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    throw new Error('Missing OpenWeatherMap API key');
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    
    // Check if it's daytime based on current time vs sunrise/sunset
    const isDay = data.dt > data.sys.sunrise && data.dt < data.sys.sunset;

    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      main: data.weather[0].main,
      isDay
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

export function getWeatherBasedRecipePreferences(weather: WeatherData): {
  preferredTypes: string[];
  avoidTypes: string[];
  description: string;
} {
  const { temp, main, isDay } = weather;

  // Base preferences on temperature and weather conditions
  if (temp <= 10) { // Cold weather
    return {
      preferredTypes: ['soup', 'stew', 'casserole', 'hot', 'comfort food', 'warm'],
      avoidTypes: ['salad', 'cold', 'ice cream', 'chilled'],
      description: "It's cold outside! Let's make something warm and comforting."
    };
  } else if (temp >= 25) { // Hot weather
    return {
      preferredTypes: ['salad', 'cold', 'fresh', 'light', 'grilled'],
      avoidTypes: ['soup', 'stew', 'heavy', 'hot'],
      description: "It's hot outside! Let's make something cool and refreshing."
    };
  } else if (main === 'Rain' || main === 'Thunderstorm') {
    return {
      preferredTypes: ['comfort food', 'soup', 'baked', 'cozy'],
      avoidTypes: ['grilled', 'barbecue'],
      description: "Perfect weather for some comfort food!"
    };
  } else if (isDay && (main === 'Clear' || main === 'Clouds')) {
    return {
      preferredTypes: ['grilled', 'barbecue', 'fresh', 'outdoor'],
      avoidTypes: [],
      description: "Great weather for grilling or a fresh meal!"
    };
  }

  // Default preferences
  return {
    preferredTypes: [],
    avoidTypes: [],
    description: "Let's cook something delicious!"
  };
} 