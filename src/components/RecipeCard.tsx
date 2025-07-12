import React from 'react';
import Image from 'next/image';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  imageUrl?: string;
  dietTags: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  isLoading?: boolean;
}

// Diet tag color mapping
const DIET_TAG_COLORS: { [key: string]: string } = {
  'Vegetarian': 'bg-green-100 text-green-800',
  'Vegan': 'bg-emerald-100 text-emerald-800',
  'Keto': 'bg-purple-100 text-purple-800',
  'Paleo': 'bg-orange-100 text-orange-800',
  'Gluten-Free': 'bg-yellow-100 text-yellow-800',
  'Dairy-Free': 'bg-blue-100 text-blue-800',
  'High-Protein': 'bg-red-100 text-red-800',
  'Low-Carb': 'bg-indigo-100 text-indigo-800',
  'Whole30': 'bg-teal-100 text-teal-800',
  'default': 'bg-gray-100 text-gray-800'
};

export default function RecipeCard({ recipe, isLoading = false }: RecipeCardProps) {
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="aspect-video w-full bg-gray-200 rounded-t-2xl"></div>
        <div className="p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-2xl shadow-xl transition-all duration-200 hover:shadow-2xl">
      {recipe.imageUrl && (
        <div className="relative aspect-video w-full">
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {recipe.name}
          </h3>
          <p className="mt-2 text-gray-600">
            {recipe.description}
          </p>
          {/* Diet Tags */}
          {recipe.dietTags && recipe.dietTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {recipe.dietTags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    DIET_TAG_COLORS[tag] || DIET_TAG_COLORS.default
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Nutrition Information */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recipe.nutrition.calories}
            </div>
            <div className="text-sm text-gray-600">Calories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {recipe.nutrition.protein}g
            </div>
            <div className="text-sm text-gray-600">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {recipe.nutrition.carbs}g
            </div>
            <div className="text-sm text-gray-600">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {recipe.nutrition.fats}g
            </div>
            <div className="text-sm text-gray-600">Fats</div>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Ingredients
          </h4>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="flex items-center text-gray-700"
              >
                <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3 text-sm">
                  {index + 1}
                </span>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Instructions
          </h4>
          <ol className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <li
                key={index}
                className="flex gap-4 text-gray-700"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-medium">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
} 