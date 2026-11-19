/**
 * Thai Song Guessing Game - UI, Animations & Modals
 */
const UI = {
    screens: {
        start: null,
        game: null,
        result: null
    },

    modals: {
        leaderboard: null,
        help: null
    },

    init() {
        this.screens.start = document.getElementById('screen-start');
        this.screens.game = document.getElementById('screen-game');
        this.screens.result = document.getElementById('screen-result');

        this.modals.leaderboard = document.getElementById('modal-leaderboard');
        this.modals.help = document.getElementById('modal-help');

        // Setup modal close buttons
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) this.closeModal(modal.id);
            });
        });

        // Close on background click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    },

    showScreen(screenName) {
        Object.keys(this.screens).forEach(name => {
            const el = this.screens[name];
            if (el) {
                if (name === screenName) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            if (modalId === 'modal-explorer' && window.Game && window.Game.stopExplorerPreview) {
                window.Game.stopExplorerPreview();
            }
        }
    },

    /**
     * Show floating score popup (+180 pts)
     */
    showFloatingPoints(points, targetEl) {
        const badge = document.createElement('div');
        badge.className = 'floating-points';
        badge.textContent = `+${points} pts`;

        const container = targetEl || document.querySelector('.player-stage') || document.body;
        container.appendChild(badge);

        setTimeout(() => {
            if (badge.parentNode) badge.parentNode.removeChild(badge);
        }, 1200);
    },

    /**
     * Render Leaderboard inside modal
     */
    renderLeaderboard(records) {
        const listEl = document.getElementById('leaderboard-list');
        if (!listEl) return;

        if (!records || records.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 24px 0;">
                    ยังไม่มีสถิติในหมวดนี้ เป็นคนแรกที่พิชิตคะแนนกันเลย!
                </div>
            `;
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];

        listEl.innerHTML = records.map((r, i) => {
            const rankLabel = i < 3 ? medals[i] : `#${i + 1}`;
            const dateStr = r.played_at ? new Date(r.played_at).toLocaleDateString('th-TH') : '';
            return `
                <li class="leaderboard-item">
                    <div class="leaderboard-rank">${rankLabel}</div>
                    <div class="leaderboard-player">
                        <div class="leaderboard-name">${this.escapeHtml(r.player_name)}</div>
                        <div class="leaderboard-meta">ถูก ${r.correct_count}/${r.total_questions} ข้อ • ${dateStr}</div>
                    </div>
                    <div class="leaderboard-score">${Number(r.score).toLocaleString()}</div>
                </li>
            `;
        }).join('');
    },

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    /**
     * Confetti cannon explosion for high score / game finished
     */
    triggerConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ffffff'];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                r: Math.random() * 6 + 4,
                d: Math.random() * 80,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
                tiltAngle: 0,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.8) * 18,
                gravity: 0.35,
                opacity: 1
            });
        }

        let animationFrame;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.tiltAngle += p.tiltAngleIncremental;
                p.tilt = Math.sin(p.tiltAngle) * 12;

                if (p.y < canvas.height) active = true;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + (p.r / 2), p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 2));
                ctx.stroke();
            });

            if (active) {
                animationFrame = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cancelAnimationFrame(animationFrame);
            }
        };

        render();
    }
};

window.UI = UI;
