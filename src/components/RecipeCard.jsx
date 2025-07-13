import React from 'react';

const RecipeCard = ({ recipe, onLike, onDislike }) => {
  const {
    title,
    image,
    readyInMinutes,
    servings,
    cuisineType,
    difficulty = 2,
    missingIngredients = []
  } = recipe;

  const difficultyColor = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-orange-100 text-orange-800',
    5: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative aspect-video">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-200">{cuisineType}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-gray-600">⏱️</span>
              <span className="text-sm">{readyInMinutes}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-600">👥</span>
              <span className="text-sm">{servings} servings</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${difficultyColor[difficulty]}`}>
            Level {difficulty}
          </div>
        </div>

        {missingIngredients.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Missing ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {missingIngredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button
            onClick={onDislike}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <span>👎</span>
            <span className="text-sm font-medium text-gray-700">Not for me</span>
          </button>
          <button
            onClick={onLike}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
          >
            <span>👍</span>
            <span className="text-sm font-medium text-gray-700">I'll try it!</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard; 