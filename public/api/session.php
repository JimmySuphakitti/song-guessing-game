<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Ensure session exists
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$action = $_GET['action'] ?? '';

// Reset / Clear Session
if ($action === 'reset' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    unset($_SESSION['thai_song_session']);
    echo json_encode(['success' => true, 'message' => 'Session cleared'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Get Session
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $session = $_SESSION['thai_song_session'] ?? null;
    echo json_encode([
        'success' => true,
        'has_session' => !empty($session) && !empty($session['active']),
        'session' => $session
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Save / Update Session
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid session payload']);
        exit;
    }

    $data['last_updated'] = time();
    $_SESSION['thai_song_session'] = $data;

    echo json_encode([
        'success' => true,
        'message' => 'Session auto-saved successfully',
        'last_updated' => $data['last_updated']
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
