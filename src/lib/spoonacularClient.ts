import { Recipe } from '@/lib/types';
import { WeatherData, getWeatherBasedRecipePreferences } from '@/lib/weatherClient';

if (!process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SPOONACULAR_API_KEY environment variable');
}

const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

// Helper function to round to nearest 0.1
function roundToNearestTenth(num: number): number {
  return Math.round(num * 10) / 10;
}

// Helper function to clean HTML and list markers
function cleanInstructions(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/^\d+\.\s*/gm, '') // Remove leading numbers and dots
    .replace(/<ol>|<\/ol>|<li>|<\/li>/g, '') // Remove list tags
    .trim();
}

// Helper function to get recipe type tags based on recipe details
function getRecipeTypeTags(recipe: SpoonacularRecipeDetails): string[] {
  const tags: string[] = [];
  const text = `${recipe.title} ${recipe.summary}`.toLowerCase();
  
  // Check for recipe types
  if (text.includes('soup') || text.includes('stew') || text.includes('broth')) {
    tags.push('soup');
  }
  if (text.includes('salad') || text.includes('fresh') || text.includes('raw')) {
    tags.push('salad');
  }
  if (text.includes('grill') || text.includes('barbecue') || text.includes('bbq')) {
    tags.push('grilled');
  }
  if (text.includes('bake') || text.includes('roast')) {
    tags.push('baked');
  }
  if (text.includes('comfort') || text.includes('hearty')) {
    tags.push('comfort food');
  }
  if (text.includes('cold') || text.includes('chilled') || text.includes('frozen')) {
    tags.push('cold');
  }
  if (text.includes('hot') || text.includes('warm')) {
    tags.push('hot');
  }

  return tags;
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: {
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    extendedName?: string;
  }[];
  usedIngredients: {
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    extendedName?: string;
  }[];
  unusedIngredients: any[];
  likes: number;
}

interface SpoonacularRecipeDetails {
  id: number;
  title: string;
  summary: string;
  instructions: string;
  analyzedInstructions?: {
    steps: {
      number: number;
      step: string;
    }[];
  }[];
  extendedIngredients: {
    id: number;
    amount: number;
    unit: string;
    name: string;
    original: string;
  }[];
  nutrition?: {
    nutrients?: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
  diets?: string[];
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  ketogenic?: boolean;
  whole30?: boolean;
}

interface SpoonacularRecipeWithScore extends SpoonacularRecipeDetails {
  weatherScore?: number;
}

export async function findRecipesByIngredients(
  ingredients: string[],
  cuisine?: string,
  diet?: string,
  weather?: WeatherData,
  number: number = 3
): Promise<Recipe[]> {
  try {
    // Convert ingredients array to comma-separated string
    const ingredientsStr = ingredients.join(',');
    
    let complexSearchParams = new URLSearchParams({
      apiKey: API_KEY,
      includeIngredients: ingredientsStr,
      number: (number * 2).toString(), // Get more recipes to filter by weather
      addRecipeInformation: 'true',
      fillIngredients: 'true',
      addRecipeNutrition: 'true',
      instructionsRequired: 'true',
      sort: 'max-used-ingredients',
    });

    if (cuisine && cuisine !== '') {
      complexSearchParams.append('cuisine', cuisine);
    }

    if (diet && diet !== '') {
      complexSearchParams.append('diet', diet);
    }

    // Use complex search endpoint which supports cuisine and diet filtering
    const response = await fetch(`${BASE_URL}/complexSearch?${complexSearchParams}`);
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`);
    }

    const searchResults = await response.json();
    let recipes = searchResults.results || [];

    // Apply weather-based filtering if weather data is available
    if (weather) {
      const { preferredTypes, avoidTypes } = getWeatherBasedRecipePreferences(weather);
      
      // Score recipes based on weather preferences
      recipes = recipes.map((recipe: SpoonacularRecipeDetails) => {
        const recipeTags = getRecipeTypeTags(recipe);
        let score = 0;

        // Increase score for preferred types
        preferredTypes.forEach((type: string) => {
          if (recipeTags.includes(type)) score += 2;
        });

        // Decrease score for types to avoid
        avoidTypes.forEach((type: string) => {
          if (recipeTags.includes(type)) score -= 1;
        });

        return { ...recipe, weatherScore: score };
      });

      // Sort by weather score and take top N recipes
      recipes.sort((a: SpoonacularRecipeWithScore, b: SpoonacularRecipeWithScore) => 
        (b.weatherScore || 0) - (a.weatherScore || 0)
      );
      recipes = recipes.slice(0, number);
    }

    // Transform Spoonacular format to our app's format
    return recipes.map((details: SpoonacularRecipeDetails) => {
      // Safely extract nutrition information with fallbacks
      const nutrients = details.nutrition?.nutrients || [];
      const calories = nutrients.find(n => n?.name === 'Calories')?.amount || 0;
      const protein = nutrients.find(n => n?.name === 'Protein')?.amount || 0;
      const carbs = nutrients.find(n => n?.name === 'Carbohydrates')?.amount || 0;
      const fats = nutrients.find(n => n?.name === 'Fat')?.amount || 0;

      // Get instructions from analyzedInstructions if available, otherwise clean up regular instructions
      let instructionSteps: string[] = [];
      if (details.analyzedInstructions && details.analyzedInstructions.length > 0) {
        instructionSteps = details.analyzedInstructions[0].steps.map(step => step.step);
      } else if (details.instructions) {
        instructionSteps = cleanInstructions(details.instructions)
          .split(/\n|\./)
          .map(step => step.trim())
          .filter(step => step.length > 0);
      } else {
        instructionSteps = ['Instructions not available'];
      }

      // Collect diet tags
      const dietTags: string[] = [];
      if (details.vegetarian) dietTags.push('Vegetarian');
      if (details.vegan) dietTags.push('Vegan');
      if (details.glutenFree) dietTags.push('Gluten-Free');
      if (details.dairyFree) dietTags.push('Dairy-Free');
      if (details.ketogenic) dietTags.push('Keto');
      if (details.whole30) dietTags.push('Whole30');
      if (details.diets?.includes('paleo')) dietTags.push('Paleo');
      if (protein > 25) dietTags.push('High-Protein');
      if (carbs < 20) dietTags.push('Low-Carb');

      // Add weather appropriateness tag
      const weatherTags = weather ? getRecipeTypeTags(details) : [];
      const { preferredTypes, avoidTypes } = weather 
        ? getWeatherBasedRecipePreferences(weather)
        : { preferredTypes: [], avoidTypes: [] };

      let weatherAppropriate = false;
      if (weatherTags.some(tag => preferredTypes.includes(tag))) {
        weatherAppropriate = true;
      }

      return {
        name: details.title,
        description: details.summary 
          ? cleanInstructions(details.summary).split('.')[0] + '.'
          : 'No description available.',
        ingredients: (details.extendedIngredients || []).map(ing => ({
          name: ing.name || 'Unknown ingredient',
          quantity: roundToNearestTenth(ing.amount) || 0,
          unit: ing.unit || 'unit'
        })),
        instructions: instructionSteps,
        nutrition: {
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fats: Math.round(fats)
        },
        imageUrl: `https://spoonacular.com/recipeImages/${details.id}-636x393.jpg`,
        dietTags: [
          ...dietTags,
          ...(weatherAppropriate ? ['Weather Perfect! 🌡️'] : [])
        ]
      };
    });
  } catch (error) {
    console.error('Error in findRecipesByIngredients:', error);
    throw error;
  }
} 