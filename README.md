# FridgeWhisperer 🧊

FridgeWhisperer is an AI-powered cooking assistant that helps you create delicious meals from your available ingredients. Simply take a photo of your fridge or pantry, and let our AI suggest personalized recipes based on your mood, preferences, and cooking skill level.

## Features

- 📸 **Ingredient Recognition**: Upload photos of your fridge/pantry to automatically identify available ingredients
- 🤖 **AI-Powered Suggestions**: Get personalized recipe recommendations using Gemini AI
- 🎯 **Smart Learning**: Reinforcement learning system that adapts to your preferences over time
- 💬 **Interactive Chat**: Ask cooking questions and get real-time assistance
- 😊 **Mood-Based Recommendations**: Recipes tailored to how you're feeling
- 👍 **Simple Feedback**: Like/dislike recipes to improve future suggestions

## Tech Stack

### Backend
- Flask (Python web framework)
- Google Gemini AI (Vision and Chat)
- SQLite (Database)
- Reinforcement Learning for personalization

### Frontend
- React
- Tailwind CSS
- Framer Motion (animations)

## Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Gemini API key

### Backend Setup

1. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key

4. Run the Flask server:
   ```bash
   flask run
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## Project Structure

```
fridgewhisperer/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models/
│   │   ├── rl_agent.py       # RL logic (bandit/DQN)
│   │   ├── user_model.py     # User preferences/history
│   │   └── meal_selector.py  # Meal ranking logic
│   ├── routes/
│   │   ├── chat.py          # Gemini chat endpoint
│   │   └── meals.py         # Meal suggestions
│   └── utils/
│       └── ingredient_parser.py  # Image processing
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FridgeUpload.jsx
│   │   │   ├── MealSuggestions.jsx
│   │   │   ├── ChatBot.jsx
│   │   │   └── MoodSelector.jsx
│   │   └── App.jsx
│   └── public/
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 