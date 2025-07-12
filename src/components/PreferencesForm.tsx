import React from 'react';

interface PreferencesFormProps {
  onPreferencesChange: (preferences: {
    mood: string;
    diet: string;
    timeConstraint: string;
  }) => void;
}

export default function PreferencesForm({ onPreferencesChange }: PreferencesFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onPreferencesChange({
      mood: name === 'mood' ? value : '',
      diet: name === 'diet' ? value : '',
      timeConstraint: name === 'timeConstraint' ? value : '',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Mood/Theme
        </label>
        <select
          name="mood"
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border-2 border-blue-100 focus:border-blue-300 
                   focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
        >
          <option value="">Any mood</option>
          <option value="comfort">Comfort food</option>
          <option value="healthy">Healthy</option>
          <option value="quick">Quick & Easy</option>
          <option value="fancy">Fancy</option>
          <option value="cozy">Cozy</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dietary Preferences
        </label>
        <select
          name="diet"
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border-2 border-blue-100 focus:border-blue-300 
                   focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
        >
          <option value="">No restrictions</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-free</option>
          <option value="dairy-free">Dairy-free</option>
          <option value="keto">Keto</option>
          <option value="low-carb">Low-carb</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Time Constraint
        </label>
        <select
          name="timeConstraint"
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl border-2 border-blue-100 focus:border-blue-300 
                   focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
        >
          <option value="">Any time</option>
          <option value="15">Under 15 minutes</option>
          <option value="30">Under 30 minutes</option>
          <option value="45">Under 45 minutes</option>
          <option value="60">Under 1 hour</option>
        </select>
      </div>
    </div>
  );
} 