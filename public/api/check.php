<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../src/ItunesService.php';

use App\ItunesService;

try {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || !isset($data['token']) || !isset($data['answer'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing question token or answer'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $token = (string)$data['token'];
    $userAnswer = (string)$data['answer'];
    $timeLeft = isset($data['time_left']) ? max(0, min(30, (float)$data['time_left'])) : 0;
    $currentStreak = isset($data['streak']) ? max(0, (int)$data['streak']) : 0;
    $usedHint = !empty($data['used_hint']);

    $itunes = new ItunesService();
    $result = $itunes->verifyAnswer($token, $userAnswer);

    if (!$result['valid']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $result['error'] ?? 'Invalid token'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $earnedPoints = 0;
    $newStreak = 0;

    if ($result['correct']) {
        // Base points
        $base = 100;
        // Time bonus: up to +60 points (4 points per remaining second)
        $timeBonus = floor($timeLeft * 4);

        // Hint penalty if used
        $hintPenalty = $usedHint ? 25 : 0;

        // Streak multiplier
        $newStreak = $currentStreak + 1;
        $multiplier = 1.0;
        if ($newStreak >= 4) {
            $multiplier = 2.0;
        } elseif ($newStreak === 3) {
            $multiplier = 1.5;
        } elseif ($newStreak === 2) {
            $multiplier = 1.25;
        }

        $rawScore = max(25, ($base + $timeBonus - $hintPenalty));
        $earnedPoints = (int)round($rawScore * $multiplier);
    } else {
        $newStreak = 0;
    }

    echo json_encode([
        'success' => true,
        'correct' => $result['correct'],
        'points' => $earnedPoints,
        'new_streak' => $newStreak,
        'correct_title' => $result['correct_title'],
        'correct_artist' => $result['correct_artist'],
        'release_year' => $result['release_year'],
        'artwork' => $result['artwork'] ?? ''
    ], JSON_UNESCAPED_UNICODE);

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
