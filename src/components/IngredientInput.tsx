import React, { useState, KeyboardEvent } from 'react';

interface IngredientInputProps {
  onIngredientsChange: (ingredients: string[]) => void;
}

export default function IngredientInput({ onIngredientsChange }: IngredientInputProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      const newIngredient = currentInput.trim();
      const updatedIngredients = [...ingredients, newIngredient];
      setIngredients(updatedIngredients);
      onIngredientsChange(updatedIngredients);
      setCurrentInput('');
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
    onIngredientsChange(updatedIngredients);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type an ingredient and press Enter..."
          className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-300 
                   focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          Press Enter ↵
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className="input-tag group flex items-center gap-1"
          >
            {ingredient}
            <button
              onClick={() => removeIngredient(index)}
              className="ml-1 text-blue-400 hover:text-blue-600 transition-colors duration-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 