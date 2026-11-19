<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../src/Database.php';
require_once __DIR__ . '/../../src/ScoreRepository.php';

use App\ScoreRepository;

try {
    $scoreRepo = new ScoreRepository();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $category = $_GET['category'] ?? 'all';
        $limit = isset($_GET['limit']) ? max(5, min(50, (int)$_GET['limit'])) : 10;

        $topScores = $scoreRepo->getTopScores($limit, $category);

        echo json_encode([
            'success' => true,
            'leaderboard' => $topScores
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data || !isset($data['player_name']) || !isset($data['score'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid score submission payload']);
            exit;
        }

        $playerName = trim($data['player_name']);
        $score = (int)$data['score'];
        $correctCount = isset($data['correct_count']) ? (int)$data['correct_count'] : 0;
        $totalQuestions = isset($data['total_questions']) ? (int)$data['total_questions'] : 10;
        $category = $data['category'] ?? 'all';

        $id = $scoreRepo->saveScore($playerName, $score, $correctCount, $totalQuestions, $category);

        // Fetch refreshed top 10
        $topScores = $scoreRepo->getTopScores(10, $category);

        echo json_encode([
            'success' => true,
            'inserted_id' => $id,
            'leaderboard' => $topScores
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
