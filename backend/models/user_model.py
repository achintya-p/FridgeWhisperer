from typing import List, Dict, Any
from datetime import datetime, timedelta

class UserModel:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.liked_cuisines: List[str] = []
        self.disliked_ingredients: List[str] = []
        self.cooking_skill_level: int = 1  # 1-5 scale
        self.meal_history: List[Dict[str, Any]] = []
        self.preferences = {
            'max_prep_time': 60,  # minutes
            'dietary_restrictions': [],
            'preferred_meal_times': ['dinner'],
            'household_size': 1
        }
        
    def update_preferences(self, preferences: Dict[str, Any]):
        """Update user preferences."""
        self.preferences.update(preferences)
        
    def add_meal_to_history(self, meal_id: str, rating: int, completed: bool):
        """Add a meal to the user's history with rating and completion status."""
        self.meal_history.append({
            'meal_id': meal_id,
            'rating': rating,
            'completed': completed,
            'timestamp': datetime.now().isoformat()
        })
        
    def get_recent_cuisines(self, days: int = 7) -> List[str]:
        """Get list of cuisines consumed in recent history."""
        cutoff = datetime.now() - timedelta(days=days)
        recent_meals = [
            meal for meal in self.meal_history 
            if datetime.fromisoformat(meal['timestamp']) > cutoff
        ]
        return [meal.get('cuisine_type', '') for meal in recent_meals]
    
    def get_state_dict(self) -> Dict[str, Any]:
        """Get current user state for RL agent."""
        return {
            'time_available': self.preferences['max_prep_time'],
            'liked_cuisines': self.liked_cuisines,
            'cooking_skill': self.cooking_skill_level,
            'dietary_restrictions': self.preferences['dietary_restrictions'],
            'recent_cuisines': self.get_recent_cuisines(),
            'household_size': self.preferences['household_size']
        } 