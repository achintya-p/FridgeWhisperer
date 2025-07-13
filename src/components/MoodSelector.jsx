import React, { useState } from 'react';

const MoodSelector = () => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '😴', label: 'Tired', value: 'tired' },
    { emoji: '🤒', label: 'Sick', value: 'sick' },
    { emoji: '💪', label: 'Energetic', value: 'energetic' },
    { emoji: '😥', label: 'Stressed', value: 'stressed' }
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.value);
    // TODO: Trigger recipe suggestions based on mood
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">How are you feeling today?</h2>
      <div className="flex flex-wrap gap-4">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood)}
            className={`flex flex-col items-center p-4 rounded-lg transition-all
              ${
                selectedMood === mood.value
                  ? 'bg-blue-100 scale-110'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
          >
            <span className="text-4xl mb-2">{mood.emoji}</span>
            <span className="text-sm font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
      {selectedMood && (
        <p className="mt-4 text-gray-600">
          We'll adjust your recipe suggestions based on your mood!
        </p>
      )}
    </div>
  );
};

export default MoodSelector; 