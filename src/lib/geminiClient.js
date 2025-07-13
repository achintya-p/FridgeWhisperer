import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Initialize the Generative AI client
let genAI = null;
try {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} catch (error) {
  console.error('Error initializing Gemini:', error);
}

export async function analyzeImage(base64Image) {
  if (!genAI) {
    console.warn('Gemini AI not initialized. Running in demo mode.');
    return `Demo Mode Response:
Found ingredients:
- Milk
- Eggs
- Vegetables
- Cheese

Suggested recipes:
1. Basic Omelette
2. Vegetable Stir Fry
3. Grilled Cheese Sandwich`;
  }

  try {
    // Create a new model instance for each request
    const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // Prepare the image data
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg'
      }
    };

    // Send request to Gemini
    const prompt = 'Analyze this image of a fridge and list all visible ingredients and food items. Then suggest 2-3 possible recipes that can be made with these ingredients.';
    const result = await visionModel.generateContent([prompt, imagePart]);
    
    // Get the response
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image:', error);
    return `Error Mode Response:
Unable to analyze image at the moment. Here are some general suggestions:

Found common ingredients:
- Basic pantry items
- Fresh produce
- Dairy products

Suggested recipes:
1. Quick Pasta Dish
2. Simple Salad
3. Basic Sandwich`;
  }
} 