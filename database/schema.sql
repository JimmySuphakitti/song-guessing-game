-- Database Schema for Thai Song Guessing Game (Leaderboard only)
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    category TEXT NOT NULL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
