from flask import Blueprint, request, jsonify
from models.meal_selector import MealSelector
from models.rl_agent import MealRLAgent
from models.user_model import UserModel
from utils.ingredient_parser import extract_ingredients_from_image
import os

meals_bp = Blueprint('meals', __name__)

# Initialize RL agent (should be persisted in production)
rl_agent = MealRLAgent()
meal_selector = MealSelector(rl_agent)

@meals_bp.route('/suggest', methods=['POST'])
def suggest_meals():
    """Suggest meals based on available ingredients."""
    data = request.json
    user_id = data.get('user_id')
    mood = data.get('mood')
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
        
    # Get or create user model
    user = UserModel(user_id)  # In production, load from database
    
    # Handle either image upload or manual ingredient list
    ingredients = []
    if 'image' in request.files:
        image = request.files['image']
        ingredients = extract_ingredients_from_image(image)
    else:
        ingredients = data.get('ingredients', [])
        
    if not ingredients:
        return jsonify({'error': 'No ingredients provided'}), 400
        
    # Get meal candidates from database/API
    # TODO: Replace with actual meal database integration
    candidate_meals = [
        {
            'id': '1',
            'name': 'Quick Pasta',
            'cuisine_type': 'italian',
            'prep_time': 20,
            'required_ingredients': ['pasta', 'tomato', 'garlic'],
            'difficulty': 2
        },
        # Add more sample meals here
    ]
    
    # Rank meals using selector
    ranked_meals = meal_selector.rank_meals(
        user=user,
        available_ingredients=ingredients,
        candidate_meals=candidate_meals,
        mood=mood
    )
    
    return jsonify({
        'meals': ranked_meals[:5],  # Return top 5 suggestions
        'ingredients_found': ingredients
    })
    
@meals_bp.route('/feedback', methods=['POST'])
def meal_feedback():
    """Handle user feedback for RL agent updating."""
    data = request.json
    user_id = data.get('user_id')
    meal_id = data.get('meal_id')
    rating = data.get('rating')  # 1 for like, -1 for dislike
    completed = data.get('completed', False)
    
    if not all([user_id, meal_id, rating is not None]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    # Update RL agent
    cuisine_id = 0  # TODO: Get actual cuisine ID from meal
    rl_agent.update_reward(cuisine_id, rating)
    
    # Update user history
    user = UserModel(user_id)  # In production, load from database
    user.add_meal_to_history(meal_id, rating, completed)
    
    return jsonify({'status': 'success'}) 