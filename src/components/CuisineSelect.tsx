interface CuisineSelectProps {
  selectedCuisine: string;
  onCuisineChange: (cuisine: string) => void;
}

const CUISINES = [
  'Any',
  'Italian',
  'Mexican',
  'Asian',
  'Mediterranean',
  'American',
  'Indian',
  'French',
  'Greek',
  'Japanese',
  'Thai',
  'Chinese',
  'Spanish',
  'Korean',
  'Vietnamese'
];

export default function CuisineSelect({ selectedCuisine, onCuisineChange }: CuisineSelectProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
        Preferred Cuisine
      </label>
      <select
        id="cuisine"
        value={selectedCuisine}
        onChange={(e) => onCuisineChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        {CUISINES.map((cuisine) => (
          <option key={cuisine} value={cuisine === 'Any' ? '' : cuisine.toLowerCase()}>
            {cuisine}
          </option>
        ))}
      </select>
    </div>
  );
} 