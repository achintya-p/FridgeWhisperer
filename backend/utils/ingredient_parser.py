from typing import List
import google.generativeai as genai
import os
from PIL import Image
import io

def extract_ingredients_from_image(image_file) -> List[str]:
    """Extract ingredients from an image using Gemini Vision API.
    
    Args:
        image_file: File object from request.files
        
    Returns:
        List of ingredient names
    """
    try:
        # Configure Gemini
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-pro-vision')
        
        # Convert file to PIL Image
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Create prompt for Gemini
        prompt = """Look at this image of a fridge or pantry and list all visible food ingredients.
        Format the response as a simple comma-separated list of ingredients.
        Be specific but concise (e.g., 'red onion' not just 'onion' if visible).
        Ignore non-food items and packaging."""
        
        # Generate response
        response = model.generate_content([prompt, image])
        
        # Parse response into list
        ingredients_text = response.text.strip()
        ingredients = [
            item.strip() 
            for item in ingredients_text.split(',')
            if item.strip()
        ]
        
        return ingredients
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return []
        
def clean_ingredient_name(name: str) -> str:
    """Clean and standardize ingredient names."""
    # Remove quantities and units
    cleaned = name.lower()
    units = ['cup', 'tablespoon', 'teaspoon', 'ounce', 'pound', 'gram', 'kg']
    for unit in units:
        cleaned = cleaned.replace(unit + 's', '').replace(unit, '')
        
    # Remove common prefixes
    prefixes = ['fresh', 'frozen', 'dried', 'canned']
    for prefix in prefixes:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):].strip()
            
    return cleaned.strip() 