import numpy as np
from typing import List, Dict, Any

class MealRLAgent:
    def __init__(self, n_cuisines: int = 10, learning_rate: float = 0.1):
        """Initialize the RL agent with a simple multi-armed bandit approach.
        
        Args:
            n_cuisines: Number of cuisine types (arms)
            learning_rate: How quickly the agent updates its preferences
        """
        self.n_cuisines = n_cuisines
        self.learning_rate = learning_rate
        self.q_values = np.zeros(n_cuisines)  # Estimated value for each cuisine
        self.n_selections = np.zeros(n_cuisines)  # Number of times each cuisine was selected
        
    def choose_meal(self, user_state: Dict[str, Any], candidate_meals: List[Dict[str, Any]]) -> int:
        """Choose the best meal based on current Q-values and exploration.
        
        Args:
            user_state: Dictionary containing user preferences and context
            candidate_meals: List of potential meals to choose from
            
        Returns:
            Index of the selected meal
        """
        # Epsilon-greedy exploration strategy
        epsilon = 1.0 / (1.0 + sum(self.n_selections))  # Decay exploration over time
        
        if np.random.random() < epsilon:
            # Explore: choose random meal
            return np.random.randint(len(candidate_meals))
        
        # Exploit: choose meal with highest expected value
        meal_scores = []
        for meal in candidate_meals:
            cuisine_idx = meal.get('cuisine_id', 0)
            base_score = self.q_values[cuisine_idx]
            
            # Adjust score based on user state
            if user_state.get('time_available', 60) < meal.get('prep_time', 30):
                base_score -= 0.5
            if meal.get('cuisine_type') in user_state.get('liked_cuisines', []):
                base_score += 0.3
                
            meal_scores.append(base_score)
            
        return np.argmax(meal_scores)
    
    def update_reward(self, cuisine_id: int, reward: float):
        """Update Q-values based on received reward.
        
        Args:
            cuisine_id: Index of the cuisine type
            reward: Reward value (+1 for liked, -1 for disliked)
        """
        self.n_selections[cuisine_id] += 1
        self.q_values[cuisine_id] += self.learning_rate * (reward - self.q_values[cuisine_id])

    def get_state_vector(self, user_state: Dict[str, Any]) -> np.ndarray:
        """Create state vector for future DQN implementation.
        
        Args:
            user_state: Dictionary containing user state information
            
        Returns:
            Numpy array representing the state
        """
        # TODO: Implement more sophisticated state representation for DQN
        time_available = user_state.get('time_available', 60) / 120.0  # Normalize
        cuisine_onehot = np.zeros(self.n_cuisines)
        for cuisine in user_state.get('liked_cuisines', []):
            if cuisine < self.n_cuisines:
                cuisine_onehot[cuisine] = 1
                
        return np.concatenate([[time_available], cuisine_onehot]) 