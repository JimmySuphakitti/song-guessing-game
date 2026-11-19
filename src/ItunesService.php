<?php
namespace App;

class ItunesService {
    private string $cacheDir;
    private static string $secretKey = 'thai_quiz_itunes_secret_key_2026';
    private const MAX_ARTIST_REPETITIONS = 2; // ศิลปินออกซ้ำได้สูงสุด 2 เพลงต่อเซสชัน

    // Curated Thai artists grouped by genre
    public static array $genreArtists = [
        'pop' => [
            'name' => 'ป็อป & T-Pop',
            'icon' => '💖',
            'artists' => [
                '4EVE', 'BNK48', 'NONT TANONT', 'Three Man Down', 'Tilly Birds',
                'Bowkylion', 'Ink Waruntorn', 'Billkin', 'PP Krit', 'PROXIE',
                'Jeff Satur', 'Violette Wautier', 'THE TOYS', 'ATLAS', 'LYKN'
            ]
        ],
        'rock' => [
            'name' => 'ร็อกไทย',
            'icon' => '🎸',
            'artists' => [
                'Paper Planes', 'Bodyslam', 'Cocktail', 'Potato', 'Loso',
                'Big Ass', 'Silly Fools', 'Slot Machine', 'Retrospect', 'Sweet Mullet',
                'Labanoon', 'Klear', 'Paradox', 'Clash', 'Zeal'
            ]
        ],
        'hiphop' => [
            'name' => 'ฮิปฮอป & แร็ปไทย',
            'icon' => '🎤',
            'artists' => [
                'F.HERO', 'URBOYTJ', 'YOUNGOHM', 'D GERRARD', 'MILLI',
                'SPRITE', 'OG-ANIC', 'SARAN', '1MILL', 'MAIYARAP',
                'Twopee Southside', 'Daboyway', 'CDGTE'
            ]
        ],
        'indie' => [
            'name' => 'อินดี้ & อัลเทอร์เนทีฟ',
            'icon' => '🎧',
            'artists' => [
                'Polycat', 'Safeplanet', 'Dept', 'Anatomy Rabbit', 'Television off',
                'Yented', 'Mirrr', 'TaitosmitH', 'Solitude Is Bliss', 'Blackbeans',
                'Whal & Dolph', 'Moving and Cut'
            ]
        ],
        '90s' => [
            'name' => 'ยุค 90s - 2000s',
            'icon' => '📻',
            'artists' => [
                'Modern Dog', 'พงษ์พัฒน์', 'อัสนี วสันต์', 'ไมโคร', 'เจ เจตริน',
                'คริสติน่า อากีล่าร์', 'ทาทา ยัง', 'เบิร์ด ธงไชย', 'D2B', 'แร็พเตอร์',
                'มอส ปฏิภาณ', 'ไฮดรา', 'นูโว', 'เสือ ธนพล'
            ]
        ],
        'country' => [
            'name' => 'เพื่อชีวิต & ลูกทุ่ง',
            'icon' => '🌾',
            'artists' => [
                'คาราบาว', 'โจอี้ ภูวศิษฐ์', 'มนต์แคน แก่นคูน', 'ไผ่ พงศธร', 'ลำไย ไหทองคำ',
                'พงษ์สิทธิ์ คำภีร์', 'ต่าย อรทัย', 'ครูสลา คุณวุฒิ', 'ไมค์ ภิรมย์พร', 'เบิ้ล ปทุมราช'
            ]
        ]
    ];

    public function __construct() {
        $this->cacheDir = __DIR__ . '/../cache';
        if (!is_dir($this->cacheDir)) {
            @mkdir($this->cacheDir, 0777, true);
        }
    }

    /**
     * Search songs via iTunes Search API with local file caching
     */
    public function searchItunes(string $term, int $limit = 25): array {
        $cleanTerm = trim($term);
        if (empty($cleanTerm)) return [];

        $cacheKey = md5(mb_strtolower($cleanTerm, 'UTF-8') . '_' . $limit);
        $cacheFile = $this->cacheDir . '/itunes_' . $cacheKey . '.json';

        // Cache for 12 hours
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 43200)) {
            $cached = @file_get_contents($cacheFile);
            if ($cached) {
                $decoded = json_decode($cached, true);
                if (is_array($decoded)) return $decoded;
            }
        }

        // Call iTunes Search API
        $url = sprintf(
            'https://itunes.apple.com/search?term=%s&country=TH&media=music&entity=song&limit=%d',
            urlencode($cleanTerm),
            $limit
        );

        $results = [];

        // Fetch via cURL or stream context
        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 8);
            curl_setopt($ch, CURLOPT_USERAGENT, 'ThaiSongQuiz/2.0 (PHP; Docker)');
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $response = curl_exec($ch);
            curl_close($ch);
        } else {
            $opts = [
                'http' => [
                    'method' => 'GET',
                    'header' => "User-Agent: ThaiSongQuiz/2.0\r\n",
                    'timeout' => 8
                ]
            ];
            $context = stream_context_create($opts);
            $response = @file_get_contents($url, false, $context);
        }

        if ($response) {
            $data = json_decode($response, true);
            if (isset($data['results']) && is_array($data['results'])) {
                foreach ($data['results'] as $item) {
                    if (!empty($item['previewUrl']) && !empty($item['trackName'])) {
                        $results[] = [
                            'track_id' => (int)($item['trackId'] ?? 0),
                            'title' => $this->cleanTrackTitle($item['trackName']),
                            'raw_title' => $item['trackName'],
                            'artist' => $item['artistName'] ?? '',
                            'album' => $item['collectionName'] ?? 'ซิงเกิล',
                            'artwork' => $item['artworkUrl100'] ?? '',
                            'preview_url' => $item['previewUrl'],
                            'release_year' => !empty($item['releaseDate']) ? (int)substr($item['releaseDate'], 0, 4) : null,
                            'genre' => $item['primaryGenreName'] ?? 'Thai Music'
                        ];
                    }
                }
            }
        }

        if (!empty($results)) {
            @file_put_contents($cacheFile, json_encode($results, JSON_UNESCAPED_UNICODE));
        }

        return $results;
    }

    private function cleanTrackTitle(string $rawTitle): string {
        $title = preg_replace('/\s*[\(\[](feat\.|ft\.|with|from|ost|official|audio|mv|remastered|version|live)[\s\S]*?[\)\]]/iu', '', $rawTitle);
        return trim($title) ?: $rawTitle;
    }

    /**
     * Get randomized quiz questions with Multi-Select Genre & Anti-Repetition logic
     *
     * @param array $categories Array of genre IDs (e.g. ['pop', 'rock', 'hiphop'])
     * @param int $limit Total questions needed
     * @param string|null $customArtist Specific artist searched by user
     * @param array $playedTrackIds List of track IDs already played in current session
     * @param array $artistCounts Frequency count of how many times each artist was selected
     */
    public function getQuestions(
        array $categories = ['all'],
        int $limit = 10,
        ?string $customArtist = null,
        array $playedTrackIds = [],
        array $artistCounts = []
    ): array {
        $tracksPool = [];

        // 1. Custom Artist Query
        if (!empty($customArtist)) {
            $tracksPool = $this->searchItunes($customArtist, 40);
        } else {
            // 2. Multi-Select Genre Combination
            $selectedGenres = [];
            if (in_array('all', $categories) || empty($categories)) {
                $selectedGenres = array_keys(self::$genreArtists);
            } else {
                foreach ($categories as $cat) {
                    if (isset(self::$genreArtists[$cat])) {
                        $selectedGenres[] = $cat;
                    }
                }
                if (empty($selectedGenres)) {
                    $selectedGenres = array_keys(self::$genreArtists);
                }
            }

            // Pick 2-3 random artists from each selected genre
            $targetArtists = [];
            foreach ($selectedGenres as $genreKey) {
                $artistList = self::$genreArtists[$genreKey]['artists'] ?? [];
                shuffle($artistList);
                $pickCount = max(2, (int)ceil(10 / count($selectedGenres)));
                $targetArtists = array_merge($targetArtists, array_slice($artistList, 0, $pickCount));
            }

            // Fetch songs for target artists
            foreach ($targetArtists as $artist) {
                $songs = $this->searchItunes($artist, 8);
                $tracksPool = array_merge($tracksPool, $songs);
            }
        }

        if (empty($tracksPool)) {
            $tracksPool = $this->getFallbackSongs();
        }

        // Deduplicate songs by title + artist
        $uniquePool = [];
        foreach ($tracksPool as $t) {
            $key = mb_strtolower(trim($t['title']) . '|' . trim($t['artist']), 'UTF-8');
            if (!isset($uniquePool[$key])) {
                $uniquePool[$key] = $t;
            }
        }
        $tracksPool = array_values($uniquePool);
        shuffle($tracksPool);

        // =========================================================================
        // ANTI-REPETITION LOGIC (ระบบป้องกันเพลงและศิลปินซ้ำ)
        // =========================================================================
        $playedSet = array_flip($playedTrackIds);
        $currentArtistCounts = $artistCounts;

        $chosenQuestions = [];
        $unselectedCandidates = [];

        foreach ($tracksPool as $track) {
            $trackId = $track['track_id'];
            $artist = trim($track['artist']);
            $artistPlayCount = $currentArtistCounts[$artist] ?? 0;

            // Rule 1: ห้ามสุ่มเพลงเดิมที่เคยเล่นไปแล้วซ้ำอีก
            if (isset($playedSet[$trackId])) {
                continue;
            }

            // Rule 2: หากศิลปินถูกสุ่มเป็นโจทย์ไปแล้วครบ 2 เพลง ให้ตัดชื่อออกชั่วคราว
            if ($artistPlayCount >= self::MAX_ARTIST_REPETITIONS) {
                $unselectedCandidates[] = $track;
                continue;
            }

            // Valid candidate!
            $chosenQuestions[] = $track;
            $playedSet[$trackId] = true;
            $currentArtistCounts[$artist] = $artistPlayCount + 1;

            if (count($chosenQuestions) >= $limit) {
                break;
            }
        }

        // Fallback: หากเพลงไม่พอหลังจากตัดศิลปิน ให้ดึงจาก candidates อื่นเพื่อไม่ให้เกมค้าง
        if (count($chosenQuestions) < $limit && !empty($unselectedCandidates)) {
            foreach ($unselectedCandidates as $cand) {
                if (!isset($playedSet[$cand['track_id']])) {
                    $chosenQuestions[] = $cand;
                    $playedSet[$cand['track_id']] = true;
                    if (count($chosenQuestions) >= $limit) break;
                }
            }
        }

        // Format questions with 4 shuffled choices & signed token
        $questions = [];
        foreach ($chosenQuestions as $idx => $track) {
            $wrongChoices = [];
            $shuffledForDecoys = $tracksPool;
            shuffle($shuffledForDecoys);

            foreach ($shuffledForDecoys as $decoy) {
                if ($decoy['title'] !== $track['title']) {
                    $wrongChoices[] = [
                        'title' => $decoy['title'],
                        'artist' => $decoy['artist']
                    ];
                }
                if (count($wrongChoices) >= 3) break;
            }

            $backupDecoys = [
                ['title' => 'แผลเป็น', 'artist' => 'Atom ชนกันต์'],
                ['title' => 'คิดแต่ไม่ถึง', 'artist' => 'Tilly Birds'],
                ['title' => 'ดวงเดือน', 'artist' => 'JOEY PHUWASIT'],
                ['title' => 'พิง', 'artist' => 'NONT TANONT'],
                ['title' => 'เสแสร้ง', 'artist' => 'Paper Planes']
            ];
            foreach ($backupDecoys as $d) {
                if (count($wrongChoices) >= 3) break;
                if ($d['title'] !== $track['title']) $wrongChoices[] = $d;
            }

            $choices = $wrongChoices;
            $choices[] = [
                'title' => $track['title'],
                'artist' => $track['artist']
            ];
            shuffle($choices);

            $firstChar = mb_substr(trim($track['title']), 0, 1, 'UTF-8');
            $token = $this->generateQuestionToken($track);

            $questions[] = [
                'id' => $idx + 1,
                'track_id' => $track['track_id'],
                'token' => $token,
                'audio_url' => $track['preview_url'],
                'artwork' => $track['artwork'],
                'album' => $track['album'],
                'choices' => $choices,
                'hints' => [
                    'artist' => $track['artist'],
                    'year' => $track['release_year'],
                    'first_letter' => $firstChar . '...',
                    'genre' => $track['genre']
                ]
            ];
        }

        return [
            'questions' => $questions,
            'updated_artist_counts' => $currentArtistCounts,
            'updated_played_track_ids' => array_keys($playedSet)
        ];
    }

    /**
     * Get Song & Album Explorer Catalog grouped by genre
     */
    public function getExplorerCatalog(?string $filterCategory = null): array {
        $catalog = [];
        $targetGenres = $filterCategory && isset(self::$genreArtists[$filterCategory])
            ? [$filterCategory => self::$genreArtists[$filterCategory]]
            : self::$genreArtists;

        foreach ($targetGenres as $genreKey => $genreInfo) {
            $genreSongs = [];
            $artists = array_slice($genreInfo['artists'], 0, 5); // Pick top 5 artists per genre for catalog

            foreach ($artists as $artist) {
                $songs = $this->searchItunes($artist, 6);
                foreach ($songs as $s) {
                    $genreSongs[] = [
                        'track_id' => $s['track_id'],
                        'title' => $s['title'],
                        'artist' => $s['artist'],
                        'album' => $s['album'],
                        'artwork' => $s['artwork'],
                        'preview_url' => $s['preview_url'],
                        'year' => $s['release_year'],
                        'genre_id' => $genreKey,
                        'genre_name' => $genreInfo['name'],
                        'genre_icon' => $genreInfo['icon']
                    ];
                }
            }

            // Deduplicate songs by title
            $uniqueGenreSongs = [];
            foreach ($genreSongs as $item) {
                $k = mb_strtolower($item['title'] . '|' . $item['artist'], 'UTF-8');
                if (!isset($uniqueGenreSongs[$k])) {
                    $uniqueGenreSongs[$k] = $item;
                }
            }

            $catalog[] = [
                'genre_id' => $genreKey,
                'genre_name' => $genreInfo['name'],
                'genre_icon' => $genreInfo['icon'],
                'song_count' => count($uniqueGenreSongs),
                'songs' => array_values($uniqueGenreSongs)
            ];
        }

        return $catalog;
    }

    public function generateQuestionToken(array $track): string {
        $payload = [
            'track_id' => $track['track_id'],
            'title' => $track['title'],
            'raw_title' => $track['raw_title'] ?? $track['title'],
            'artist' => $track['artist'],
            'year' => $track['release_year'],
            'artwork' => $track['artwork'] ?? '',
            'created' => time()
        ];
        $json = json_encode($payload);
        $signature = hash_hmac('sha256', $json, self::$secretKey);
        return base64_encode($json . '||' . $signature);
    }

    public function verifyAnswer(string $token, string $submittedAnswer): array {
        $decoded = base64_decode($token);
        if (!$decoded || strpos($decoded, '||') === false) {
            return ['valid' => false, 'error' => 'Invalid token'];
        }

        [$json, $receivedSig] = explode('||', $decoded, 2);
        $expectedSig = hash_hmac('sha256', $json, self::$secretKey);

        if (!hash_equals($expectedSig, $receivedSig)) {
            return ['valid' => false, 'error' => 'Tampered token'];
        }

        $payload = json_decode($json, true);
        if (!$payload || empty($payload['title'])) {
            return ['valid' => false, 'error' => 'Corrupt payload'];
        }

        $cleanSubmitted = mb_strtolower(trim($submittedAnswer), 'UTF-8');
        $cleanTitle = mb_strtolower(trim($payload['title']), 'UTF-8');
        $cleanRawTitle = mb_strtolower(trim($payload['raw_title'] ?? ''), 'UTF-8');

        $normSub = preg_replace('/[^\p{L}\p{N}]/u', '', $cleanSubmitted);
        $normTitle = preg_replace('/[^\p{L}\p{N}]/u', '', $cleanTitle);
        $normRaw = preg_replace('/[^\p{L}\p{N}]/u', '', $cleanRawTitle);

        $isCorrect = ($cleanSubmitted === $cleanTitle) 
            || ($normSub === $normTitle)
            || ($normSub !== '' && str_contains($normRaw, $normSub))
            || ($normTitle !== '' && str_contains($normSub, $normTitle));

        return [
            'valid' => true,
            'correct' => $isCorrect,
            'track_id' => $payload['track_id'] ?? 0,
            'correct_title' => $payload['title'],
            'correct_artist' => $payload['artist'],
            'release_year' => $payload['year'],
            'artwork' => $payload['artwork'] ?? ''
        ];
    }

    private function getFallbackSongs(): array {
        return [
            ['track_id' => 101, 'title' => 'ทรงอย่างแบด', 'raw_title' => 'ทรงอย่างแบด (Bad Boy)', 'artist' => 'Paper Planes', 'album' => 'Single', 'artwork' => '', 'preview_url' => 'assets/audio/songs/badboy.wav', 'release_year' => 2022, 'genre' => 'Rock'],
            ['track_id' => 102, 'title' => 'คุกกี้เสี่ยงทาย', 'raw_title' => 'คุกกี้เสี่ยงทาย', 'artist' => 'BNK48', 'album' => 'RIVER', 'artwork' => '', 'preview_url' => 'assets/audio/songs/cookie.wav', 'release_year' => 2017, 'genre' => 'Pop'],
            ['track_id' => 103, 'title' => 'วัดปะหล่ะ?', 'raw_title' => 'วัดปะหล่ะ? (TEST ME)', 'artist' => '4EVE', 'album' => 'The First Album', 'artwork' => '', 'preview_url' => 'assets/audio/songs/watpala.wav', 'release_year' => 2021, 'genre' => 'Pop'],
            ['track_id' => 104, 'title' => 'ซ่อนกลิ่น', 'raw_title' => 'ซ่อนกลิ่น', 'artist' => 'Palmy', 'album' => 'Single', 'artwork' => '', 'preview_url' => 'assets/audio/songs/sonklin.wav', 'release_year' => 2018, 'genre' => 'Pop'],
            ['track_id' => 105, 'title' => 'คู่ชีวิต', 'raw_title' => 'คู่ชีวิต', 'artist' => 'Cocktail', 'album' => 'The Lords of Youth', 'artwork' => '', 'preview_url' => 'assets/audio/songs/kuchivit.wav', 'release_year' => 2014, 'genre' => 'Rock'],
            ['track_id' => 106, 'title' => 'โต๊ะริม', 'raw_title' => 'โต๊ะริม (melt)', 'artist' => 'NONT TANONT', 'album' => 'Cigarette Candy & Vanilla Sky', 'artwork' => '', 'preview_url' => 'assets/audio/songs/torim.wav', 'release_year' => 2022, 'genre' => 'Pop'],
            ['track_id' => 107, 'title' => 'นะหน้าทอง', 'raw_title' => 'นะหน้าทอง', 'artist' => 'โจอี้ ภูวศิษฐ์', 'album' => 'Moonไรเดอร์', 'artwork' => '', 'preview_url' => 'assets/audio/songs/nanathong.wav', 'release_year' => 2022, 'genre' => 'Country'],
            ['track_id' => 108, 'title' => 'บัวลอย', 'raw_title' => 'บัวลอย', 'artist' => 'คาราบาว', 'album' => 'เมด อิน ไทยแลนด์', 'artwork' => '', 'preview_url' => 'assets/audio/songs/bualoy.wav', 'release_year' => 1982, 'genre' => 'Country'],
            ['track_id' => 109, 'title' => 'ใจนักเลง', 'raw_title' => 'ใจนักเลง', 'artist' => 'พงษ์พัฒน์ วชิรบรรจง', 'album' => 'พงษ์พัฒน์ 4', 'artwork' => '', 'preview_url' => 'assets/audio/songs/jainukleng.wav', 'release_year' => 1994, 'genre' => '90s'],
            ['track_id' => 110, 'title' => 'สองใจ', 'raw_title' => 'สองใจ', 'artist' => 'ดา เอ็นโดรฟิน', 'album' => 'เพลงประกอบละครวันทอง', 'artwork' => '', 'preview_url' => 'assets/audio/songs/songjai.wav', 'release_year' => 2021, 'genre' => 'Pop']
        ];
    }
}
