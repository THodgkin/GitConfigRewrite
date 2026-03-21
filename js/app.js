// === Word Buddy - Learning App for Kids ===

const App = {
  // State
  mode: null,          // 'spell' or 'read'
  words: [],           // current word list
  currentIndex: 0,
  score: 0,
  categoryName: '',
  categories: [],

  // DOM refs (set in init)
  els: {},

  // Speech
  synth: window.speechSynthesis,
  recognition: null,
  speechSupported: !!window.speechSynthesis,
  recognitionSupported: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,

  // === INITIALIZATION ===

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadCategories();
    this.initSpeechRecognition();
    this.showScreen('home');
  },

  cacheElements() {
    this.els = {
      screens: document.querySelectorAll('.screen'),
      // Home
      spellModeBtn: document.getElementById('spell-mode-btn'),
      readModeBtn: document.getElementById('read-mode-btn'),
      noSpeechWarning: document.getElementById('no-speech-warning'),
      // Categories
      categoryGrid: document.getElementById('category-grid'),
      categoryTitle: document.getElementById('category-title'),
      // Game
      gameTitle: document.getElementById('game-title'),
      wordDisplay: document.getElementById('word-display'),
      hintText: document.getElementById('hint-text'),
      spellArea: document.getElementById('spell-area'),
      readArea: document.getElementById('read-area'),
      spellInput: document.getElementById('spell-input'),
      speakBtn: document.getElementById('speak-btn'),
      checkBtn: document.getElementById('check-btn'),
      micBtn: document.getElementById('mic-btn'),
      heardText: document.getElementById('heard-text'),
      hintBtn: document.getElementById('hint-btn'),
      progressInfo: document.getElementById('progress-info'),
      scoreDisplay: document.getElementById('score-display'),
      progressFill: document.getElementById('progress-fill'),
      backBtn: document.getElementById('back-btn'),
      // Feedback
      feedback: document.getElementById('feedback'),
      feedbackEmoji: document.getElementById('feedback-emoji'),
      feedbackText: document.getElementById('feedback-text'),
      feedbackBtn: document.getElementById('feedback-btn'),
      // Results
      resultsEmoji: document.getElementById('results-emoji'),
      resultsTitle: document.getElementById('results-title'),
      resultsScore: document.getElementById('results-score'),
      resultsStars: document.getElementById('results-stars'),
      replayBtn: document.getElementById('replay-btn'),
      homeBtn: document.getElementById('home-btn'),
    };
  },

  bindEvents() {
    this.els.spellModeBtn.addEventListener('click', () => this.selectMode('spell'));
    this.els.readModeBtn.addEventListener('click', () => this.selectMode('read'));
    this.els.speakBtn.addEventListener('click', () => this.speakCurrentWord());
    this.els.checkBtn.addEventListener('click', () => this.checkSpelling());
    this.els.micBtn.addEventListener('click', () => this.startListening());
    this.els.hintBtn.addEventListener('click', () => this.showHint());
    this.els.backBtn.addEventListener('click', () => this.goHome());
    this.els.replayBtn.addEventListener('click', () => this.replay());
    this.els.homeBtn.addEventListener('click', () => this.goHome());
    this.els.feedbackBtn.addEventListener('click', () => this.nextWord());

    // Allow Enter key to check spelling
    this.els.spellInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.checkSpelling();
    });
  },

  // === SPEECH SETUP ===

  initSpeechRecognition() {
    if (!this.recognitionSupported) {
      if (this.els.noSpeechWarning) {
        this.els.noSpeechWarning.style.display = 'block';
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript.toLowerCase().trim();
      this.els.heardText.textContent = `I heard: "${heard}"`;
      this.els.micBtn.classList.remove('listening');
      this.checkReading(heard);
    };

    this.recognition.onerror = (event) => {
      this.els.micBtn.classList.remove('listening');
      if (event.error === 'no-speech') {
        this.els.heardText.textContent = "I didn't hear anything. Try again!";
      } else {
        this.els.heardText.textContent = "Oops! Let's try again.";
      }
    };

    this.recognition.onend = () => {
      this.els.micBtn.classList.remove('listening');
    };
  },

  // === LOAD WORD FILES ===

  async loadCategories() {
    const files = ['animals.json', 'colors.json', 'sight-words.json', 'food.json'];
    this.categories = [];

    for (const file of files) {
      try {
        const resp = await fetch(`words/${file}`);
        const data = await resp.json();
        this.categories.push(data);
      } catch (e) {
        console.warn(`Could not load ${file}:`, e);
      }
    }
  },

  // === NAVIGATION ===

  showScreen(name) {
    this.els.screens.forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${name}`).classList.add('active');
  },

  selectMode(mode) {
    this.mode = mode;
    this.els.categoryTitle.textContent = mode === 'spell'
      ? 'Pick words to spell!'
      : 'Pick words to read!';
    this.renderCategories();
    this.showScreen('categories');
  },

  renderCategories() {
    this.els.categoryGrid.innerHTML = '';
    for (const cat of this.categories) {
      const btn = document.createElement('button');
      btn.className = 'category-card';
      btn.innerHTML = `<span class="cat-icon">${cat.icon}</span>${cat.category}`;
      btn.addEventListener('click', () => this.startGame(cat));
      this.els.categoryGrid.appendChild(btn);
    }
  },

  startGame(category) {
    this.categoryName = category.category;
    this.words = this.shuffle([...category.words]);
    this.currentIndex = 0;
    this.score = 0;
    this.updateProgress();
    this.showScreen('game');

    this.els.gameTitle.textContent =
      this.mode === 'spell' ? 'Hear & Spell' : 'Read Aloud';

    if (this.mode === 'spell') {
      this.els.spellArea.style.display = 'flex';
      this.els.readArea.style.display = 'none';
      this.els.wordDisplay.style.display = 'none';
      this.setupSpellRound();
    } else {
      this.els.spellArea.style.display = 'none';
      this.els.readArea.style.display = 'flex';
      this.els.wordDisplay.style.display = 'block';
      this.setupReadRound();
    }
  },

  // === SPELL MODE ===

  setupSpellRound() {
    this.els.spellInput.value = '';
    this.els.spellInput.className = 'spell-input';
    this.els.hintText.textContent = '';
    this.els.spellInput.focus();
    // Auto-speak the word
    setTimeout(() => this.speakCurrentWord(), 400);
  },

  speakCurrentWord() {
    if (!this.speechSupported) return;
    this.synth.cancel();
    const word = this.words[this.currentIndex].word;
    const utter = new SpeechSynthesisUtterance(word);
    utter.rate = 0.75;
    utter.pitch = 1.1;
    this.synth.speak(utter);
  },

  checkSpelling() {
    const input = this.els.spellInput.value.trim().toLowerCase();
    const correct = this.words[this.currentIndex].word.toLowerCase();

    if (!input) return;

    if (input === correct) {
      this.score++;
      this.els.spellInput.className = 'spell-input correct';
      this.showFeedback(true);
    } else {
      this.els.spellInput.className = 'spell-input wrong';
      this.showFeedback(false, correct);
    }
  },

  // === READ MODE ===

  setupReadRound() {
    const word = this.words[this.currentIndex].word;
    this.els.wordDisplay.textContent = word;
    this.els.heardText.textContent = 'Tap the microphone and read the word!';
    this.els.hintText.textContent = '';
  },

  startListening() {
    if (!this.recognition) {
      this.els.heardText.textContent = 'Speech recognition not available in this browser.';
      return;
    }
    this.els.micBtn.classList.add('listening');
    this.els.heardText.textContent = 'Listening...';
    try {
      this.recognition.start();
    } catch (e) {
      // Already started
      this.recognition.stop();
      setTimeout(() => this.recognition.start(), 200);
    }
  },

  checkReading(heard) {
    const correct = this.words[this.currentIndex].word.toLowerCase();
    // Be lenient: check if the correct word appears in what was heard
    const match = heard === correct || heard.includes(correct) || correct.includes(heard);

    if (match) {
      this.score++;
      this.showFeedback(true);
    } else {
      this.showFeedback(false, correct);
    }
  },

  // === FEEDBACK ===

  showFeedback(isCorrect, correctAnswer) {
    const encouragements = [
      'Amazing!', 'Great job!', 'You rock!', 'Fantastic!',
      'Super star!', 'Wonderful!', 'You did it!', 'Awesome!'
    ];
    const tryAgains = [
      'Almost!', 'Good try!', 'Keep going!', 'So close!'
    ];

    if (isCorrect) {
      this.els.feedbackEmoji.textContent = ['🌟', '🎉', '⭐', '🏆', '💪'][Math.floor(Math.random() * 5)];
      this.els.feedbackText.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];
    } else {
      this.els.feedbackEmoji.textContent = ['💛', '🤗', '😊'][Math.floor(Math.random() * 3)];
      const msg = tryAgains[Math.floor(Math.random() * tryAgains.length)];
      this.els.feedbackText.textContent = correctAnswer
        ? `${msg} The word is "${correctAnswer}"`
        : msg;
    }

    this.els.feedbackBtn.textContent =
      this.currentIndex < this.words.length - 1 ? 'Next Word' : 'See Results';

    this.els.feedback.classList.add('show');
    this.updateProgress();
  },

  nextWord() {
    this.els.feedback.classList.remove('show');
    this.currentIndex++;

    if (this.currentIndex >= this.words.length) {
      this.showResults();
      return;
    }

    this.updateProgress();

    if (this.mode === 'spell') {
      this.setupSpellRound();
    } else {
      this.setupReadRound();
    }
  },

  // === HINT ===

  showHint() {
    const hint = this.words[this.currentIndex].hint;
    this.els.hintText.textContent = hint;
  },

  // === PROGRESS ===

  updateProgress() {
    const total = this.words.length;
    const current = this.currentIndex + 1;
    this.els.progressInfo.textContent = `${current} / ${total}`;
    this.els.scoreDisplay.textContent = `${this.score} ⭐`;
    this.els.progressFill.style.width = `${(current / total) * 100}%`;
  },

  // === RESULTS ===

  showResults() {
    const total = this.words.length;
    const pct = Math.round((this.score / total) * 100);

    // Stars based on score
    let stars = '';
    if (pct >= 90) stars = '⭐⭐⭐';
    else if (pct >= 70) stars = '⭐⭐';
    else if (pct >= 40) stars = '⭐';
    else stars = '💛';

    let emoji, title;
    if (pct >= 90) { emoji = '🏆'; title = 'Amazing!'; }
    else if (pct >= 70) { emoji = '🎉'; title = 'Great job!'; }
    else if (pct >= 40) { emoji = '😊'; title = 'Good try!'; }
    else { emoji = '🤗'; title = 'Keep practicing!'; }

    this.els.resultsEmoji.textContent = emoji;
    this.els.resultsTitle.textContent = title;
    this.els.resultsScore.textContent = `You got ${this.score} out of ${total} correct!`;
    this.els.resultsStars.textContent = stars;

    this.showScreen('results');
  },

  // === REPLAY / HOME ===

  replay() {
    const cat = this.categories.find(c => c.category === this.categoryName);
    if (cat) this.startGame(cat);
  },

  goHome() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch(e) {}
    }
    this.synth.cancel();
    this.showScreen('home');
  },

  // === UTILS ===

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
