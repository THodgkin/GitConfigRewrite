// === Word Buddy - Learning App for Kids ===

const App = {
  // State
  mode: null,          // 'spell', 'read', or 'story'
  words: [],           // current word list
  currentIndex: 0,
  score: 0,
  categoryName: '',
  categories: [],

  // Story state
  storyCategories: [],
  currentStory: null,
  currentStoryCategory: null,
  storySentenceIndex: 0,
  storyPhase: 'read',  // 'read' or 'fill'
  storyFillIndex: 0,
  storyScore: 0,
  storyTotal: 0,
  storyRecognitionHandler: null,

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
    this.loadStoryCategories();
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
      // Story mode
      storyModeBtn: document.getElementById('story-mode-btn'),
      storyCategoryGrid: document.getElementById('story-category-grid'),
      storyList: document.getElementById('story-list'),
      storySelectTitle: document.getElementById('story-select-title'),
      storyBackBtn: document.getElementById('story-back-btn'),
      storyProgressInfo: document.getElementById('story-progress-info'),
      storyScoreDisplay: document.getElementById('story-score-display'),
      storyProgressFill: document.getElementById('story-progress-fill'),
      storyTitle: document.getElementById('story-title'),
      storyReadArea: document.getElementById('story-read-area'),
      storySentence: document.getElementById('story-sentence'),
      storyListenBtn: document.getElementById('story-listen-btn'),
      storyMicBtn: document.getElementById('story-mic-btn'),
      storyHeardText: document.getElementById('story-heard-text'),
      storyNextSentenceBtn: document.getElementById('story-next-sentence-btn'),
      storyFillArea: document.getElementById('story-fill-area'),
      fillSentence: document.getElementById('fill-sentence'),
      fillListenBtn: document.getElementById('fill-listen-btn'),
      fillInput: document.getElementById('fill-input'),
      fillCheckBtn: document.getElementById('fill-check-btn'),
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

    // Story mode events
    this.els.storyModeBtn.addEventListener('click', () => this.openStoryPicker());
    this.els.storyBackBtn.addEventListener('click', () => this.goHome());
    this.els.storyListenBtn.addEventListener('click', () => this.speakStorySentence());
    this.els.storyMicBtn.addEventListener('click', () => this.startStoryListening());
    this.els.storyNextSentenceBtn.addEventListener('click', () => this.advanceStory());
    this.els.fillListenBtn.addEventListener('click', () => this.speakFillSentence());
    this.els.fillCheckBtn.addEventListener('click', () => this.checkFillAnswer());
    this.els.fillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.checkFillAnswer();
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

    this.setupRecognitionRouting();
  },

  // Set up recognition to route to either word mode or story mode
  setupRecognitionRouting() {
    if (!this.recognition) return;

    this.recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript.toLowerCase().trim();

      if (this.mode === 'story') {
        this.els.storyMicBtn.classList.remove('listening');
        this.els.storyHeardText.textContent = `I heard: "${heard}"`;
        this.checkStoryReading(heard);
      } else {
        this.els.micBtn.classList.remove('listening');
        this.els.heardText.textContent = `I heard: "${heard}"`;
        this.checkReading(heard);
      }
    };

    this.recognition.onerror = (event) => {
      const msg = event.error === 'no-speech'
        ? "I didn't hear anything. Try again!"
        : "Oops! Let's try again.";

      if (this.mode === 'story') {
        this.els.storyMicBtn.classList.remove('listening');
        this.els.storyHeardText.textContent = msg;
      } else {
        this.els.micBtn.classList.remove('listening');
        this.els.heardText.textContent = msg;
      }
    };

    this.recognition.onend = () => {
      if (this.mode === 'story') {
        this.els.storyMicBtn.classList.remove('listening');
      } else {
        this.els.micBtn.classList.remove('listening');
      }
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

  // === STORY MODE ===

  async loadStoryCategories() {
    const files = ['animal-stories.json', 'fun-stories.json', 'school-stories.json'];
    this.storyCategories = [];

    for (const file of files) {
      try {
        const resp = await fetch(`stories/${file}`);
        const data = await resp.json();
        this.storyCategories.push(data);
      } catch (e) {
        console.warn(`Could not load story ${file}:`, e);
      }
    }
  },

  openStoryPicker() {
    this.els.storyCategoryGrid.innerHTML = '';
    for (const cat of this.storyCategories) {
      const btn = document.createElement('button');
      btn.className = 'category-card';
      btn.innerHTML = `<span class="cat-icon">${cat.icon}</span>${cat.category}`;
      btn.addEventListener('click', () => this.openStorySelect(cat));
      this.els.storyCategoryGrid.appendChild(btn);
    }
    this.showScreen('story-picker');
  },

  openStorySelect(category) {
    this.currentStoryCategory = category;
    this.els.storySelectTitle.textContent = `${category.icon} ${category.category}`;
    this.els.storyList.innerHTML = '';

    for (const story of category.stories) {
      const btn = document.createElement('button');
      btn.className = 'category-card';
      btn.innerHTML = `<span class="cat-icon">📖</span>${story.title}`;
      btn.addEventListener('click', () => this.startStory(story));
      this.els.storyList.appendChild(btn);
    }
    this.showScreen('story-select');
  },

  startStory(story) {
    this.mode = 'story';
    this.currentStory = story;
    this.storyPhase = 'read';
    this.storySentenceIndex = 0;
    this.storyFillIndex = 0;
    this.storyScore = 0;
    this.storyTotal = story.sentences.length + story.fillBlanks.length;

    this.els.storyTitle.textContent = story.title;
    this.els.storyReadArea.style.display = 'flex';
    this.els.storyFillArea.style.display = 'none';
    this.els.storyNextSentenceBtn.style.display = 'none';

    this.updateStoryProgress();
    this.showScreen('story');
    this.setupStoryReadRound();
  },

  setupStoryReadRound() {
    const sentence = this.currentStory.sentences[this.storySentenceIndex];
    this.els.storySentence.textContent = sentence;
    this.els.storyHeardText.textContent = 'Listen to the sentence, then read it aloud!';
    this.els.storyNextSentenceBtn.style.display = 'none';

    // Auto-speak the sentence
    setTimeout(() => this.speakStorySentence(), 500);
  },

  speakStorySentence() {
    if (!this.speechSupported) return;
    this.synth.cancel();
    const sentence = this.currentStory.sentences[this.storySentenceIndex];
    const utter = new SpeechSynthesisUtterance(sentence);
    utter.rate = 0.7;
    utter.pitch = 1.1;
    this.synth.speak(utter);
  },

  startStoryListening() {
    if (!this.recognition) {
      this.els.storyHeardText.textContent = 'Speech recognition not available in this browser.';
      return;
    }
    this.els.storyMicBtn.classList.add('listening');
    this.els.storyHeardText.textContent = 'Listening...';
    try {
      this.recognition.start();
    } catch (e) {
      this.recognition.stop();
      setTimeout(() => this.recognition.start(), 200);
    }
  },

  checkStoryReading(heard) {
    const sentence = this.currentStory.sentences[this.storySentenceIndex].toLowerCase();
    // Clean punctuation for comparison
    const cleanSentence = sentence.replace(/[.,!?]/g, '').trim();
    const cleanHeard = heard.replace(/[.,!?]/g, '').trim();

    // Be lenient: check word overlap
    const sentenceWords = cleanSentence.split(/\s+/);
    const heardWords = cleanHeard.split(/\s+/);
    const matchCount = sentenceWords.filter(w => heardWords.includes(w)).length;
    const matchRatio = matchCount / sentenceWords.length;

    if (matchRatio >= 0.6) {
      this.storyScore++;
      this.els.storyHeardText.textContent = 'Great reading!';
      this.els.storyNextSentenceBtn.style.display = 'inline-block';
      this.els.storyNextSentenceBtn.textContent = 'Next';
    } else {
      this.els.storyHeardText.textContent = `Good try! Try reading it again.`;
      // Still let them advance after an attempt
      this.els.storyNextSentenceBtn.style.display = 'inline-block';
      this.els.storyNextSentenceBtn.textContent = 'Continue';
    }
    this.updateStoryProgress();
  },

  advanceStory() {
    this.storySentenceIndex++;

    if (this.storySentenceIndex < this.currentStory.sentences.length) {
      // More sentences to read
      this.setupStoryReadRound();
    } else {
      // Move to fill-in-the-blank phase
      this.storyPhase = 'fill';
      this.storyFillIndex = 0;
      this.els.storyReadArea.style.display = 'none';
      this.els.storyFillArea.style.display = 'flex';
      this.setupFillRound();
    }
  },

  setupFillRound() {
    const blank = this.currentStory.fillBlanks[this.storyFillIndex];
    this.els.fillSentence.textContent = blank.sentence;
    this.els.fillInput.value = '';
    this.els.fillInput.className = 'spell-input';
    this.els.fillInput.focus();
    this.updateStoryProgress();

    // Speak the full sentence (with the answer word included)
    setTimeout(() => this.speakFillSentence(), 400);
  },

  speakFillSentence() {
    if (!this.speechSupported) return;
    this.synth.cancel();
    const blank = this.currentStory.fillBlanks[this.storyFillIndex];
    // Speak the complete sentence with the answer
    const fullSentence = blank.sentence.replace('___', blank.answer);
    const utter = new SpeechSynthesisUtterance(fullSentence);
    utter.rate = 0.7;
    utter.pitch = 1.1;
    this.synth.speak(utter);
  },

  checkFillAnswer() {
    const input = this.els.fillInput.value.trim().toLowerCase();
    const correct = this.currentStory.fillBlanks[this.storyFillIndex].answer.toLowerCase();

    if (!input) return;

    if (input === correct) {
      this.storyScore++;
      this.els.fillInput.className = 'spell-input correct';
      this.showStoryFeedback(true);
    } else {
      this.els.fillInput.className = 'spell-input wrong';
      this.showStoryFeedback(false, correct);
    }
  },

  showStoryFeedback(isCorrect, correctAnswer) {
    const encouragements = ['Amazing!', 'Great job!', 'You rock!', 'Fantastic!'];
    const tryAgains = ['Almost!', 'Good try!', 'So close!'];

    if (isCorrect) {
      this.els.feedbackEmoji.textContent = ['🌟', '🎉', '⭐'][Math.floor(Math.random() * 3)];
      this.els.feedbackText.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];
    } else {
      this.els.feedbackEmoji.textContent = ['💛', '🤗'][Math.floor(Math.random() * 2)];
      const msg = tryAgains[Math.floor(Math.random() * tryAgains.length)];
      this.els.feedbackText.textContent = correctAnswer
        ? `${msg} The word is "${correctAnswer}"`
        : msg;
    }

    const isLast = this.storyFillIndex >= this.currentStory.fillBlanks.length - 1;
    this.els.feedbackBtn.textContent = isLast ? 'See Results' : 'Next';

    // Temporarily rebind feedback button for story flow
    this.els.feedbackBtn.onclick = () => {
      this.els.feedback.classList.remove('show');
      this.storyFillIndex++;

      if (this.storyFillIndex >= this.currentStory.fillBlanks.length) {
        this.showStoryResults();
      } else {
        this.setupFillRound();
      }
    };

    this.els.feedback.classList.add('show');
    this.updateStoryProgress();
  },

  showStoryResults() {
    // Restore normal feedback button behavior
    this.els.feedbackBtn.onclick = null;
    this.els.feedbackBtn.addEventListener('click', () => this.nextWord());

    const total = this.storyTotal;
    const pct = Math.round((this.storyScore / total) * 100);

    let stars = '';
    if (pct >= 90) stars = '⭐⭐⭐';
    else if (pct >= 70) stars = '⭐⭐';
    else if (pct >= 40) stars = '⭐';
    else stars = '💛';

    let emoji, title;
    if (pct >= 90) { emoji = '🏆'; title = 'Amazing Reader!'; }
    else if (pct >= 70) { emoji = '🎉'; title = 'Great Story Time!'; }
    else if (pct >= 40) { emoji = '😊'; title = 'Good try!'; }
    else { emoji = '🤗'; title = 'Keep practicing!'; }

    this.els.resultsEmoji.textContent = emoji;
    this.els.resultsTitle.textContent = title;
    this.els.resultsScore.textContent = `You got ${this.storyScore} out of ${total} correct!`;
    this.els.resultsStars.textContent = stars;

    this.showScreen('results');
  },

  updateStoryProgress() {
    let completed;
    if (this.storyPhase === 'read') {
      completed = this.storySentenceIndex + 1;
    } else {
      completed = this.currentStory.sentences.length + this.storyFillIndex + 1;
    }
    const total = this.storyTotal;
    this.els.storyProgressInfo.textContent = `${Math.min(completed, total)} / ${total}`;
    this.els.storyScoreDisplay.textContent = `${this.storyScore} ⭐`;
    this.els.storyProgressFill.style.width = `${(Math.min(completed, total) / total) * 100}%`;
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
