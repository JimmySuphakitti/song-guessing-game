<?php
// Main Entry Point - Thai Song Guessing Game (iTunes API + Multi-Genre + Auto-Save Session)
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#0b0f19">
    <title>🇹🇭 เกมทายเพลงไทย • Thai Song Quiz</title>
    
    <!-- Google Fonts: Prompt -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
    
    <!-- CSS Stylesheets -->
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/animations.css">
</head>
<body>
    <!-- Confetti Canvas -->
    <canvas id="confetti-canvas"></canvas>

    <div class="app-container">
        <!-- App Header -->
        <header class="app-header">
            <a href="index.php" class="brand">
                <div class="brand-icon">🎵</div>
                <div class="brand-text">
                    <h1>ทายเพลงไทย</h1>
                    <p>Thai Song Quiz (iTunes API)</p>
                </div>
            </a>
            <div class="header-actions">
                <button id="btn-open-explorer" class="btn-secondary" title="ดูคลังเพลงและอัลบั้ม">
                    📂 <span style="display: none; @media(min-width: 520px){display: inline;}">คลังเพลง</span>
                </button>
                <button class="btn-secondary" data-open-modal="modal-leaderboard" title="ตารางอันดับ">
                    🏆
                </button>
                <button id="btn-header-reset" class="btn-secondary" title="เริ่มเกมใหม่ (Reset Session)">
                    🔄
                </button>
                <button class="btn-secondary" data-open-modal="modal-help" title="วิธีเล่น">
                    ❓
                </button>
            </div>
        </header>

        <!-- ==========================================
             FEATURE 4: AUTO-SAVE & SESSION RECOVERY BANNER
             ========================================== -->
        <div id="session-recovery-banner" class="session-recovery-banner">
            <div>
                <div class="session-info-title">
                    <span>🔔</span> มีเกมที่เล่นค้างอยู่จากเซสชันเดิม!
                </div>
                <div id="session-banner-desc" class="session-info-desc">
                    กำลังโหลดข้อมูลเซสชัน...
                </div>
            </div>
            <div class="session-actions">
                <button id="btn-resume-session" class="btn-resume" type="button">
                    ▶️ เล่นต่อทันที
                </button>
                <button id="btn-reset-session-banner" class="btn-reset-session" type="button" title="ล้างเซสชันและเริ่มใหม่">
                    เริ่มใหม่
                </button>
            </div>
        </div>

        <!-- ==========================================
             SCREEN 1: START & CONFIGURATION
             ========================================== -->
        <main id="screen-start" class="screen active">
            <div class="game-card">
                <div class="api-badge">
                    ⚡ ดึงเพลงสดผ่าน iTunes Search API • ป้องกันเพลงและศิลปินซ้ำ
                </div>
                <h2 class="welcome-title">ทายท่อนฮุคเพลงไทย 🎶</h2>
                <p class="welcome-subtitle">ฟังเสียงจริงจาก Apple Music แล้วทายให้ถูกว่าเพลงนี้ชื่ออะไร!</p>

                <!-- Search Custom Artist -->
                <label class="form-label">🔍 พิมพ์ศิลปินหรือวงที่อยากเล่น (หรือเลือกแนวเพลงด้านล่าง)</label>
                <div class="search-artist-wrapper">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="artist-search-input" class="search-artist-input" placeholder="เช่น 4EVE, Bodyslam, Three Man Down, Palmy, URBOYTJ...">
                    <div class="search-artist-hints">
                        <span style="font-size: 0.75rem; color: var(--text-muted); align-self: center;">ศิลปินฮิต:</span>
                        <span class="quick-tag" onclick="selectQuickArtist('4EVE')">4EVE</span>
                        <span class="quick-tag" onclick="selectQuickArtist('Bodyslam')">Bodyslam</span>
                        <span class="quick-tag" onclick="selectQuickArtist('Three Man Down')">Three Man Down</span>
                        <span class="quick-tag" onclick="selectQuickArtist('NONT TANONT')">NONT TANONT</span>
                        <span class="quick-tag" onclick="selectQuickArtist('URBOYTJ')">URBOYTJ</span>
                        <span class="quick-tag" onclick="selectQuickArtist('Polycat')">Polycat</span>
                        <span class="quick-tag" onclick="selectQuickArtist('Paper Planes')">Paper Planes</span>
                    </div>
                </div>

                <!-- FEATURE 2: Multi-Select Genre Selection -->
                <div class="genre-header-row">
                    <label class="form-label">เลือกแนวเพลง (กดเลือกได้หลายหมวดพร้อมกัน)</label>
                    <div>
                        <span id="genre-counter-badge" class="genre-counter-badge">เลือก: รวมทุกแนว</span>
                        <button type="button" id="btn-select-all-genres" class="btn-select-all-genres">เลือกทุกหมวด</button>
                    </div>
                </div>

                <div class="category-grid">
                    <div class="category-pill selected" data-category="all">
                        <span class="check-indicator">✓</span>
                        <span class="icon">🌟</span>
                        <span class="label">รวมทุกแนว</span>
                    </div>
                    <div class="category-pill" data-category="pop">
                        <span class="check-indicator">✓</span>
                        <span class="icon">💖</span>
                        <span class="label">ป็อป & T-Pop</span>
                    </div>
                    <div class="category-pill" data-category="rock">
                        <span class="check-indicator">✓</span>
                        <span class="icon">🎸</span>
                        <span class="label">ร็อกไทย</span>
                    </div>
                    <div class="category-pill" data-category="hiphop">
                        <span class="check-indicator">✓</span>
                        <span class="icon">🎤</span>
                        <span class="label">ฮิปฮอป & แร็ป</span>
                    </div>
                    <div class="category-pill" data-category="indie">
                        <span class="check-indicator">✓</span>
                        <span class="icon">🎧</span>
                        <span class="label">อินดี้ & อัลเทอร์</span>
                    </div>
                    <div class="category-pill" data-category="90s">
                        <span class="check-indicator">✓</span>
                        <span class="icon">📻</span>
                        <span class="label">ยุค 90s - 2000s</span>
                    </div>
                    <div class="category-pill" data-category="country">
                        <span class="check-indicator">✓</span>
                        <span class="icon">🌾</span>
                        <span class="label">เพื่อชีวิต & ลูกทุ่ง</span>
                    </div>
                </div>

                <!-- Game Mode Selection -->
                <label class="form-label">โหมดการเล่น</label>
                <div id="mode-toggle" class="toggle-group">
                    <button type="button" class="toggle-btn active" data-mode="choice">
                        <span>🔠 เลือกตอบ 4 ช้อยส์</span>
                    </button>
                    <button type="button" class="toggle-btn" data-mode="text">
                        <span>✍️ พิมพ์ทายชื่อเพลง</span>
                    </button>
                </div>

                <!-- Question Count Selection -->
                <label class="form-label">จำนวนข้อต่อรอบ</label>
                <div id="count-toggle" class="toggle-group">
                    <button type="button" class="toggle-btn" data-count="5">5 ข้อ (ไวๆ)</button>
                    <button type="button" class="toggle-btn active" data-count="10">10 ข้อ (มาตรฐาน)</button>
                    <button type="button" class="toggle-btn" data-count="15">15 ข้อ (เซียนเพลง)</button>
                </div>

                <!-- Start Action -->
                <button id="btn-start-game" class="btn-primary">
                    🎵 เริ่มเล่นเกมเลย
                </button>
            </div>
        </main>

        <!-- ==========================================
             SCREEN 2: IN-GAME QUESTION STAGE
             ========================================== -->
        <main id="screen-game" class="screen">
            <div class="game-card">
                <!-- Top Status Bar -->
                <div class="game-top-bar">
                    <div class="round-badge">
                        ข้อที่ <span id="round-current">1</span> / <span id="round-total">10</span>
                    </div>
                    <div class="score-display">
                        <button id="btn-game-reset" class="btn-game-reset" title="ยอมแพ้ / รีเซ็ตเริ่มใหม่">
                            🔄 รีเซ็ต
                        </button>
                        <div id="streak-pill" class="streak-pill">
                            <span id="streak-value">🔥 x2 Combo!</span>
                        </div>
                        <div class="score-pill">
                            คะแนน: <span id="score-value">0</span>
                        </div>
                    </div>
                </div>

                <!-- 15s Countdown Timer Bar -->
                <div class="timer-container">
                    <div id="timer-bar" class="timer-bar"></div>
                </div>

                <!-- Central Audio Player & Vinyl Animation -->
                <div class="player-stage">
                    <div id="vinyl-disc" class="vinyl-disc" title="กดเพื่อฟังเสียงเพลง">
                        <div class="vinyl-center">🎵</div>
                    </div>
                    
                    <!-- Sound Wave Visualizer -->
                    <div id="sound-waves" class="sound-waves">
                        <div class="sound-wave-bar"></div>
                        <div class="sound-wave-bar"></div>
                        <div class="sound-wave-bar"></div>
                        <div class="sound-wave-bar"></div>
                        <div class="sound-wave-bar"></div>
                    </div>
                    
                    <div id="player-status-text" class="player-status-text">กำลังโหลดเสียง...</div>
                    <button id="audio-ctrl-btn" class="audio-ctrl-btn" type="button">
                        ▶️ ฟังเสียงเพลง
                    </button>
                </div>

                <!-- Hints Toolbar -->
                <div class="hints-bar">
                    <button id="hint-artist" class="hint-btn" type="button">👤 ใบ้ศิลปิน</button>
                    <button id="hint-year" class="hint-btn" type="button">📅 ใบ้ปี</button>
                    <button id="hint-first-letter" class="hint-btn" type="button">🔤 อักษรแรก</button>
                    <button id="hint-custom" class="hint-btn" type="button">🎸 แนวเพลง</button>
                </div>

                <!-- Mode 1: Multiple Choice Grid -->
                <div id="choices-container" class="choices-container">
                    <!-- Dynamic choice buttons inserted via JS -->
                </div>

                <!-- Mode 2: Text Guess Input -->
                <div id="text-guess-container" class="text-guess-container" style="display: none;">
                    <input type="text" id="text-guess-input" class="text-guess-input" placeholder="พิมพ์ชื่อเพลงที่คิดว่าใช่..." autocomplete="off">
                    <button id="btn-submit-text" class="btn-primary" type="button">
                        🚀 ตรวจคำตอบ
                    </button>
                </div>

                <!-- Immediate Answer Feedback Banner -->
                <div id="feedback-banner" class="feedback-banner">
                    <span id="feedback-text">ผลลัพธ์คำตอบ</span>
                </div>
            </div>
        </main>

        <!-- ==========================================
             SCREEN 3: GAME OVER & RESULTS
             ========================================== -->
        <main id="screen-result" class="screen">
            <div class="game-card">
                <div class="result-header">
                    <div id="res-trophy" class="trophy-badge">🏆</div>
                    <h2 id="res-rank-title" class="rank-title">สุดยอดเซียนเพลงไทย!</h2>
                    <p id="res-rank-desc" class="rank-desc">คุณจำทำนองเพลงได้แม่นยำมาก</p>
                </div>

                <!-- Performance Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-box">
                        <div id="res-score" class="stat-value">0</div>
                        <div class="stat-label">คะแนนรวม</div>
                    </div>
                    <div class="stat-box">
                        <div id="res-correct" class="stat-value">0/10</div>
                        <div class="stat-label">ความถูกต้อง</div>
                    </div>
                    <div class="stat-box" style="grid-column: span 2;">
                        <div id="res-streak" class="stat-value" style="color: var(--accent-amber);">🔥 0 ติดต่อกัน</div>
                        <div class="stat-label">คอมโบต่อเนื่องสูงสุด</div>
                    </div>
                </div>

                <!-- Save Score to Leaderboard -->
                <form id="form-save-score" class="save-score-form">
                    <label class="form-label" style="margin-bottom: 4px;">บันทึกคะแนนขึ้นตารางอันดับ</label>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">ใส่ชื่อของคุณเพื่อโชว์สถิติบนกระดานผู้นำ</p>
                    <div class="save-score-input-group">
                        <input type="text" id="player-name-input" placeholder="ระบุชื่อของคุณ..." maxlength="30" required>
                        <button type="submit" id="btn-save-score">บันทึกคะแนน</button>
                    </div>
                </form>

                <!-- Navigation Actions -->
                <div class="result-actions">
                    <button id="btn-play-again" class="btn-primary" style="flex: 1;">
                        🔄 เล่นอีกรอบ
                    </button>
                    <button id="btn-go-home" class="btn-secondary" style="flex: 1; justify-content: center;">
                        🏠 หน้าหลัก
                    </button>
                </div>
            </div>
        </main>

        <!-- Footer Info -->
        <footer class="app-footer">
            <p>Thai Song Quiz • ขับเคลื่อนด้วย iTunes Search API (Apple Music) • Auto-Save Session</p>
            <p style="margin-top: 4px; font-size: 0.75rem; color: var(--text-muted);">
                ระบบป้องกันเพลงและศิลปินซ้ำ • สตรีมตัวอย่างเพลงความยาว 30 วินาที
            </p>
        </footer>
    </div>

    <!-- ==========================================
         FEATURE 3: MODAL SONG & ALBUM EXPLORER
         ========================================== -->
    <div id="modal-explorer" class="modal-overlay">
        <div class="modal-content modal-explorer-content">
            <div class="modal-header">
                <div>
                    <h3>📂 คลังเพลง & อัลบั้มยอดนิยม</h3>
                    <p class="modal-subtitle">สำรวจเพลงไทยตามหมวดหมู่ พรีวิวเสียง 30 วินาทีจาก Apple Music</p>
                </div>
                <button class="modal-close-btn" title="ปิด">&times;</button>
            </div>
            <div class="modal-body explorer-modal-body">
                <!-- Search & Status Bar -->
                <div class="explorer-filter-bar">
                    <div class="explorer-search-wrapper">
                        <span class="explorer-search-icon">🔍</span>
                        <input type="text" id="explorer-search-input" class="explorer-search-input" placeholder="พิมพ์ค้นหาชื่อเพลง, ศิลปิน หรืออัลบั้ม..." autocomplete="off">
                        <button type="button" id="explorer-search-clear" class="explorer-search-clear" title="ล้างการค้นหา">&times;</button>
                    </div>
                    <div class="explorer-status-row">
                        <span id="explorer-count-badge" class="explorer-count-badge">กำลังโหลดรายการเพลง...</span>
                        <span id="explorer-audio-now-playing" class="explorer-now-playing" style="display: none;">
                            <span class="playing-indicator-dot"></span>
                            <span id="explorer-now-playing-title" class="now-playing-text">กำลังเล่นตัวอย่าง</span>
                            <button type="button" class="btn-stop-preview" onclick="Game.stopExplorerPreview()">หยุด</button>
                        </span>
                    </div>
                </div>

                <!-- Genre Tabs Filter -->
                <div id="explorer-tabs-container" class="explorer-tabs">
                    <!-- Dynamic tabs -->
                </div>

                <!-- Song Card List -->
                <div id="explorer-songs-list" class="explorer-songs-list">
                    <!-- Dynamic song cards -->
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================
         MODAL: LEADERBOARD
         ========================================== -->
    <div id="modal-leaderboard" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3>🏆 ตารางอันดับเซียนเพลง</h3>
                <button class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <ul id="leaderboard-list" class="leaderboard-list">
                    <!-- Dynamic leaderboard records -->
                </ul>
            </div>
        </div>
    </div>

    <!-- ==========================================
         MODAL: HOW TO PLAY
         ========================================== -->
    <div id="modal-help" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3>❓ กฎและวิธีเล่น</h3>
                <button class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body" style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7;">
                <p><strong>1. เลือกแนวเพลงได้หลายหมวด (Multi-Select):</strong> สามารถเลือก Pop + Rock + Hip-Hop ร่วมกันได้ หรือคลิกเลือกทุกหมวด</p>
                <p style="margin-top: 8px;"><strong>2. ระบบป้องกันเพลงและศิลปินซ้ำ:</strong> ในเซสชันการเล่น ระบบจะไม่สุ่มเพลงที่เคยทายไปแล้ว และหากศิลปินคนไหนออกครบ 2 ครั้ง ระบบจะสลับไปหาศิลปินคนอื่นทันที</p>
                <p style="margin-top: 8px;"><strong>3. คลังเพลงและอัลบั้ม (Explorer):</strong> กดปุ่ม 📂 ที่แถบด้านบนเพื่อดูรายชื่อเพลงและปกอัลบั้มในแต่ละหมวดหมู่ พร้อมกดฟังตัวอย่างเพลงได้</p>
                <p style="margin-top: 8px;"><strong>4. บันทึก Session อัตโนมัติ:</strong> หากเผลอปิดแท็บหรือรีเฟรชหน้าเว็บ ระบบจะจดจำข้อและคะแนนเดิมไว้ให้กลับมาเล่นต่อได้ทันที หรือกดปุ่ม 🔄 เพื่อรีเซ็ตเริ่มใหม่</p>
            </div>
        </div>
    </div>

    <!-- Inline Script for Quick Search -->
    <script>
        function selectQuickArtist(name) {
            const input = document.getElementById('artist-search-input');
            if (input) {
                input.value = name;
                input.dispatchEvent(new Event('input'));
                input.focus();
            }
        }
    </script>

    <!-- Core Scripts -->
    <script src="assets/js/api.js"></script>
    <script src="assets/js/audio-player.js"></script>
    <script src="assets/js/ui.js"></script>
    <script src="assets/js/game.js"></script>
</body>
</html>
