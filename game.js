/* ==========================================================================
   MOON FESTIVAL MOONCAKE EATING GAME - GAME ENGINE
   ========================================================================== */

// 1. Vocabulary Definition (from Vocabulary_transparent directory)
const VOCABULARY = [
  { id: 'barbecue', name: 'Barbecue', file: 'barbecue.png' },
  { id: 'jaderabbit', name: 'Jade Rabbit', file: 'Jade Rabbit.png' },
  { id: 'help', name: 'Help', file: 'help.png' },
  { id: 'hurt', name: 'Hurt', file: 'hurt.png' },
  { id: 'kind', name: 'Kind', file: 'kind.png' },
  { id: 'mooncake', name: 'Mooncake', file: 'mooncake.png' },
  { id: 'moonfestival', name: 'Moon Festival', file: 'moon festival.png' },
  { id: 'moon', name: 'Moon', file: 'moon.png' },
  { id: 'pomelo', name: 'Pomelo', file: 'pomelo.png' },
  { id: 'share', name: 'Share', file: 'share.png' }
];

// 2. Web Audio Sound Synthesizer
class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
  }

  initCtx() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playBite() {
    if (!this.enabled) return;
    this.initCtx();

    const now = this.audioCtx.currentTime;
    // Bite crunch noise + downward pitch drop
    const bufferSize = this.audioCtx.sampleRate * 0.15;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    filter.Q.value = 3;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    whiteNoise.start(now);
  }

  playFound() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.initCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.audioCtx.currentTime + idx * 0.08;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  playError() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

const sounds = new SoundManager();

// 3. Confetti Cannon
class ConfettiCannon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst() {
    const colors = ['#ffd700', '#ff4757', '#1e90ff', '#2ed573', '#ffa502'];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 16,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.animating) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.rSpeed;
      p.opacity -= 0.012;

      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// 4. Main Game Engine
class Game {
  constructor() {
    this.gridCols = 5;
    this.gridRows = 4;
    this.scaleMode = 'micro';
    this.revealDelaySeconds = 2;

    this.score = 0;
    this.flips = 0;
    this.streak = 1;

    this.currentMode = 'quiz'; // 'quiz' or 'versus'
    this.activePlayer = 1;
    this.p1Score = 0;
    this.p2Score = 0;

    this.currentWord = null;
    this.revealedBlocks = new Set();
    this.targetPos = { x: 0, y: 0, width: 0, height: 0 };

    this.initDOM();
    this.initEvents();
    this.confetti = new ConfettiCannon(this.confettiCanvas);

    this.startNewRound();
  }

  initDOM() {
    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.boardWrapper = document.getElementById('board-wrapper');
    this.blocksGrid = document.getElementById('blocks-grid');
    this.targetImg = document.getElementById('target-img');

    this.scoreEl = document.getElementById('stat-score');
    this.flipsEl = document.getElementById('stat-flips');
    this.streakEl = document.getElementById('stat-streak');

    this.versusHud = document.getElementById('versus-hud');
    this.p1Card = document.getElementById('p1-card');
    this.p2Card = document.getElementById('p2-card');
    this.p1ScoreEl = document.getElementById('p1-score');
    this.p2ScoreEl = document.getElementById('p2-score');
    this.turnTextEl = document.getElementById('turn-text');

    this.btnOpenGuess = document.getElementById('btn-open-guess');
    this.guessModal = document.getElementById('guess-modal');
    this.guessModalTitle = document.getElementById('guess-modal-title');
    this.choicesGrid = document.getElementById('choices-grid');
    this.btnCloseGuess = document.getElementById('btn-close-guess');

    this.victoryModal = document.getElementById('victory-modal');
    this.btnNextRound = document.getElementById('btn-next-round');
    this.btnSound = document.getElementById('btn-sound');
  }

  initEvents() {
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentMode = tab.dataset.mode;
        this.resetGameScores();
        this.startNewRound();
      });
    });

    this.btnOpenGuess.addEventListener('click', () => {
      sounds.initCtx();
      this.renderChoices();
      this.guessModal.classList.add('active');
    });

    this.btnCloseGuess.addEventListener('click', () => {
      this.guessModal.classList.remove('active');
    });

    this.btnNextRound.addEventListener('click', () => {
      this.victoryModal.classList.remove('active');
      this.startNewRound();
    });

    this.btnSound.addEventListener('click', () => {
      sounds.enabled = !sounds.enabled;
      this.btnSound.textContent = sounds.enabled ? '🔊' : '🔇';
    });

    window.addEventListener('resize', () => {
      this.updateMooncakeSlices();
      this.positionTargetItem();
    });
  }

  resetGameScores() {
    this.score = 0;
    this.flips = 0;
    this.streak = 1;
    this.p1Score = 0;
    this.p2Score = 0;
    this.activePlayer = 1;
    this.updateHUD();
  }

  getNextWord() {
    if (!this.vocabDeck || this.vocabDeck.length === 0) {
      // Shuffle all 11 words into a fresh deck queue
      this.vocabDeck = [...VOCABULARY].sort(() => Math.random() - 0.5);
      
      // Avoid immediate repeat when deck resets
      if (this.currentWord && this.vocabDeck[this.vocabDeck.length - 1].id === this.currentWord.id && this.vocabDeck.length > 1) {
        const last = this.vocabDeck.pop();
        this.vocabDeck.unshift(last);
      }
    }
    return this.vocabDeck.pop();
  }

  startNewRound() {
    this.revealedBlocks.clear();
    this.flips = 0;

    if (this.currentMode === 'versus') {
      this.versusHud.style.display = 'flex';
      this.updateVersusHud();
    } else {
      this.versusHud.style.display = 'none';
    }

    this.updateHUD();

    // Pick next word from deck rotation queue (plays all 11 words before repeating)
    this.currentWord = this.getNextWord();

    // Pre-generate choice options once per round to prevent flashing / re-shuffling bug
    const wrongOptions = VOCABULARY.filter(v => v.id !== this.currentWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    this.currentChoices = [this.currentWord, ...wrongOptions].sort(() => Math.random() - 0.5);

    // Load image with transparent background removal
    this.loadTargetImage(this.currentWord);

    // Build Mooncake grid sliced overlay
    this.renderMooncakeGrid();
  }

  loadTargetImage(wordObj) {
    const transparentUrl = `./Vocabulary_transparent/${wordObj.file}`;
    
    // Set target image source directly to pre-processed transparent PNG
    this.targetImg.src = transparentUrl;
    setTimeout(() => this.positionTargetItem(), 50);

    // Also run dynamic canvas pass as extra enhancement if supported
    const tempImg = new Image();
    tempImg.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = tempImg.width;
        const h = tempImg.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(tempImg, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 185 && data[i + 1] > 185 && data[i + 2] > 185) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        this.targetImg.src = canvas.toDataURL('image/png');
      } catch (e) {
        // Tainted canvas on local file protocol falls back cleanly to transparentUrl
      }
    };
    tempImg.src = transparentUrl;
  }

  positionTargetItem() {
    const boardW = this.boardWrapper.clientWidth;
    const boardH = this.boardWrapper.clientHeight;

    const cellW = boardW / this.gridCols;
    const cellH = boardH / this.gridRows;

    let targetW, targetH;
    if (this.scaleMode === 'micro') {
      targetW = cellW * 0.55;
      targetH = cellH * 0.55;
    } else if (this.scaleMode === 'tiny') {
      targetW = cellW * 0.85;
      targetH = cellH * 0.85;
    } else {
      targetW = cellW * 1.2;
      targetH = cellH * 1.2;
    }

    // Safety margin to prevent target from ever peeking out at outer borders
    const marginX = cellW * 0.35;
    const marginY = cellH * 0.35;
    const minLeft = marginX;
    const maxLeft = Math.max(minLeft, boardW - targetW - marginX);
    const minTop = marginY;
    const maxTop = Math.max(minTop, boardH - targetH - marginY);

    const left = minLeft + Math.random() * (maxLeft - minLeft);
    const top = minTop + Math.random() * (maxTop - minTop);

    this.targetPos = { x: left, y: top, width: targetW, height: targetH };

    this.targetImg.style.width = `${targetW}px`;
    this.targetImg.style.height = `${targetH}px`;
    this.targetImg.style.left = `${left}px`;
    this.targetImg.style.top = `${top}px`;
    this.targetImg.style.zIndex = '2';
  }

  renderMooncakeGrid() {
    this.blocksGrid.style.gridTemplateColumns = `repeat(${this.gridCols}, 1fr)`;
    this.blocksGrid.style.gridTemplateRows = `repeat(${this.gridRows}, 1fr)`;
    this.blocksGrid.innerHTML = '';

    const totalBlocks = this.gridCols * this.gridRows;

    for (let i = 0; i < totalBlocks; i++) {
      const tile = document.createElement('div');
      tile.className = 'block-tile';
      tile.dataset.index = i;

      const numBadge = document.createElement('div');
      numBadge.className = 'block-number';
      numBadge.textContent = i + 1;
      tile.appendChild(numBadge);

      tile.addEventListener('click', () => this.handleBlockBite(i, tile));
      this.blocksGrid.appendChild(tile);
    }

    this.updateMooncakeSlices();
  }

  updateMooncakeSlices() {
    const boardW = this.boardWrapper.clientWidth || 600;
    const boardH = this.boardWrapper.clientHeight || 450;
    
    // Enlarge 長方月餅_去背.png beyond bounds so it covers all 20 tiles completely (with slight overflow)
    const scale = 1.15;
    const bgW = boardW * scale;
    const bgH = boardH * scale;
    const offsetX = (boardW - bgW) / 2;
    const offsetY = (boardH - bgH) / 2;

    const cellW = boardW / this.gridCols;
    const cellH = boardH / this.gridRows;

    const tiles = this.blocksGrid.querySelectorAll('.block-tile');
    tiles.forEach((tile, index) => {
      const col = index % this.gridCols;
      const row = Math.floor(index / this.gridCols);

      const posX = offsetX - (col * cellW);
      const posY = offsetY - (row * cellH);

      tile.style.backgroundImage = "url('./長方月餅_去背.png')";
      tile.style.backgroundSize = `${bgW}px ${bgH}px`;
      tile.style.backgroundPosition = `${posX}px ${posY}px`;
    });
  }

  handleBlockBite(index, blockEl) {
    if (this.revealedBlocks.has(index)) return;

    this.revealedBlocks.add(index);
    this.flips++;
    this.updateHUD();

    blockEl.classList.add('bitten');
    sounds.playBite();

    const cellW = this.boardWrapper.clientWidth / this.gridCols;
    const cellH = this.boardWrapper.clientHeight / this.gridRows;

    const col = index % this.gridCols;
    const row = Math.floor(index / this.gridCols);

    const blockLeft = col * cellW;
    const blockTop = row * cellH;
    const blockRight = blockLeft + cellW;
    const blockBottom = blockTop + cellH;

    const intersects = !(
      blockRight < this.targetPos.x ||
      blockLeft > this.targetPos.x + this.targetPos.width ||
      blockBottom < this.targetPos.y ||
      blockTop > this.targetPos.y + this.targetPos.height
    );

    const toastCenterX = blockLeft + cellW / 2;
    const toastCenterY = blockTop + cellH / 2;
    this.spawnCellToast(toastCenterX, toastCenterY, intersects);

    if (intersects) {
      sounds.playFound();
      // No automatic guess modal popup - players click 'Make a Guess' when ready!
    } else {
      // Empty block bite
      if (this.currentMode === 'versus') {
        this.activePlayer = (this.activePlayer === 1) ? 2 : 1;
        this.updateVersusHud();
      }
    }
  }

  spawnCellToast(x, y, isFound) {
    const toast = document.createElement('div');
    toast.className = `cell-toast ${isFound ? 'found' : 'empty'}`;
    toast.style.left = `${x}px`;
    toast.style.top = `${y}px`;
    toast.textContent = isFound ? 'Chomp! 🥮' : 'Empty! 💨';

    this.boardWrapper.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 900);
  }

  renderChoices() {
    this.choicesGrid.innerHTML = '';
    
    if (this.guessModalTitle) {
      if (this.currentMode === 'versus') {
        const pName = this.activePlayer === 1 ? "Player 1 (Red)" : "Player 2 (Blue)";
        this.guessModalTitle.textContent = `${pName}'s Turn to Guess!`;
      } else {
        this.guessModalTitle.textContent = "Select the Correct Word";
      }
    }

    const choices = this.currentChoices || [this.currentWord];

    choices.forEach(wordObj => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span style="font-size: 1.1rem; font-weight: 800;">${wordObj.name}</span>`;

      btn.addEventListener('click', () => this.handleGuess(wordObj, btn));
      this.choicesGrid.appendChild(btn);
    });
  }

  handleGuess(selectedWord, btnEl) {
    if (selectedWord.id === this.currentWord.id) {
      // Correct!
      btnEl.classList.add('correct');
      sounds.playSuccess();
      this.confetti.burst();
      this.guessModal.classList.remove('active');

      const maxPossibleScore = 1000;
      const penaltyPerFlip = 35;
      const roundPoints = Math.max(150, maxPossibleScore - (this.flips * penaltyPerFlip)) * this.streak;

      const winningPlayer = this.activePlayer;

      if (this.currentMode === 'quiz') {
        this.score += roundPoints;
        this.streak++;
      } else if (this.currentMode === 'versus') {
        if (this.activePlayer === 1) this.p1Score += roundPoints;
        else this.p2Score += roundPoints;
        this.updateVersusHud();
      }

      this.updateHUD();
      this.revealAllBlocks();
      this.centerTargetImage();

      setTimeout(() => {
        this.showVictoryModal(roundPoints, winningPlayer);
      }, 500);

    } else {
      // Wrong!
      btnEl.classList.add('wrong');
      btnEl.disabled = true;
      sounds.playError();

      if (this.currentMode === 'quiz') {
        this.score = Math.max(0, this.score - 100);
        this.streak = 1;
      } else if (this.currentMode === 'versus') {
        if (this.activePlayer === 1) this.p1Score = Math.max(0, this.p1Score - 100);
        else this.p2Score = Math.max(0, this.p2Score - 100);

        // STEAL MECHANIC
        this.activePlayer = (this.activePlayer === 1) ? 2 : 1;
        this.updateVersusHud();

        if (this.guessModalTitle) {
          const oppName = this.activePlayer === 1 ? "Player 1 (Red)" : "Player 2 (Blue)";
          this.guessModalTitle.textContent = `⚡ Steal Opportunity! ${oppName}'s Turn!`;
        }
      }

      this.updateHUD();
    }
  }

  revealAllBlocks() {
    document.querySelectorAll('.block-tile').forEach(b => {
      b.classList.add('revealed');
    });
  }

  centerTargetImage() {
    const boardW = this.boardWrapper.clientWidth;
    const boardH = this.boardWrapper.clientHeight;
    
    const targetW = boardW * 0.55;
    const targetH = boardH * 0.55;

    this.targetImg.style.width = `${targetW}px`;
    this.targetImg.style.height = `${targetH}px`;
    this.targetImg.style.left = `${(boardW - targetW) / 2}px`;
    this.targetImg.style.top = `${(boardH - targetH) / 2}px`;
    this.targetImg.style.zIndex = '20';
  }

  showVictoryModal(pointsGained, winningPlayer) {
    document.getElementById('victory-icon').textContent = '🥮';

    if (this.currentMode === 'versus') {
      const winnerName = winningPlayer === 1 ? 'Player 1 (Red)' : 'Player 2 (Blue)';
      document.getElementById('victory-title').textContent = `${winnerName} Wins!`;
      document.getElementById('victory-word-name').textContent = `${this.currentWord.name}`;
    } else {
      document.getElementById('victory-title').textContent = 'Delicious! Correct!';
      document.getElementById('victory-word-name').textContent = this.currentWord.name;
    }

    document.getElementById('victory-points').textContent = `+${pointsGained}`;
    document.getElementById('victory-flips').textContent = `${this.flips} Bites`;
    
    this.victoryModal.classList.add('active');
  }

  updateHUD() {
    this.scoreEl.textContent = this.score;
    this.flipsEl.textContent = this.flips;
    this.streakEl.textContent = `x${this.streak}`;
  }

  updateVersusHud() {
    this.p1ScoreEl.textContent = this.p1Score;
    this.p2ScoreEl.textContent = this.p2Score;

    if (this.activePlayer === 1) {
      this.p1Card.classList.add('active');
      this.p2Card.classList.remove('active');
      this.turnTextEl.textContent = "Player 1's Turn to Bite!";
    } else {
      this.p2Card.classList.add('active');
      this.p1Card.classList.remove('active');
      this.turnTextEl.textContent = "Player 2's Turn to Bite!";
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new Game();
});
