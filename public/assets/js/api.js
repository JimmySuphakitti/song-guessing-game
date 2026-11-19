/**
 * Thai Song Guessing Game - API Client Module (iTunes API & Session Auto-Save)
 */
const API = {
    /**
     * Fetch questions with Multi-Select Genre & Anti-Repetition tracking
     */
    async getQuestions(categories = ['all'], count = 10, term = '', playedTracks = [], artistCounts = {}) {
        try {
            const catParam = Array.isArray(categories) ? categories.join(',') : categories;
            let url = `api/songs.php?action=get_questions&categories=${encodeURIComponent(catParam)}&count=${count}`;

            if (term && term.trim()) {
                url += `&term=${encodeURIComponent(term.trim())}`;
            }

            if (playedTracks && playedTracks.length > 0) {
                url += `&played_tracks=${encodeURIComponent(playedTracks.join(','))}`;
            }

            if (artistCounts && Object.keys(artistCounts).length > 0) {
                url += `&artist_counts=${encodeURIComponent(JSON.stringify(artistCounts))}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error('API.getQuestions error:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Fetch Song & Album Explorer Catalog
     */
    async getExplorer(category = '') {
        try {
            let url = 'api/songs.php?action=explorer';
            if (category) {
                url += `&category=${encodeURIComponent(category)}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error('API.getExplorer error:', err);
            return { success: false, catalog: [] };
        }
    },

    /**
     * Check submitted answer on backend using question token
     */
    async checkAnswer(token, answer, timeLeft = 0, streak = 0, usedHint = false) {
        try {
            const res = await fetch('api/check.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    answer: answer,
                    time_left: timeLeft,
                    streak: streak,
                    used_hint: usedHint
                })
            });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error('API.checkAnswer error:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Session Management: Get active session from server
     */
    async getSession() {
        try {
            const res = await fetch('api/session.php');
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            return { success: false, has_session: false };
        }
    },

    /**
     * Session Management: Auto-save game state
     */
    async saveSession(sessionData) {
        try {
            const res = await fetch('api/session.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData)
            });
            return await res.json();
        } catch (err) {
            // Silently fail on network background sync
            return { success: false };
        }
    },

    /**
     * Session Management: Reset / Clear active session
     */
    async resetSession() {
        try {
            const res = await fetch('api/session.php?action=reset', { method: 'POST' });
            return await res.json();
        } catch (err) {
            return { success: false };
        }
    },

    /**
     * Fetch top leaderboard scores
     */
    async getLeaderboard(category = 'all', limit = 10) {
        try {
            const res = await fetch(`api/leaderboard.php?category=${encodeURIComponent(category)}&limit=${limit}`);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error('API.getLeaderboard error:', err);
            return { success: false, error: err.message, leaderboard: [] };
        }
    },

    /**
     * Submit new score to leaderboard
     */
    async submitScore(playerName, score, correctCount, totalQuestions, category = 'all') {
        try {
            const res = await fetch('api/leaderboard.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_name: playerName,
                    score: score,
                    correct_count: correctCount,
                    total_questions: totalQuestions,
                    category: category
                })
            });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error('API.submitScore error:', err);
            return { success: false, error: err.message };
        }
    }
};

window.API = API;
