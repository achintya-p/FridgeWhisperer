from flask import Blueprint, request, jsonify
import google.generativeai as genai
from typing import Dict, Any
import os

chat_bp = Blueprint('chat', __name__)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

def create_chat_prompt(query: str, user_state: Dict[str, Any], ingredients: list[str]) -> str:
    """Create a context-aware prompt for Gemini."""
    mood = user_state.get('mood', 'neutral')
    time_available = user_state.get('time_available', 60)
    skill_level = user_state.get('cooking_skill', 1)
    
    prompt = f"""As a helpful cooking assistant, help the user who is feeling {mood} 
    and has {time_available} minutes available to cook. They have a cooking skill level 
    of {skill_level}/5. Available ingredients: {', '.join(ingredients)}.

    Their question is: {query}

    Consider their mood, time constraints, and skill level in your response. If suggesting 
    a recipe, ensure it's achievable within their time limit and skill level.
    
    Format your response in a friendly, conversational way, but be concise and practical."""
    
    return prompt

@chat_bp.route('/', methods=['POST'])
def chat():
    """Handle chat interactions with Gemini."""
    data = request.json
    query = data.get('query')
    user_state = data.get('user_state', {})
    ingredients = data.get('ingredients', [])
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
        
    try:
        prompt = create_chat_prompt(query, user_state, ingredients)
        response = model.generate_content(prompt)
        
        return jsonify({
            'response': response.text,
            'prompt_used': prompt  # For debugging
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 