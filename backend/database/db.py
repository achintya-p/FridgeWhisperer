import sqlite3
import os
from flask import g
from typing import Any, List, Dict

DATABASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'fridge_whisperer.db')

def get_db():
    """Get database connection."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    """Initialize database with schema."""
    with open(os.path.join(os.path.dirname(__file__), 'schema.sql'), 'r') as f:
        schema = f.read()
    db = get_db()
    db.executescript(schema)
    db.commit()

def query_db(query: str, args=(), one=False) -> List[Dict[str, Any]]:
    """Query database with optional parameters."""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (dict(rv[0]) if rv else None) if one else [dict(x) for x in rv]

def close_db(e=None):
    """Close database connection."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# User-related database operations
def get_user(user_id: str) -> Dict[str, Any]:
    """Get user by ID."""
    return query_db('SELECT * FROM users WHERE id = ?', [user_id], one=True)

def create_user(user_id: str, cooking_skill: int = 1, max_prep_time: int = 60) -> None:
    """Create new user."""
    db = get_db()
    db.execute(
        'INSERT INTO users (id, cooking_skill_level, max_prep_time) VALUES (?, ?, ?)',
        [user_id, cooking_skill, max_prep_time]
    )
    db.commit()

def update_user_preference(user_id: str, pref_type: str, value: str, liked: bool) -> None:
    """Update user preference."""
    db = get_db()
    db.execute(
        '''INSERT OR REPLACE INTO user_preferences 
           (user_id, preference_type, preference_value, is_liked)
           VALUES (?, ?, ?, ?)''',
        [user_id, pref_type, value, liked]
    )
    db.commit()

def get_user_preferences(user_id: str) -> Dict[str, List[str]]:
    """Get all user preferences."""
    liked_prefs = query_db(
        '''SELECT preference_type, preference_value 
           FROM user_preferences 
           WHERE user_id = ? AND is_liked = 1''',
        [user_id]
    )
    
    prefs = {}
    for pref in liked_prefs:
        pref_type = pref['preference_type']
        if pref_type not in prefs:
            prefs[pref_type] = []
        prefs[pref_type].append(pref['preference_value'])
    
    return prefs

# RL state persistence
def save_rl_state(cuisine_id: int, q_value: float, n_selections: int) -> None:
    """Save RL agent state."""
    db = get_db()
    db.execute(
        '''INSERT OR REPLACE INTO rl_state 
           (cuisine_id, q_value, n_selections)
           VALUES (?, ?, ?)''',
        [cuisine_id, q_value, n_selections]
    )
    db.commit()

def load_rl_state() -> List[Dict[str, Any]]:
    """Load RL agent state."""
    return query_db('SELECT * FROM rl_state') 