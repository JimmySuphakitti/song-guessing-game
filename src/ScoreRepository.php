<?php
namespace App;

use PDO;

class ScoreRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Save player game result
     */
    public function saveScore(string $playerName, int $score, int $correctCount, int $totalQuestions, string $category): int {
        $cleanedName = htmlspecialchars(strip_tags(trim($playerName)), ENT_QUOTES, 'UTF-8');
        if (empty($cleanedName)) {
            $cleanedName = 'ผู้เล่นไม่ระบุนาม';
        }

        $stmt = $this->db->prepare("
            INSERT INTO scores (player_name, score, correct_count, total_questions, category)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $cleanedName,
            max(0, $score),
            $correctCount,
            $totalQuestions,
            $category
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Get top scores for leaderboard
     */
    public function getTopScores(int $limit = 10, string $category = 'all'): array {
        if ($category !== 'all') {
            $stmt = $this->db->prepare("
                SELECT player_name, score, correct_count, total_questions, category, played_at
                FROM scores
                WHERE category = ?
                ORDER BY score DESC, correct_count DESC, id ASC
                LIMIT ?
            ");
            $stmt->execute([$category, $limit]);
        } else {
            $stmt = $this->db->prepare("
                SELECT player_name, score, correct_count, total_questions, category, played_at
                FROM scores
                ORDER BY score DESC, correct_count DESC, id ASC
                LIMIT ?
            ");
            $stmt->execute([$limit]);
        }

        return $stmt->fetchAll();
    }
}
