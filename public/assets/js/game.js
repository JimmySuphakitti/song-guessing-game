/**
 * Thai Song Guessing Game - Game Engine & Controller
 * Features: Multi-Select Genre, Anti-Repetition, Song Explorer & Auto-Save Session
 */
class GameEngine {
    constructor() {
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.highestStreak = 0;
        this.correctCount = 0;
        this.timerInterval = null;
        this.timeLeft = 15;
        this.maxTime = 15;
        this.isLocked = false;
        this.usedHintThisRound = false;

        // Anti-Repetition State
        this.playedTrackIds = [];
        this.artistCounts = {};

        // Settings
        this.selectedCategories = ['all'];
        this.searchTerm = '';
        this.gameMode = 'choice';
        this.totalQuestions = 10;

        // Active Session Flag
        this.isSessionActive = false;

        // Explorer State
        this.catalogData = [];
        this.activeExplorerCategory = 'all';
        this.currentPreviewAudio = null;

        // DOM elements
        this.dom = {};
    }

    async init() {
        this.cacheDomElements();
        this.bindEvents();
        await this.checkExistingSession();
    }

    cacheDomElements() {
        this.dom = {
            // Screens & Banners
            screenStart: document.getElementById('screen-start'),
            screenGame: document.getElementById('screen-game'),
            screenResult: document.getElementById('screen-result'),
            sessionBanner: document.getElementById('session-recovery-banner'),
            sessionBannerText: document.getElementById('session-banner-desc'),
            btnResumeSession: document.getElementById('btn-resume-session'),
            btnResetSessionBanner: document.getElementById('btn-reset-session-banner'),
            btnHeaderReset: document.getElementById('btn-header-reset'),
            btnGameReset: document.getElementById('btn-game-reset'),
            // Start Controls
            genreCounterBadge: document.getElementById('genre-counter-badge'),
            btnSelectAllGenres: document.getElementById('btn-select-all-genres'),
            artistSearchInput: document.getElementById('artist-search-input'),
            btnStart: document.getElementById('btn-start-game'),
            // Game Stage Controls
            roundCurrent: document.getElementById('round-current'),
            roundTotal: document.getElementById('round-total'),
            scoreVal: document.getElementById('score-value'),
            streakPill: document.getElementById('streak-pill'),
            streakVal: document.getElementById('streak-value'),
            timerBar: document.getElementById('timer-bar'),
            vinylDisc: document.getElementById('vinyl-disc'),
            vinylCenter: document.querySelector('.vinyl-center'),
            choicesBox: document.getElementById('choices-container'),
            textGuessBox: document.getElementById('text-guess-container'),
            textInput: document.getElementById('text-guess-input'),
            textSubmitBtn: document.getElementById('btn-submit-text'),
            feedbackBanner: document.getElementById('feedback-banner'),
            feedbackText: document.getElementById('feedback-text'),
            // Hints
            hintArtistBtn: document.getElementById('hint-artist'),
            hintYearBtn: document.getElementById('hint-year'),
            hintFirstLetterBtn: document.getElementById('hint-first-letter'),
            hintCustomBtn: document.getElementById('hint-custom'),
            // Result screen
            resScore: document.getElementById('res-score'),
            resCorrect: document.getElementById('res-correct'),
            resStreak: document.getElementById('res-streak'),
            resRankTitle: document.getElementById('res-rank-title'),
            resRankDesc: document.getElementById('res-rank-desc'),
            resTrophy: document.getElementById('res-trophy'),
            btnPlayAgain: document.getElementById('btn-play-again'),
            btnGoHome: document.getElementById('btn-go-home'),
            formSaveScore: document.getElementById('form-save-score'),
            inputPlayerName: document.getElementById('player-name-input'),
            btnSaveScore: document.getElementById('btn-save-score'),
            // Explorer Modal
            btnOpenExplorer: document.getElementById('btn-open-explorer'),
            modalExplorer: document.getElementById('modal-explorer'),
            explorerTabsContainer: document.getElementById('explorer-tabs-container'),
            explorerSearchInput: document.getElementById('explorer-search-input'),
            explorerSearchClear: document.getElementById('explorer-search-clear'),
            explorerCountBadge: document.getElementById('explorer-count-badge'),
            explorerAudioNowPlaying: document.getElementById('explorer-audio-now-playing'),
            explorerNowPlayingTitle: document.getElementById('explorer-now-playing-title'),
            explorerSongsList: document.getElementById('explorer-songs-list')
        };
    }

    bindEvents() {
        // Start Game
        if (this.dom.btnStart) {
            this.dom.btnStart.addEventListener('click', () => this.startNewGame());
        }

        // Multi-Select Genre Logic
        document.querySelectorAll('.category-pill').forEach(pill => {
            pill.addEventListener('click', () => this.toggleGenreSelection(pill));
        });

        if (this.dom.btnSelectAllGenres) {
            this.dom.btnSelectAllGenres.addEventListener('click', () => this.selectAllGenres());
        }

        // Artist Search Input
        if (this.dom.artistSearchInput) {
            this.dom.artistSearchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.trim();
            });
            this.dom.artistSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.startNewGame();
                }
            });
        }

        // Mode Toggle
        document.querySelectorAll('#mode-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#mode-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gameMode = btn.dataset.mode || 'choice';
            });
        });

        // Question Count Toggle
        document.querySelectorAll('#count-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#count-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.totalQuestions = parseInt(btn.dataset.count, 10) || 10;
            });
        });

        // Text Guess Submit
        if (this.dom.textSubmitBtn) {
            this.dom.textSubmitBtn.addEventListener('click', () => this.submitTextGuess());
        }
        if (this.dom.textInput) {
            this.dom.textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.submitTextGuess();
            });
        }

        // Hints
        if (this.dom.hintArtistBtn) this.dom.hintArtistBtn.addEventListener('click', () => this.useHint('artist'));
        if (this.dom.hintYearBtn) this.dom.hintYearBtn.addEventListener('click', () => this.useHint('year'));
        if (this.dom.hintFirstLetterBtn) this.dom.hintFirstLetterBtn.addEventListener('click', () => this.useHint('first_letter'));
        if (this.dom.hintCustomBtn) this.dom.hintCustomBtn.addEventListener('click', () => this.useHint('genre'));

        // Session Resume / Reset
        if (this.dom.btnResumeSession) {
            this.dom.btnResumeSession.addEventListener('click', () => this.resumeActiveSession());
        }
        if (this.dom.btnResetSessionBanner) {
            this.dom.btnResetSessionBanner.addEventListener('click', () => this.resetSession());
        }
        if (this.dom.btnHeaderReset) {
            this.dom.btnHeaderReset.addEventListener('click', () => this.resetSession(true));
        }
        if (this.dom.btnGameReset) {
            this.dom.btnGameReset.addEventListener('click', () => this.resetSession(true));
        }

        // Explorer
        if (this.dom.btnOpenExplorer) {
            this.dom.btnOpenExplorer.addEventListener('click', () => this.openExplorerModal());
        }
        if (this.dom.explorerSearchInput) {
            this.dom.explorerSearchInput.addEventListener('input', (e) => {
                const val = e.target.value;
                if (this.dom.explorerSearchClear) {
                    if (val) {
                        this.dom.explorerSearchClear.classList.add('visible');
                    } else {
                        this.dom.explorerSearchClear.classList.remove('visible');
                    }
                }
                this.filterExplorerList(val.trim());
            });
        }
        if (this.dom.explorerSearchClear) {
            this.dom.explorerSearchClear.addEventListener('click', () => {
                if (this.dom.explorerSearchInput) {
                    this.dom.explorerSearchInput.value = '';
                    this.dom.explorerSearchClear.classList.remove('visible');
                    this.filterExplorerList('');
                    this.dom.explorerSearchInput.focus();
                }
            });
        }

        // Result Actions
        if (this.dom.btnPlayAgain) {
            this.dom.btnPlayAgain.addEventListener('click', () => this.startNewGame());
        }
        if (this.dom.btnGoHome) {
            this.dom.btnGoHome.addEventListener('click', () => {
                Sound.stopSnippet();
                UI.showScreen('start');
            });
        }

        // Save Score
        if (this.dom.formSaveScore) {
            this.dom.formSaveScore.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitLeaderboardScore();
            });
        }
    }

    // =========================================================================
    // FEATURE 2: MULTI-SELECT GENRE LOGIC
    // =========================================================================
    toggleGenreSelection(pill) {
        const cat = pill.dataset.category;

        if (cat === 'all') {
            // Selecting "All" clears individual genres
            this.selectedCategories = ['all'];
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
        } else {
            // Uncheck "all" if a specific genre is clicked
            this.selectedCategories = this.selectedCategories.filter(c => c !== 'all');
            const allPill = document.querySelector('.category-pill[data-category="all"]');
            if (allPill) allPill.classList.remove('selected');

            if (this.selectedCategories.includes(cat)) {
                // Deselect
                this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
                pill.classList.remove('selected');
            } else {
                // Select
                this.selectedCategories.push(cat);
                pill.classList.add('selected');
            }

            // If none selected, fallback to 'all'
            if (this.selectedCategories.length === 0) {
                this.selectedCategories = ['all'];
                if (allPill) allPill.classList.add('selected');
            }
        }

        this.updateGenreBadge();
    }

    selectAllGenres() {
        this.selectedCategories = ['pop', 'rock', 'hiphop', 'indie', '90s', 'country'];
        document.querySelectorAll('.category-pill').forEach(p => {
            if (p.dataset.category !== 'all') {
                p.classList.add('selected');
            } else {
                p.classList.remove('selected');
            }
        });
        this.updateGenreBadge();
    }

    updateGenreBadge() {
        if (!this.dom.genreCounterBadge) return;
        if (this.selectedCategories.includes('all')) {
            this.dom.genreCounterBadge.textContent = 'เลือก: รวมทุกแนว';
        } else {
            this.dom.genreCounterBadge.textContent = `เลือกแล้ว ${this.selectedCategories.length} แนวเพลง`;
        }
    }

    // =========================================================================
    // FEATURE 4: AUTO-SAVE & SESSION RECOVERY
    // =========================================================================
    async checkExistingSession() {
        try {
            // Check localStorage first (fast)
            const localSaved = localStorage.getItem('thai_song_quiz_session');
            let session = null;

            if (localSaved) {
                session = JSON.parse(localSaved);
            } else {
                // Check server PHP Session
                const res = await API.getSession();
                if (res.has_session && res.session) {
                    session = res.session;
                }
            }

            if (session && session.active && session.questions && session.currentIndex < session.questions.length) {
                this.cachedSession = session;
                if (this.dom.sessionBanner && this.dom.sessionBannerText) {
                    const remaining = session.questions.length - session.currentIndex;
                    this.dom.sessionBannerText.textContent = `ข้อที่ ${session.currentIndex + 1}/${session.questions.length} • คะแนนสะสม: ${session.score.toLocaleString()} (เหลืออีก ${remaining} ข้อ)`;
                    this.dom.sessionBanner.classList.add('show');
                }
            } else {
                if (this.dom.sessionBanner) this.dom.sessionBanner.classList.remove('show');
            }
        } catch (e) {
            console.warn('Session check failed', e);
        }
    }

    resumeActiveSession() {
        if (!this.cachedSession) return;
        const s = this.cachedSession;

        this.questions = s.questions;
        this.currentIndex = s.currentIndex;
        this.score = s.score || 0;
        this.streak = s.streak || 0;
        this.highestStreak = s.highestStreak || 0;
        this.correctCount = s.correctCount || 0;
        this.playedTrackIds = s.playedTrackIds || [];
        this.artistCounts = s.artistCounts || {};
        this.selectedCategories = s.selectedCategories || ['all'];
        this.gameMode = s.gameMode || 'choice';
        this.totalQuestions = this.questions.length;
        this.isSessionActive = true;

        if (this.dom.sessionBanner) this.dom.sessionBanner.classList.remove('show');

        UI.showScreen('game');
        this.loadQuestion(this.currentIndex);
    }

    async autoSaveSession() {
        if (!this.isSessionActive) return;

        const sessionPayload = {
            active: true,
            currentIndex: this.currentIndex,
            totalQuestions: this.totalQuestions,
            score: this.score,
            streak: this.streak,
            highestStreak: this.highestStreak,
            correctCount: this.correctCount,
            questions: this.questions,
            playedTrackIds: this.playedTrackIds,
            artistCounts: this.artistCounts,
            selectedCategories: this.selectedCategories,
            searchTerm: this.searchTerm,
            gameMode: this.gameMode,
            timestamp: Date.now()
        };

        // Save locally
        localStorage.setItem('thai_song_quiz_session', JSON.stringify(sessionPayload));

        // Sync with PHP Session backend
        await API.saveSession(sessionPayload);
    }

    async resetSession(confirmPrompt = false) {
        if (confirmPrompt && !confirm('คุณแน่ใจหรือไม่ว่าต้องการเริ่มเกมใหม่และล้างประวัติการเล่นทั้งหมด?')) {
            return;
        }

        this.isSessionActive = false;
        this.cachedSession = null;
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.highestStreak = 0;
        this.correctCount = 0;
        this.playedTrackIds = [];
        this.artistCounts = {};

        this.clearTimer();
        Sound.stopSnippet();

        // Wipe local & server storage
        localStorage.removeItem('thai_song_quiz_session');
        await API.resetSession();

        if (this.dom.sessionBanner) this.dom.sessionBanner.classList.remove('show');
        UI.showScreen('start');
    }

    // =========================================================================
    // GAME LOOP WITH ANTI-REPETITION
    // =========================================================================
    async startNewGame() {
        this.score = 0;
        this.streak = 0;
        this.highestStreak = 0;
        this.correctCount = 0;
        this.currentIndex = 0;
        this.isLocked = false;
        this.isSessionActive = true;

        if (this.dom.artistSearchInput) {
            this.searchTerm = this.dom.artistSearchInput.value.trim();
        }

        if (this.dom.btnStart) {
            this.dom.btnStart.textContent = '⏳ กำลังสุ่มเพลงตามเงื่อนไข (ไม่ซ้ำ)...';
            this.dom.btnStart.disabled = true;
        }

        // FEATURE 1 & 2: Multi-Genre & Anti-Repetition API call
        const res = await API.getQuestions(
            this.selectedCategories,
            this.totalQuestions,
            this.searchTerm,
            this.playedTrackIds,
            this.artistCounts
        );

        if (this.dom.btnStart) {
            this.dom.btnStart.innerHTML = '🎵 เริ่มเล่นเกมเลย';
            this.dom.btnStart.disabled = false;
        }

        if (!res.success || !res.questions || res.questions.length === 0) {
            alert('ไม่พบเพลงสำหรับแนวเพลงหรือศิลปินที่เลือก กรุณาลองเลือกแนวอื่น');
            return;
        }

        this.questions = res.questions;
        this.totalQuestions = this.questions.length;

        // Update tracking state
        if (res.updated_artist_counts) this.artistCounts = res.updated_artist_counts;
        if (res.updated_played_track_ids) this.playedTrackIds = res.updated_played_track_ids;

        if (this.dom.sessionBanner) this.dom.sessionBanner.classList.remove('show');

        UI.showScreen('game');
        this.loadQuestion(0);
        await this.autoSaveSession();
    }

    loadQuestion(index) {
        if (index >= this.questions.length) {
            this.endGame();
            return;
        }

        this.currentIndex = index;
        this.isLocked = false;
        this.usedHintThisRound = false;

        const q = this.questions[index];

        // Track played ID
        if (q.track_id && !this.playedTrackIds.includes(q.track_id)) {
            this.playedTrackIds.push(q.track_id);
        }

        // Reset Vinyl Artwork
        if (this.dom.vinylCenter) {
            this.dom.vinylCenter.style.backgroundImage = 'none';
            this.dom.vinylCenter.textContent = '🎵';
        }

        // Update Top Bar
        if (this.dom.roundCurrent) this.dom.roundCurrent.textContent = index + 1;
        if (this.dom.roundTotal) this.dom.roundTotal.textContent = this.totalQuestions;
        if (this.dom.scoreVal) this.dom.scoreVal.textContent = this.score.toLocaleString();

        this.updateStreakUI();

        // Reset feedback banner
        if (this.dom.feedbackBanner) {
            this.dom.feedbackBanner.className = 'feedback-banner';
            this.dom.feedbackBanner.style.display = 'none';
        }

        this.resetHints(q.hints);

        // Render Answer UI
        if (this.gameMode === 'choice') {
            if (this.dom.choicesBox) this.dom.choicesBox.style.display = 'grid';
            if (this.dom.textGuessBox) this.dom.textGuessBox.style.display = 'none';
            this.renderChoices(q.choices);
        } else {
            if (this.dom.choicesBox) this.dom.choicesBox.style.display = 'none';
            if (this.dom.textGuessBox) this.dom.textGuessBox.style.display = 'flex';
            if (this.dom.textInput) {
                this.dom.textInput.value = '';
                this.dom.textInput.disabled = false;
                setTimeout(() => this.dom.textInput.focus(), 100);
            }
        }

        // Play stream
        Sound.playSnippet(q.audio_url);
        this.startTimer();

        // Auto-save progression
        this.autoSaveSession();
    }

    renderChoices(choices) {
        if (!this.dom.choicesBox) return;
        const keys = ['A', 'B', 'C', 'D'];
        this.dom.choicesBox.innerHTML = '';

        choices.forEach((c, idx) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.dataset.title = c.title;
            btn.innerHTML = `
                <div class="choice-key">${keys[idx] || (idx + 1)}</div>
                <div class="choice-title">${UI.escapeHtml(c.title)}</div>
            `;

            btn.addEventListener('click', () => {
                if (!this.isLocked) {
                    this.handleAnswer(c.title, btn);
                }
            });

            this.dom.choicesBox.appendChild(btn);
        });
    }

    submitTextGuess() {
        if (this.isLocked || !this.dom.textInput) return;
        const val = this.dom.textInput.value.trim();
        if (!val) {
            this.dom.textInput.focus();
            return;
        }
        this.handleAnswer(val, null);
    }

    startTimer() {
        this.clearTimer();
        this.timeLeft = this.maxTime;
        this.updateTimerUI();

        this.timerInterval = setInterval(() => {
            this.timeLeft -= 0.1;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.clearTimer();
                this.handleTimeUp();
            } else {
                if (this.timeLeft <= 3.0 && Math.floor(this.timeLeft * 10) % 10 === 0) {
                    Sound.playTick();
                }
            }
            this.updateTimerUI();
        }, 100);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerUI() {
        if (!this.dom.timerBar) return;
        const percentage = Math.max(0, (this.timeLeft / this.maxTime) * 100);
        this.dom.timerBar.style.width = `${percentage}%`;

        if (this.timeLeft <= 4) {
            this.dom.timerBar.className = 'timer-bar critical';
        } else if (this.timeLeft <= 8) {
            this.dom.timerBar.className = 'timer-bar warning';
        } else {
            this.dom.timerBar.className = 'timer-bar';
        }
    }

    async handleAnswer(submittedAnswer, targetButton) {
        if (this.isLocked) return;
        this.isLocked = true;
        this.clearTimer();

        const q = this.questions[this.currentIndex];

        document.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
        if (this.dom.textInput) this.dom.textInput.disabled = true;

        const res = await API.checkAnswer(
            q.token,
            submittedAnswer,
            this.timeLeft,
            this.streak,
            this.usedHintThisRound
        );

        if (res.artwork && this.dom.vinylCenter) {
            this.dom.vinylCenter.textContent = '';
            this.dom.vinylCenter.style.backgroundImage = `url(${res.artwork})`;
            this.dom.vinylCenter.style.backgroundSize = 'cover';
        }

        if (res.correct) {
            Sound.playCorrect();
            this.correctCount++;
            this.score += res.points;
            this.streak = res.new_streak || (this.streak + 1);
            if (this.streak > this.highestStreak) this.highestStreak = this.streak;

            if (targetButton) targetButton.classList.add('correct');
            UI.showFloatingPoints(res.points);
            this.showFeedback(true, `ถูกต้อง! +${res.points} แต้ม • "${res.correct_title}" (${res.correct_artist})`);
        } else {
            Sound.playWrong();
            this.streak = 0;
            if (targetButton) targetButton.classList.add('wrong');

            document.querySelectorAll('.choice-btn').forEach(btn => {
                if (btn.dataset.title === res.correct_title) {
                    btn.classList.add('correct');
                }
            });

            this.showFeedback(false, `ยังไม่ถูก! เฉลย: "${res.correct_title}" (${res.correct_artist})`);
        }

        if (this.dom.scoreVal) this.dom.scoreVal.textContent = this.score.toLocaleString();
        this.updateStreakUI();

        await this.autoSaveSession();

        setTimeout(() => {
            this.loadQuestion(this.currentIndex + 1);
        }, 1900);
    }

    handleTimeUp() {
        if (this.isLocked) return;
        this.isLocked = true;
        Sound.playWrong();
        this.streak = 0;
        this.updateStreakUI();

        const q = this.questions[this.currentIndex];

        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.title === q.hints.artist) {
                btn.classList.add('correct');
            }
        });

        const correctObj = q.choices.find(c => c.artist === q.hints.artist) || q.choices[0];
        this.showFeedback(false, `⏰ หมดเวลา! ข้อนี้ตอบ "${correctObj?.title || ''}" (${q.hints.artist})`);

        this.autoSaveSession();

        setTimeout(() => {
            this.loadQuestion(this.currentIndex + 1);
        }, 1900);
    }

    showFeedback(isCorrect, message) {
        if (!this.dom.feedbackBanner || !this.dom.feedbackText) return;
        this.dom.feedbackBanner.className = `feedback-banner show ${isCorrect ? 'correct' : 'wrong'}`;
        this.dom.feedbackBanner.style.display = 'flex';
        this.dom.feedbackText.textContent = message;
    }

    updateStreakUI() {
        if (!this.dom.streakPill || !this.dom.streakVal) return;
        if (this.streak >= 2) {
            this.dom.streakVal.textContent = `🔥 x${this.streak} Combo!`;
            this.dom.streakPill.classList.add('visible');
        } else {
            this.dom.streakPill.classList.remove('visible');
        }
    }

    resetHints(hints) {
        this.currentHints = hints;
        const setupHint = (btn, text, defaultText) => {
            if (!btn) return;
            btn.innerHTML = defaultText;
            btn.className = 'hint-btn';
            btn.disabled = false;
        };

        setupHint(this.dom.hintArtistBtn, hints.artist, '👤 ใบ้ศิลปิน');
        setupHint(this.dom.hintYearBtn, hints.year, '📅 ใบ้ปี');
        setupHint(this.dom.hintFirstLetterBtn, hints.first_letter, '🔤 อักษรแรก');
        setupHint(this.dom.hintCustomBtn, hints.genre, '🎸 แนวเพลง');
    }

    useHint(type) {
        if (this.isLocked || !this.currentHints) return;
        this.usedHintThisRound = true;

        if (type === 'artist' && this.dom.hintArtistBtn) {
            this.dom.hintArtistBtn.innerHTML = `👤 ศิลปิน: <strong>${UI.escapeHtml(this.currentHints.artist)}</strong>`;
            this.dom.hintArtistBtn.classList.add('revealed');
        } else if (type === 'year' && this.dom.hintYearBtn) {
            this.dom.hintYearBtn.innerHTML = `📅 ปล่อยปี: <strong>${this.currentHints.year || 'ไม่ระบุ'}</strong>`;
            this.dom.hintYearBtn.classList.add('revealed');
        } else if (type === 'first_letter' && this.dom.hintFirstLetterBtn) {
            this.dom.hintFirstLetterBtn.innerHTML = `🔤 ขึ้นต้นด้วย: <strong>${this.currentHints.first_letter}</strong>`;
            this.dom.hintFirstLetterBtn.classList.add('revealed');
        } else if (type === 'genre' && this.dom.hintCustomBtn) {
            this.dom.hintCustomBtn.innerHTML = `🎸 แนว: <strong>${UI.escapeHtml(this.currentHints.genre || 'เพลงไทย')}</strong>`;
            this.dom.hintCustomBtn.classList.add('revealed');
        }
    }

    async endGame() {
        this.clearTimer();
        Sound.stopSnippet();
        this.isSessionActive = false;

        // Wipe session when game finishes normally
        localStorage.removeItem('thai_song_quiz_session');
        await API.resetSession();

        const accuracy = Math.round((this.correctCount / this.totalQuestions) * 100);
        let rank = { title: '', desc: '', trophy: '🎧' };

        if (accuracy >= 90) {
            rank = { title: 'หูทิพย์ระดับตำนาน (Rank S)', desc: 'คุณคือเซียนเพลงไทยตัวจริง จำได้แม่นทุกเมโลดี้!', trophy: '👑' };
        } else if (accuracy >= 70) {
            rank = { title: 'ยอดฝีมือเสียงเพลง (Rank A)', desc: 'ฟังเพลงไทยมาอย่างโชกโชน คะแนนยอดเยี่ยมมาก!', trophy: '🎸' };
        } else if (accuracy >= 50) {
            rank = { title: 'แฟนเพลงพันธุ์แท้ (Rank B)', desc: 'ทายถูกเกินครึ่ง มีสัญชาตญาณดนตรีที่ดี!', trophy: '🎵' };
        } else {
            rank = { title: 'ผู้ฟังฝึกหัด (Rank C)', desc: 'ฝึกฟังเพลงไทยบ่อยๆ รับรองรอบหน้าคะแนนพุ่งแน่นอน!', trophy: '📻' };
        }

        if (this.dom.resScore) this.dom.resScore.textContent = this.score.toLocaleString();
        if (this.dom.resCorrect) this.dom.resCorrect.textContent = `${this.correctCount}/${this.totalQuestions} (${accuracy}%)`;
        if (this.dom.resStreak) this.dom.resStreak.textContent = `🔥 ${this.highestStreak} ติดต่อกัน`;
        if (this.dom.resRankTitle) this.dom.resRankTitle.textContent = rank.title;
        if (this.dom.resRankDesc) this.dom.resRankDesc.textContent = rank.desc;
        if (this.dom.resTrophy) this.dom.resTrophy.textContent = rank.trophy;

        if (this.dom.btnSaveScore) {
            this.dom.btnSaveScore.textContent = 'บันทึกคะแนน';
            this.dom.btnSaveScore.disabled = false;
        }

        UI.showScreen('result');
        if (accuracy >= 50) setTimeout(() => UI.triggerConfetti(), 300);
    }

    async submitLeaderboardScore() {
        const nameInput = this.dom.inputPlayerName;
        if (!nameInput) return;
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.focus();
            return;
        }

        if (this.dom.btnSaveScore) {
            this.dom.btnSaveScore.textContent = 'กำลังบันทึก...';
            this.dom.btnSaveScore.disabled = true;
        }

        const categoryLabel = this.searchTerm
            ? `ศิลปิน: ${this.searchTerm}`
            : (this.selectedCategories.join('+') || 'all');

        const res = await API.submitScore(
            name,
            this.score,
            this.correctCount,
            this.totalQuestions,
            categoryLabel
        );

        if (res.success) {
            if (this.dom.btnSaveScore) this.dom.btnSaveScore.textContent = '✅ บันทึกแล้ว!';
            nameInput.disabled = true;
            setTimeout(() => {
                UI.renderLeaderboard(res.leaderboard);
                UI.openModal('modal-leaderboard');
            }, 600);
        } else {
            alert('ไม่สามารถบันทึกคะแนนได้: ' + (res.error || 'Unknown error'));
            if (this.dom.btnSaveScore) {
                this.dom.btnSaveScore.textContent = 'ลองอีกครั้ง';
                this.dom.btnSaveScore.disabled = false;
            }
        }
    }

    // =========================================================================
    // FEATURE 3: SONG & ALBUM EXPLORER MODAL (ENHANCED UI/UX)
    // =========================================================================
    async openExplorerModal() {
        UI.openModal('modal-explorer');

        if (!this.catalogData || this.catalogData.length === 0) {
            if (this.dom.explorerSongsList) {
                this.dom.explorerSongsList.innerHTML = `
                    <div style="text-align: center; color: var(--text-muted); padding: 40px 20px;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">⏳</div>
                        <div style="font-size: 0.95rem; font-weight: 600; color: #fff;">กำลังดึงคลังเพลงและอัลบั้มจาก iTunes API...</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">กรุณารอสักครู่ ระบบกำลังจัดกลุ่มตามแนวเพลง</div>
                    </div>
                `;
            }
            if (this.dom.explorerCountBadge) {
                this.dom.explorerCountBadge.textContent = 'กำลังโหลดรายการ...';
            }

            const res = await API.getExplorer();
            if (res.success && res.catalog) {
                this.catalogData = res.catalog;
                this.renderExplorerTabs();
                this.renderExplorerList();
            }
        } else {
            this.renderExplorerTabs();
            this.renderExplorerList(this.dom.explorerSearchInput ? this.dom.explorerSearchInput.value.trim() : '');
        }
    }

    renderExplorerTabs() {
        if (!this.dom.explorerTabsContainer || !this.catalogData) return;

        let totalAllCount = 0;
        this.catalogData.forEach(item => totalAllCount += (item.song_count || 0));

        let html = `
            <button type="button" class="explorer-tab-btn ${this.activeExplorerCategory === 'all' ? 'active' : ''}" onclick="Game.setExplorerCategory('all')">
                🌟 ทั้งหมด <span class="tab-count">${totalAllCount}</span>
            </button>
        `;

        this.catalogData.forEach(item => {
            const isActive = this.activeExplorerCategory === item.genre_id;
            html += `
                <button type="button" class="explorer-tab-btn ${isActive ? 'active' : ''}" onclick="Game.setExplorerCategory('${item.genre_id}')">
                    ${item.genre_icon} ${item.genre_name} <span class="tab-count">${item.song_count}</span>
                </button>
            `;
        });

        this.dom.explorerTabsContainer.innerHTML = html;
    }

    setExplorerCategory(cat) {
        this.activeExplorerCategory = cat;
        this.renderExplorerTabs();
        this.renderExplorerList(this.dom.explorerSearchInput ? this.dom.explorerSearchInput.value.trim() : '');
    }

    filterExplorerList(query) {
        this.renderExplorerList(query);
    }

    renderExplorerList(searchQuery = '') {
        if (!this.dom.explorerSongsList || !this.catalogData) return;

        let allSongs = [];
        let currentGenreLabel = 'ทั้งหมด';

        this.catalogData.forEach(cat => {
            if (this.activeExplorerCategory === 'all' || this.activeExplorerCategory === cat.genre_id) {
                if (this.activeExplorerCategory === cat.genre_id) {
                    currentGenreLabel = cat.genre_name;
                }
                allSongs = allSongs.concat(cat.songs);
            }
        });

        // Filter by search query (song title, artist, or album)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            allSongs = allSongs.filter(s =>
                (s.title && s.title.toLowerCase().includes(q)) ||
                (s.artist && s.artist.toLowerCase().includes(q)) ||
                (s.album && s.album.toLowerCase().includes(q))
            );
        }

        // Update count badge
        if (this.dom.explorerCountBadge) {
            if (searchQuery) {
                this.dom.explorerCountBadge.innerHTML = `พบ <strong>${allSongs.length}</strong> เพลง (ตรงกับ "${UI.escapeHtml(searchQuery)}")`;
            } else if (this.activeExplorerCategory !== 'all') {
                this.dom.explorerCountBadge.innerHTML = `หมวด <strong>${currentGenreLabel}</strong>: พบ ${allSongs.length} เพลง`;
            } else {
                this.dom.explorerCountBadge.innerHTML = `รวมทั้งหมด <strong>${allSongs.length}</strong> เพลง`;
            }
        }

        // Empty state
        if (allSongs.length === 0) {
            this.dom.explorerSongsList.innerHTML = `
                <div class="explorer-empty-state">
                    <div class="explorer-empty-icon">🔎</div>
                    <div class="explorer-empty-title">ไม่พบเพลงที่ตรงกับการค้นหา</div>
                    <div class="explorer-empty-desc">ลองตรวจสอบคำสะกด หรือคลิกเลือกหมวดหมู่แนวเพลงอื่น</div>
                </div>
            `;
            return;
        }

        this.dom.explorerSongsList.innerHTML = allSongs.map((s, idx) => {
            const isPlayingThis = (this.currentPreviewTrackId === s.track_id && this.currentPreviewAudio && !this.currentPreviewAudio.paused);
            const genreBadgeClass = `genre-badge-${s.genre_id || 'default'}`;

            return `
                <div class="explorer-song-card ${isPlayingThis ? 'playing' : ''}" id="explorer-card-${s.track_id}">
                    <div class="explorer-artwork-wrapper">
                        <img src="${s.artwork || 'assets/css/placeholder.png'}" 
                             class="explorer-artwork" 
                             alt="Cover" 
                             onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'50\\' height=\\'50\\'><rect fill=\\'%231e293b\\' width=\\'50\\' height=\\'50\\'/><text fill=\\'%23818cf8\\' font-size=\\'20\\' x=\\'15\\' y=\\'32\\'>🎵</text></svg>'">
                    </div>
                    <div class="explorer-meta">
                        <div class="explorer-title-row">
                            <span class="explorer-title" title="${UI.escapeHtml(s.title)}">${UI.escapeHtml(s.title)}</span>
                            <span class="song-genre-badge ${genreBadgeClass}">${s.genre_icon || '🎵'} ${UI.escapeHtml(s.genre_name || 'เพลงไทย')}</span>
                        </div>
                        <div class="explorer-artist-album">
                            <span class="explorer-artist">👤 ${UI.escapeHtml(s.artist)}</span>
                            <span class="explorer-album">💿 ${UI.escapeHtml(s.album || 'Single')}</span>
                            ${s.year ? `<span class="explorer-year-pill">${s.year}</span>` : ''}
                        </div>
                    </div>
                    <button type="button" 
                            class="explorer-play-btn ${isPlayingThis ? 'playing' : ''}" 
                            id="explorer-btn-${s.track_id}" 
                            onclick="Game.toggleExplorerPreview('${s.preview_url}', ${s.track_id}, '${UI.escapeHtml(s.title).replace(/'/g, "\\'")}', '${UI.escapeHtml(s.artist).replace(/'/g, "\\'")}')" 
                            title="${isPlayingThis ? 'หยุดเสียงพรีวิว' : 'ฟังตัวอย่าง 30 วินาที'}">
                        ${isPlayingThis ? '⏸️' : '▶️'}
                    </button>
                </div>
            `;
        }).join('');
    }

    toggleExplorerPreview(previewUrl, trackId, title = '', artist = '') {
        // Toggle pause if already playing the same track
        if (this.currentPreviewAudio && !this.currentPreviewAudio.paused && this.currentPreviewTrackId === trackId) {
            this.stopExplorerPreview();
            return;
        }

        this.stopExplorerPreview();

        this.currentPreviewAudio = new Audio(previewUrl);
        this.currentPreviewTrackId = trackId;

        const btn = document.getElementById(`explorer-btn-${trackId}`);
        const card = document.getElementById(`explorer-card-${trackId}`);

        this.currentPreviewAudio.play().then(() => {
            if (btn) {
                btn.innerHTML = '⏸️';
                btn.classList.add('playing');
                btn.title = 'หยุดเสียงพรีวิว';
            }
            if (card) {
                card.classList.add('playing');
            }

            // Update status bar
            if (this.dom.explorerAudioNowPlaying && this.dom.explorerNowPlayingTitle) {
                this.dom.explorerNowPlayingTitle.textContent = `${title} • ${artist}`;
                this.dom.explorerAudioNowPlaying.style.display = 'inline-flex';
            }
        }).catch(err => {
            console.log('Preview playback failed', err);
            this.stopExplorerPreview();
        });

        this.currentPreviewAudio.addEventListener('ended', () => {
            this.stopExplorerPreview();
        });
    }

    stopExplorerPreview() {
        if (this.currentPreviewAudio) {
            this.currentPreviewAudio.pause();
            this.currentPreviewAudio = null;
        }

        if (this.currentPreviewTrackId) {
            const btn = document.getElementById(`explorer-btn-${this.currentPreviewTrackId}`);
            const card = document.getElementById(`explorer-card-${this.currentPreviewTrackId}`);
            if (btn) {
                btn.innerHTML = '▶️';
                btn.classList.remove('playing');
                btn.title = 'ฟังตัวอย่าง 30 วินาที';
            }
            if (card) {
                card.classList.remove('playing');
            }
            this.currentPreviewTrackId = null;
        }

        document.querySelectorAll('.explorer-play-btn').forEach(b => {
            b.innerHTML = '▶️';
            b.classList.remove('playing');
        });
        document.querySelectorAll('.explorer-song-card').forEach(c => {
            c.classList.remove('playing');
        });

        if (this.dom.explorerAudioNowPlaying) {
            this.dom.explorerAudioNowPlaying.style.display = 'none';
        }
    }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
    Sound.init();
    UI.init();
    window.Game = new GameEngine();
    window.Game.init();
});
