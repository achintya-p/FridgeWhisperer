import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MealCard = ({ meal, onLike, onDislike, isActive }) => {
  const difficultyColor = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-orange-100 text-orange-800',
    5: 'bg-red-100 text-red-800'
  };

  return (
    <motion.div
      className={`
        relative bg-white rounded-xl shadow-lg overflow-hidden
        ${isActive ? 'z-10' : 'z-0'}
      `}
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) * velocity.x;
        if (swipe < -500) onDislike();
        if (swipe > 500) onLike();
      }}
    >
      <div className="relative aspect-video">
        <img
          src={meal.image}
          alt={meal.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-xl font-bold text-white">{meal.name}</h3>
          <p className="text-sm text-gray-200">{meal.cuisine_type}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">⏱️</span>
            <span className="text-sm">{meal.prep_time} mins</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${difficultyColor[meal.difficulty]}`}>
            Level {meal.difficulty}
          </div>
        </div>

        {meal.missing_ingredients?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Missing ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {meal.missing_ingredients.map((ingredient) => (
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
            className="p-2 rounded-full hover:bg-red-50 transition-colors"
          >
            👎
          </button>
          <button
            onClick={onLike}
            className="p-2 rounded-full hover:bg-green-50 transition-colors"
          >
            👍
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const MealSuggestions = ({ meals, onFeedback }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleLike = () => {
    if (currentIndex < meals.length) {
      onFeedback(meals[currentIndex].id, 1, true);
      setCurrentIndex(i => i + 1);
    }
  };

  const handleDislike = () => {
    if (currentIndex < meals.length) {
      onFeedback(meals[currentIndex].id, -1, false);
      setCurrentIndex(i => i + 1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="relative h-[500px]">
        <AnimatePresence>
          {meals.slice(currentIndex).map((meal, index) => (
            <div
              key={meal.id}
              className="absolute inset-0"
              style={{
                zIndex: meals.length - index
              }}
            >
              <MealCard
                meal={meal}
                onLike={handleLike}
                onDislike={handleDislike}
                isActive={index === 0}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {currentIndex >= meals.length && (
        <div className="text-center py-8">
          <p className="text-lg font-medium text-gray-700">
            No more suggestions! Try uploading a new photo.
          </p>
        </div>
      )}
    </div>
  );
};

export default MealSuggestions; 