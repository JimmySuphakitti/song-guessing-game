/**
 * Thai Song Guessing Game - Audio & Sound Effects Manager
 */
class SoundManager {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
        this.audioContext = null;
        this.sfxEnabled = true;

        // Preload SFX
        this.sfx = {
            correct: new Audio('assets/audio/sfx/correct.wav'),
            wrong: new Audio('assets/audio/sfx/wrong.wav'),
            tick: new Audio('assets/audio/sfx/tick.wav')
        };

        // Cache DOM elements for player UI
        this.vinylEl = null;
        this.waveEl = null;
        this.statusTextEl = null;
        this.audioCtrlBtn = null;
    }

    init() {
        this.vinylEl = document.getElementById('vinyl-disc');
        this.waveEl = document.getElementById('sound-waves');
        this.statusTextEl = document.getElementById('player-status-text');
        this.audioCtrlBtn = document.getElementById('audio-ctrl-btn');

        if (this.audioCtrlBtn) {
            this.audioCtrlBtn.addEventListener('click', () => {
                this.togglePlayCurrent();
            });
        }

        if (this.vinylEl) {
            this.vinylEl.addEventListener('click', () => {
                this.togglePlayCurrent();
            });
        }
    }

    getAudioContext() {
        if (!this.audioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.audioContext = new AudioCtx();
            }
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    /**
     * Play song snippet URL
     */
    playSnippet(audioUrl) {
        this.stopSnippet();

        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.preload = 'auto';

        this.currentAudio.addEventListener('playing', () => {
            this.setVisualPlaying(true);
            if (this.statusTextEl) this.statusTextEl.textContent = '🎵 กำลังเล่นท่อนฮุค...';
            if (this.audioCtrlBtn) this.audioCtrlBtn.innerHTML = '⏸️ พักเสียง';
        });

        this.currentAudio.addEventListener('pause', () => {
            this.setVisualPlaying(false);
            if (this.statusTextEl) this.statusTextEl.textContent = 'กดเล่นเพื่อฟังอีกรอบ';
            if (this.audioCtrlBtn) this.audioCtrlBtn.innerHTML = '▶️ ฟังเสียงเพลง';
        });

        this.currentAudio.addEventListener('ended', () => {
            this.setVisualPlaying(false);
            if (this.statusTextEl) this.statusTextEl.textContent = 'จบตัวอย่างเพลงแล้ว (กดฟังซ้ำได้)';
            if (this.audioCtrlBtn) this.audioCtrlBtn.innerHTML = '🔄 ฟังซ้ำอีกครั้ง';
        });

        this.currentAudio.addEventListener('error', (e) => {
            console.warn('Audio snippet failed to play, using synthetic preview fallback', e);
            this.fallbackSynthPreview();
        });

        // Trigger play
        const playPromise = this.currentAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log('Autoplay restriction, user interaction required:', err);
                if (this.statusTextEl) this.statusTextEl.textContent = '👉 กดปุ่มเพื่อฟังเสียงเพลง';
                if (this.audioCtrlBtn) this.audioCtrlBtn.innerHTML = '▶️ ฟังเสียงเพลง';
                this.setVisualPlaying(false);
            });
        }
    }

    togglePlayCurrent() {
        if (!this.currentAudio) return;

        if (this.currentAudio.paused) {
            this.currentAudio.currentTime = 0;
            this.currentAudio.play().catch(e => console.log(e));
        } else {
            this.currentAudio.pause();
        }
    }

    stopSnippet() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        this.setVisualPlaying(false);
        if (this.audioCtrlBtn) this.audioCtrlBtn.innerHTML = '▶️ ฟังเสียงเพลง';
    }

    setVisualPlaying(playing) {
        this.isPlaying = playing;
        if (this.vinylEl) {
            if (playing) {
                this.vinylEl.classList.add('spinning');
            } else {
                this.vinylEl.classList.remove('spinning');
            }
        }
        if (this.waveEl) {
            if (playing) {
                this.waveEl.classList.add('playing');
            } else {
                this.waveEl.classList.remove('playing');
            }
        }
    }

    /**
     * SFX Methods
     */
    playCorrect() {
        if (!this.sfxEnabled) return;
        try {
            this.sfx.correct.currentTime = 0;
            this.sfx.correct.play().catch(() => {});
        } catch (e) {}
    }

    playWrong() {
        if (!this.sfxEnabled) return;
        try {
            this.sfx.wrong.currentTime = 0;
            this.sfx.wrong.play().catch(() => {});
        } catch (e) {}
    }

    playTick() {
        if (!this.sfxEnabled) return;
        try {
            this.sfx.tick.currentTime = 0;
            this.sfx.tick.play().catch(() => {});
        } catch (e) {}
    }

    /**
     * Web Audio API Synthesizer fallback if file is blocked or missing
     */
    fallbackSynthPreview() {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        this.setVisualPlaying(true);
        if (this.statusTextEl) this.statusTextEl.textContent = '🎵 กำลังเล่นเมโลดี้จำลอง...';

        const freqs = [392, 440, 523, 440, 392, 329];
        let time = ctx.currentTime + 0.1;

        freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, time);

            gain.gain.setValueAtTime(0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + 0.4);
            time += 0.35;
        });

        setTimeout(() => {
            this.setVisualPlaying(false);
            if (this.statusTextEl) this.statusTextEl.textContent = 'จบเมโลดี้แล้ว';
        }, (freqs.length * 350) + 200);
    }
}

window.Sound = new SoundManager();
