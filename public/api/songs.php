<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../src/ItunesService.php';

use App\ItunesService;

try {
    $itunes = new ItunesService();
    $action = $_GET['action'] ?? 'get_questions';

    // 1. Get Questions (with Multi-Select & Anti-Repetition)
    if ($action === 'get_questions') {
        // Parse multi-select categories
        $rawCategories = $_GET['categories'] ?? ($_GET['category'] ?? ['all']);
        if (is_string($rawCategories)) {
            $categories = array_map('trim', explode(',', $rawCategories));
        } elseif (is_array($rawCategories)) {
            $categories = $rawCategories;
        } else {
            $categories = ['all'];
        }

        $customTerm = !empty($_GET['term']) ? trim($_GET['term']) : null;
        $limit = isset($_GET['count']) ? max(3, min(20, (int)$_GET['count'])) : 10;

        // Parse anti-repetition inputs
        $playedTrackIds = [];
        if (!empty($_GET['played_tracks'])) {
            $playedTrackIds = is_array($_GET['played_tracks'])
                ? array_map('intval', $_GET['played_tracks'])
                : array_map('intval', explode(',', $_GET['played_tracks']));
        }

        $artistCounts = [];
        if (!empty($_GET['artist_counts'])) {
            $decoded = json_decode($_GET['artist_counts'], true);
            if (is_array($decoded)) {
                $artistCounts = $decoded;
            }
        }

        $result = $itunes->getQuestions($categories, $limit, $customTerm, $playedTrackIds, $artistCounts);

        echo json_encode([
            'success' => true,
            'source' => 'itunes_api',
            'categories' => $categories,
            'term' => $customTerm,
            'count' => count($result['questions']),
            'questions' => $result['questions'],
            'updated_artist_counts' => $result['updated_artist_counts'],
            'updated_played_track_ids' => $result['updated_played_track_ids']
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // 2. Song & Album Explorer Catalog
    if ($action === 'explorer') {
        $category = !empty($_GET['category']) ? trim($_GET['category']) : null;
        $catalog = $itunes->getExplorerCatalog($category);

        echo json_encode([
            'success' => true,
            'catalog' => $catalog
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // 3. Category List
    if ($action === 'categories') {
        $categories = [];
        foreach (ItunesService::$genreArtists as $key => $val) {
            $categories[] = [
                'id' => $key,
                'name' => $val['name'],
                'icon' => $val['icon'],
                'sample_artists' => array_slice($val['artists'], 0, 4)
            ];
        }

        echo json_encode([
            'success' => true,
            'categories' => $categories
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 4. Search Artist
    if ($action === 'search_artist') {
        $term = trim($_GET['term'] ?? '');
        if (empty($term)) {
            echo json_encode(['success' => false, 'error' => 'กรุณาระบุชื่อศิลปินหรือเพลง']);
            exit;
        }

        $results = $itunes->searchItunes($term, 12);
        echo json_encode([
            'success' => true,
            'count' => count($results),
            'results' => $results
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
