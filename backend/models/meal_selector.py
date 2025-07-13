from typing import List, Dict, Any
import numpy as np
from .rl_agent import MealRLAgent
from .user_model import UserModel

class MealSelector:
    def __init__(self, rl_agent: MealRLAgent):
        self.rl_agent = rl_agent
        
    def rank_meals(self, user: UserModel, available_ingredients: List[str], 
                  candidate_meals: List[Dict[str, Any]], mood: str = None) -> List[Dict[str, Any]]:
        """Rank meals based on ingredients, user preferences, and RL agent.
        
        Args:
            user: UserModel instance
            available_ingredients: List of ingredients from fridge
            candidate_meals: List of potential meals
            mood: Optional mood indicator
            
        Returns:
            Ranked list of meals with scores
        """
        user_state = user.get_state_dict()
        if mood:
            user_state['mood'] = mood
            
        # Filter meals based on available ingredients
        viable_meals = self._filter_by_ingredients(candidate_meals, available_ingredients)
        
        # Get RL agent's preferred meal index
        if viable_meals:
            chosen_idx = self.rl_agent.choose_meal(user_state, viable_meals)
            # Boost the score of the RL-chosen meal
            viable_meals[chosen_idx]['rl_boost'] = True
            
        # Score and rank all viable meals
        scored_meals = self._score_meals(viable_meals, user_state)
        return sorted(scored_meals, key=lambda x: x['score'], reverse=True)
    
    def _filter_by_ingredients(self, meals: List[Dict[str, Any]], 
                             available: List[str]) -> List[Dict[str, Any]]:
        """Filter meals based on available ingredients."""
        available = set(i.lower() for i in available)
        filtered_meals = []
        
        for meal in meals:
            required = set(i.lower() for i in meal.get('required_ingredients', []))
            if len(required - available) <= 2:  # Allow for up to 2 missing ingredients
                meal['missing_ingredients'] = list(required - available)
                filtered_meals.append(meal)
                
        return filtered_meals
    
    def _score_meals(self, meals: List[Dict[str, Any]], 
                    user_state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Score meals based on various factors."""
        for meal in meals:
            score = 0.0
            
            # Base score from RL agent
            if meal.get('rl_boost'):
                score += 2.0
                
            # Time availability
            if meal.get('prep_time', 60) <= user_state['time_available']:
                score += 1.0
                
            # Cooking skill match
            if meal.get('difficulty', 3) <= user_state['cooking_skill']:
                score += 0.5
                
            # Dietary restrictions
            if not (set(meal.get('dietary_tags', [])) & 
                   set(user_state['dietary_restrictions'])):
                score += 1.0
                
            # Cuisine preference
            if meal.get('cuisine_type') in user_state.get('liked_cuisines', []):
                score += 1.5
                
            # Mood-based adjustment
            if user_state.get('mood') == 'tired' and meal.get('prep_time', 60) < 30:
                score += 1.0
                
            meal['score'] = score
            
        return meals 