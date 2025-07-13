from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.chat import chat_bp
from routes.meals import meals_bp
from database.db import init_db

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register blueprints
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(meals_bp, url_prefix='/api/meals')

# Initialize database
init_db()

if __name__ == '__main__':
    app.run(debug=True) 