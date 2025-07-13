import React from 'react';

const MealSuggestions = () => {
  // Example meal suggestions
  const suggestions = [
    {
      id: 1,
      title: 'Pasta Primavera',
      description: 'Fresh vegetables and pasta in a light cream sauce',
      ingredients: ['pasta', 'broccoli', 'carrots', 'cream'],
      cookTime: '30 mins'
    },
    {
      id: 2,
      title: 'Chicken Stir Fry',
      description: 'Quick and healthy chicken with mixed vegetables',
      ingredients: ['chicken', 'bell peppers', 'onions', 'soy sauce'],
      cookTime: '25 mins'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Suggested Meals</h2>
      <div className="space-y-4">
        {suggestions.map((meal) => (
          <div
            key={meal.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{meal.title}</h3>
            <p className="text-gray-600 mb-2">{meal.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-4">🕒 {meal.cookTime}</span>
              <span>🥘 {meal.ingredients.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealSuggestions; 