import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

interface IngredientCount {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  name: string;
  description: string;
  ingredients: IngredientCount[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  imagePrompt: string;
}

function cleanGeminiResponse(text: string): string {
  console.log('Original response:', text);
  
  // First, try to extract content from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim();
    console.log('Extracted from code block:', text);
  }

  // Remove any potential natural language before or after the JSON
  const jsonStart = text.indexOf('[');
  const jsonEnd = text.lastIndexOf(']');
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    text = text.slice(jsonStart, jsonEnd + 1);
    console.log('Extracted JSON array:', text);
  }
  
  // Fix common JSON formatting issues
  text = text
    // Remove any BOM or special characters
    .replace(/^\uFEFF/, '')
    // Fix missing quotes around property names
    .replace(/(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    // Convert fractions to decimals (e.g., 1/2 -> 0.5, 1/4 -> 0.25, etc.)
    .replace(/(\d+)\/(\d+)/g, (match, num, den) => (parseFloat(num) / parseFloat(den)).toString())
    // Ensure numbers are valid JSON numbers
    .replace(/(\d+)\.(?!\d)/g, '$1.0')
    // Fix potential single quotes
    .replace(/'/g, '"')
    // Remove any trailing commas in arrays/objects
    .replace(/,(\s*[\]}])/g, '$1')
    // Fix potential unquoted string values
    .replace(/:\s*([a-zA-Z][a-zA-Z0-9\s]*[a-zA-Z0-9])(?=\s*[,}])/g, ':"$1"')
    // Remove any escaped quotes within quotes
    .replace(/\\"/g, '"')
    .replace(/"([^"]*)""/g, '"$1"')
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    // Remove any comments
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

  console.log('After cleaning:', text);

  // Try to parse and re-stringify to ensure valid JSON
  try {
    const parsed = JSON.parse(text);
    text = JSON.stringify(parsed);
    console.log('Successfully parsed and re-stringified:', text);
  } catch (error) {
    console.error('Failed to parse during cleaning:', error);
    // If parsing fails, continue with the cleaned text
  }

  // Validate basic JSON structure
  if (!text.startsWith('[') || !text.endsWith(']')) {
    throw new Error('Response is not a JSON array');
  }

  return text;
}

export async function analyzeImage(imageBase64: string): Promise<IngredientCount[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Ensure the image data is properly formatted
    const mimeType = "image/jpeg";
    const imageData = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    const prompt = `You are a helpful AI assistant analyzing the contents of a fridge.
    Look at this image and list all visible food items you can identify.
    For each item, estimate the quantity and provide an appropriate unit of measurement.
    
    Format your response EXACTLY as a JSON array of objects with these properties:
    - name: the name of the food item
    - quantity: a number representing the amount
    - unit: the unit of measurement (e.g., "pieces", "grams", "cups")
    
    Example response format:
    [
      {"name": "apple", "quantity": 3, "unit": "pieces"},
      {"name": "milk", "quantity": 1, "unit": "gallon"}
    ]
    
    Only respond with the JSON array, no other text. Do not include any markdown formatting or code blocks.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: imageData
        }
      },
      prompt
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Add debug logging
    console.log('Raw Gemini response for image analysis:', text);
    
    let cleanedText = '';
    try {
      cleanedText = cleanGeminiResponse(text);
      console.log('Cleaned response:', cleanedText);
      
      const parsed = JSON.parse(cleanedText);
      
      // Validate the response structure
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each item in the array
      parsed.forEach((item, index) => {
        if (!item.name || typeof item.name !== 'string') {
          throw new Error(`Invalid name in item ${index}`);
        }
        if (!item.quantity || typeof item.quantity !== 'number') {
          throw new Error(`Invalid quantity in item ${index}`);
        }
        if (!item.unit || typeof item.unit !== 'string') {
          throw new Error(`Invalid unit in item ${index}`);
        }
      });
      
      return parsed;
    } catch (error) {
      const parseError = error as Error;
      console.error('Failed to parse Gemini response:', text);
      console.error('Cleaned response:', cleanedText);
      console.error('Parse error:', parseError);
      throw new Error(`Invalid response format from Gemini: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error('Error in analyzeImage:', error);
    if (error.message?.includes('PERMISSION_DENIED')) {
      throw new Error('API key error: Please check your Gemini API key');
    }
    throw error;
  }
}

export async function generateRecipes(ingredients: IngredientCount[], preferences?: {
  diet?: string;
  cuisine?: string;
}): Promise<Recipe[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `As a culinary expert, create recipes using these ingredients:
${JSON.stringify(ingredients, null, 2)}

${preferences?.diet ? `Dietary preference: ${preferences.diet}` : ''}
${preferences?.cuisine ? `Cuisine preference: ${preferences.cuisine}` : ''}

Format your response as a JSON array of recipe objects. Follow these requirements EXACTLY:

1. Use this EXACT structure for each recipe:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": 0.0,
      "unit": "unit of measurement"
    }
  ],
  "instructions": [
    "Step 1",
    "Step 2"
  ],
  "nutrition": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fats": 0
  },
  "imagePrompt": "Description for image"
}

2. CRITICAL JSON FORMATTING RULES:
- Use ONLY double quotes (") for strings
- All property names must be in double quotes
- Use decimal numbers (0.25) instead of fractions (1/4)
- No trailing commas
- No comments or extra text
- No markdown formatting

Example of correct number formatting:
CORRECT: "quantity": 0.25
INCORRECT: "quantity": 1/4
INCORRECT: "quantity": 1.

Respond with ONLY the JSON array containing 1-3 recipes. No other text or formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Add debug logging
    console.log('Raw Gemini response for recipe generation:', text);
    
    let cleanedText = '';
    try {
      cleanedText = cleanGeminiResponse(text);
      console.log('Cleaned response:', cleanedText);
      
      // Add line numbers to the cleaned response for better error reporting
      const numberedLines = cleanedText.split('\n').map((line, i) => `${i + 1}: ${line}`).join('\n');
      console.log('Response with line numbers:', numberedLines);
      
      try {
        const parsed = JSON.parse(cleanedText);
        
        // Validate the response structure
        if (!Array.isArray(parsed)) {
          throw new Error('Response is not an array');
        }
        
        // Validate each recipe in the array
        parsed.forEach((recipe, index) => {
          if (!recipe.name || typeof recipe.name !== 'string') {
            throw new Error(`Invalid name in recipe ${index}`);
          }
          if (!recipe.description || typeof recipe.description !== 'string') {
            throw new Error(`Invalid description in recipe ${index}`);
          }
          if (!Array.isArray(recipe.ingredients)) {
            throw new Error(`Invalid ingredients in recipe ${index}`);
          }
          recipe.ingredients.forEach((ingredient: IngredientCount, i: number) => {
            if (!ingredient.name || typeof ingredient.name !== 'string') {
              throw new Error(`Invalid ingredient name in recipe ${index}, ingredient ${i}`);
            }
            if (typeof ingredient.quantity !== 'number') {
              throw new Error(`Invalid ingredient quantity in recipe ${index}, ingredient ${i}`);
            }
            if (!ingredient.unit || typeof ingredient.unit !== 'string') {
              throw new Error(`Invalid ingredient unit in recipe ${index}, ingredient ${i}`);
            }
          });
          if (!Array.isArray(recipe.instructions)) {
            throw new Error(`Invalid instructions in recipe ${index}`);
          }
          if (!recipe.nutrition || typeof recipe.nutrition !== 'object') {
            throw new Error(`Invalid nutrition in recipe ${index}`);
          }
          const nutrition = recipe.nutrition;
          if (typeof nutrition.calories !== 'number') {
            throw new Error(`Invalid calories in recipe ${index}`);
          }
          if (typeof nutrition.protein !== 'number') {
            throw new Error(`Invalid protein in recipe ${index}`);
          }
          if (typeof nutrition.carbs !== 'number') {
            throw new Error(`Invalid carbs in recipe ${index}`);
          }
          if (typeof nutrition.fats !== 'number') {
            throw new Error(`Invalid fats in recipe ${index}`);
          }
          if (!recipe.imagePrompt || typeof recipe.imagePrompt !== 'string') {
            throw new Error(`Invalid imagePrompt in recipe ${index}`);
          }
        });
        
        return parsed;
      } catch (jsonError) {
        const error = jsonError as Error;
        // Try to identify the problematic part of the JSON
        const position = parseInt((error.message.match(/position (\d+)/) || [])[1]);
        if (!isNaN(position)) {
          // Show more context around the error
          const start = Math.max(0, position - 100);
          const end = Math.min(cleanedText.length, position + 100);
          console.error('JSON error context (100 chars before and after error):');
          console.error(cleanedText.slice(start, position) + ' >>> ERROR HERE >>> ' + cleanedText.slice(position, end));
          console.error('Character at error position:', cleanedText[position]);
          console.error('Character code:', cleanedText.charCodeAt(position));
          
          // Show the line where the error occurred
          const lines = cleanedText.split('\n');
          let currentPos = 0;
          for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1; // +1 for newline
            if (currentPos + lineLength > position) {
              console.error(`Error on line ${i + 1}:`, lines[i]);
              console.error(' '.repeat(position - currentPos) + '^');
              break;
            }
            currentPos += lineLength;
          }
        }
        throw error;
      }
    } catch (error) {
      const parseError = error as Error;
      console.error('Failed to parse Gemini response:', text);
      console.error('Cleaned response:', cleanedText);
      console.error('Parse error:', parseError);
      throw new Error(`Invalid recipe format from Gemini: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error('Error in generateRecipes:', error);
    if (error.message?.includes('PERMISSION_DENIED')) {
      throw new Error('API key error: Please check your Gemini API key');
    }
    throw error;
  }
} 

export async function generateFusionRecipe(
  ingredients: IngredientCount[],
  cuisine1: string,
  cuisine2: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `As a creative chef specializing in fusion cuisine, create an innovative recipe that combines ${cuisine1} and ${cuisine2} cuisines using these ingredients:
${JSON.stringify(ingredients, null, 2)}

The recipe should:
1. Respect the core techniques of both cuisines
2. Create interesting flavor combinations
3. Use the ingredients in unexpected ways
4. Have a creative fusion name
5. Explain why this fusion works

Format your response as a creative story about how this fusion recipe was discovered, followed by the actual recipe.
Keep the tone fun and adventurous.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in generateFusionRecipe:', error);
    throw error;
  }
} 