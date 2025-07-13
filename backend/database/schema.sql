-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cooking_skill_level INTEGER DEFAULT 1,
    max_prep_time INTEGER DEFAULT 60,
    household_size INTEGER DEFAULT 1
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT REFERENCES users(id),
    preference_type TEXT,  -- 'cuisine', 'ingredient', 'dietary'
    preference_value TEXT,
    is_liked BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, preference_type, preference_value)
);

-- Meal history
CREATE TABLE IF NOT EXISTS meal_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id),
    meal_id TEXT,
    rating INTEGER,  -- -1 for dislike, 1 for like
    completed BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RL state (for persistence)
CREATE TABLE IF NOT EXISTS rl_state (
    cuisine_id INTEGER PRIMARY KEY,
    q_value REAL DEFAULT 0.0,
    n_selections INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 