interface DietSelectProps {
  selectedDiet: string;
  onDietChange: (diet: string) => void;
}

const DIETS = [
  'Any',
  'Vegetarian',
  'Vegan',
  'Ketogenic',
  'Paleo',
  'High-Protein',
  'Low-Carb',
  'Gluten-Free',
  'Whole30'
];

export default function DietSelect({ selectedDiet, onDietChange }: DietSelectProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-2">
        Dietary Restriction
      </label>
      <select
        id="diet"
        value={selectedDiet}
        onChange={(e) => onDietChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        {DIETS.map((diet) => (
          <option key={diet} value={diet === 'Any' ? '' : diet.toLowerCase()}>
            {diet}
          </option>
        ))}
      </select>
    </div>
  );
} 