import React from 'react';

const moods = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🤒', label: 'Sick', value: 'sick' },
  { emoji: '😋', label: 'Hungry', value: 'hungry' },
  { emoji: '🏃', label: 'Active', value: 'active' },
  { emoji: '😌', label: 'Relaxed', value: 'relaxed' }
];

const MoodSelector = ({ selectedMood, onMoodSelect }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        How are you feeling today?
      </h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {moods.map(({ emoji, label, value }) => (
          <button
            key={value}
            onClick={() => onMoodSelect(value)}
            className={`
              flex flex-col items-center p-4 rounded-lg transition-all
              ${selectedMood === value
                ? 'bg-blue-100 ring-2 ring-blue-500'
                : 'bg-gray-50 hover:bg-gray-100'}
            `}
          >
            <span className="text-3xl mb-2" role="img" aria-label={label}>
              {emoji}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {label}
            </span>
          </button>
        ))}
      </div>
      
      {selectedMood && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          We'll adjust your meal suggestions based on your mood!
        </p>
      )}
    </div>
  );
};

export default MoodSelector; 