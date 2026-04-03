// Tamagotchi Game - with Personality, Mini-games, and Random Events

// === CONFIG ===

const STAGES = [
    {
        name: 'baby', minAge: 0, sprite: '\u{1F423}', evolvesAt: 5,
        stats: ['hunger', 'happiness', 'energy', 'cleanliness'],
        decayRates: { hunger: [2, 4], happiness: [1, 3], energy: [2, 3], cleanliness: [1, 2] },
    },
    {
        name: 'child', minAge: 5, sprite: '\u{1F425}', evolvesAt: 15,
        stats: ['hunger', 'happiness', 'energy', 'cleanliness', 'social'],
        decayRates: { hunger: [1, 3], happiness: [1, 2], energy: [1, 2], cleanliness: [1, 2], social: [1, 3] },
    },
    {
        name: 'teen', minAge: 15, sprite: '\u{1F424}', evolvesAt: 30,
        stats: ['hunger', 'happiness', 'energy', 'cleanliness', 'social', 'boredom'],
        decayRates: { hunger: [1, 2], happiness: [1, 2], energy: [1, 2], cleanliness: [0, 1], social: [2, 4], boredom: [1, 3] },
    },
    {
        name: 'adult', minAge: 30, sprite: '\u{1F414}', evolvesAt: null,
        stats: ['hunger', 'happiness', 'energy', 'cleanliness', 'social', 'boredom', 'fitness'],
        decayRates: { hunger: [1, 2], happiness: [0, 1], energy: [1, 2], cleanliness: [0, 1], social: [1, 2], boredom: [1, 2], fitness: [1, 3] },
    },
];

const STAT_CONFIG = {
    hunger:      { icon: '\u{1F354}', label: 'Hunger' },
    happiness:   { icon: '\u{1F60A}', label: 'Happy' },
    energy:      { icon: '\u{1F4A4}', label: 'Energy' },
    cleanliness: { icon: '\u{1F9FC}', label: 'Clean' },
    social:      { icon: '\u{1F49B}', label: 'Social' },
    boredom:     { icon: '\u{1F4DA}', label: 'Stimulation' },
    fitness:     { icon: '\u{1F4AA}', label: 'Fitness' },
};

const ALL_STATS = ['hunger', 'happiness', 'energy', 'cleanliness', 'social', 'boredom', 'fitness'];

const MOODS = [
    { min: 80, text: 'Feeling great! \u266A' },
    { min: 60, text: 'Doing okay~' },
    { min: 40, text: 'Not so good...' },
    { min: 20, text: 'Feeling terrible!' },
    { min: 0, text: 'Help me...' },
];

const FOOD_MENU = ['\u{1F354}', '\u{1F355}', '\u{1F34E}', '\u{1F370}', '\u{1F363}', '\u{1F955}'];

// === PERSONALITY SYSTEM ===

const PERSONALITIES = [
    {
        name: 'Lazy',
        icon: '\u{1F634}',
        desc: 'Loves to nap. Gets tired\neasily but sleeps like a rock.',
        bonus: 'Sleep restores +50% energy\nEnergy decays 30% faster',
        decayMod: { energy: 1.3 },
        actionMod: { sleep: { energy: 1.5 } },
        favAction: 'sleep',
        speech: ["So sleepy...", "Five more minutes...", "*yawn*", "Nap time?"],
    },
    {
        name: 'Curious',
        icon: '\u{1F9D0}',
        desc: 'Always exploring! Gets bored\nfast but loves to learn.',
        bonus: 'Study gives +40% stimulation\nBoredom decays 30% faster',
        decayMod: { boredom: 1.3 },
        actionMod: { study: { boredom: 1.4 } },
        favAction: 'study',
        speech: ["What's that?!", "Ooh, shiny!", "Tell me more!", "I wonder why..."],
    },
    {
        name: 'Social Butterfly',
        icon: '\u{1F98B}',
        desc: 'Needs lots of attention.\nBut each visit means more!',
        bonus: 'Pet gives +40% social\nSocial decays 30% faster',
        decayMod: { social: 1.3 },
        actionMod: { pet: { social: 1.4 } },
        favAction: 'pet',
        speech: ["Hey! Hey! HEY!", "Don't leave me!", "BFF!", "Hang out?"],
    },
    {
        name: 'Glutton',
        icon: '\u{1F924}',
        desc: 'Always hungry! But food\nmakes this one extra happy.',
        bonus: 'Feed gives +50% hunger\nHunger decays 30% faster',
        decayMod: { hunger: 1.3 },
        actionMod: { feed: { hunger: 1.5 } },
        favAction: 'feed',
        speech: ["Fooood!", "Is it snack time?", "Nom nom nom", "More please!"],
    },
    {
        name: 'Neat Freak',
        icon: '\u{2728}',
        desc: 'Hates being dirty! But\ncleaning is extra effective.',
        bonus: 'Clean gives +40% cleanliness\nCleanliness decays 40% faster',
        decayMod: { cleanliness: 1.4 },
        actionMod: { clean: { cleanliness: 1.4 } },
        favAction: 'clean',
        speech: ["Ew, gross!", "Squeaky clean!", "Tidy up!", "So fresh~"],
    },
    {
        name: 'Athletic',
        icon: '\u{1F3C3}',
        desc: 'Born to move! Needs lots\nof exercise but gains fast.',
        bonus: 'Train gives +40% fitness\nFitness decays 30% faster',
        decayMod: { fitness: 1.3 },
        actionMod: { train: { fitness: 1.4 } },
        favAction: 'train',
        speech: ["Let's GO!", "No pain no gain!", "One more rep!", "Pump it!"],
    },
];

// === RANDOM EVENTS ===

const RANDOM_EVENTS = [
    {
        name: 'Thunderstorm',
        icon: '\u{26C8}\u{FE0F}',
        text: 'A thunderstorm! Your pet\nis scared!',
        effects: { happiness: -20, energy: -10 },
        minAge: 0,
    },
    {
        name: 'Sunny Day',
        icon: '\u{2600}\u{FE0F}',
        text: 'What a beautiful sunny day!\nEveryone feels great!',
        effects: { happiness: +15, energy: +10 },
        minAge: 0,
    },
    {
        name: 'Visitor',
        icon: '\u{1F44B}',
        text: 'A friend came to visit!\nYour pet is so happy!',
        effects: { social: +25, happiness: +15 },
        minAge: 5,
    },
    {
        name: 'Found Treasure',
        icon: '\u{1F4E6}',
        text: 'Your pet found a\nmysterious gift box!',
        effects: { happiness: +20, boredom: +15 },
        minAge: 0,
    },
    {
        name: 'Bug Bite',
        icon: '\u{1F99F}',
        text: 'Oh no! A bug bite!\nYour pet might get sick...',
        effects: { cleanliness: -15, happiness: -10 },
        causesSickness: true,
        minAge: 0,
    },
    {
        name: 'Rainstorm',
        icon: '\u{1F327}\u{FE0F}',
        text: 'It started raining.\nAt least the air is fresh!',
        effects: { cleanliness: +10, happiness: -10, energy: -5 },
        minAge: 0,
    },
    {
        name: 'Discovery',
        icon: '\u{1F50D}',
        text: 'Your pet discovered\nsomething fascinating!',
        effects: { boredom: +25, happiness: +10 },
        minAge: 15,
    },
    {
        name: 'Growth Spurt',
        icon: '\u{1F4AA}',
        text: 'Your pet had a growth\nspurt overnight!',
        effects: { fitness: +20, hunger: -15 },
        minAge: 30,
    },
    {
        name: 'Nightmare',
        icon: '\u{1F47B}',
        text: 'Your pet had a bad dream\nand woke up startled!',
        effects: { energy: -15, happiness: -10 },
        minAge: 0,
    },
    {
        name: 'Treat',
        icon: '\u{1F36C}',
        text: 'Someone left a treat!\nYummy!',
        effects: { hunger: +20, happiness: +10 },
        minAge: 0,
    },
];

// === MINI-GAMES ===

class CatchGame {
    constructor(area, hud, onComplete) {
        this.area = area;
        this.hud = hud;
        this.onComplete = onComplete;
        this.score = 0;
        this.missed = 0;
        this.maxMissed = 3;
        this.catchTarget = 8;
        this.items = ['\u{1F31F}', '\u{2B50}', '\u{1F308}', '\u{1F3B5}', '\u{1F381}'];
        this.catcherX = 130;
        this.active = true;
        this.fallingItems = [];
        this.animFrame = null;
        this.spawnTimer = null;
        this.start();
    }

    start() {
        this.area.innerHTML = '';
        this.catcher = document.createElement('div');
        this.catcher.className = 'mg-catcher';
        this.catcher.textContent = '\u{1F43E}';
        this.catcher.style.left = this.catcherX + 'px';
        this.area.appendChild(this.catcher);

        this.hud.textContent = `Caught: ${this.score}/${this.catchTarget}  Miss: ${this.missed}/${this.maxMissed}`;

        this.area.addEventListener('mousemove', this._onMove = (e) => {
            const rect = this.area.getBoundingClientRect();
            this.catcherX = Math.max(0, Math.min(248, e.clientX - rect.left - 16));
            this.catcher.style.left = this.catcherX + 'px';
        });

        this.area.addEventListener('touchmove', this._onTouch = (e) => {
            e.preventDefault();
            const rect = this.area.getBoundingClientRect();
            this.catcherX = Math.max(0, Math.min(248, e.touches[0].clientX - rect.left - 16));
            this.catcher.style.left = this.catcherX + 'px';
        }, { passive: false });

        this.spawnTimer = setInterval(() => this.spawnItem(), 800);
        this.gameLoop();
    }

    spawnItem() {
        if (!this.active) return;
        const el = document.createElement('div');
        el.className = 'mg-falling';
        el.textContent = this.items[randomInt(0, this.items.length - 1)];
        el.style.left = randomInt(10, 240) + 'px';
        el.style.top = '-30px';
        this.area.appendChild(el);
        this.fallingItems.push({ el, y: -30, speed: randomInt(2, 4) });
    }

    gameLoop() {
        if (!this.active) return;
        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];
            item.y += item.speed;
            item.el.style.top = item.y + 'px';

            // Check catch
            const itemX = parseInt(item.el.style.left);
            if (item.y >= 155 && item.y <= 185 && Math.abs(itemX - this.catcherX) < 35) {
                item.el.classList.add('mg-catch-flash');
                setTimeout(() => item.el.remove(), 300);
                this.fallingItems.splice(i, 1);
                this.score++;
                this.hud.textContent = `Caught: ${this.score}/${this.catchTarget}  Miss: ${this.missed}/${this.maxMissed}`;
                if (this.score >= this.catchTarget) { this.end(true); return; }
                continue;
            }

            // Check miss
            if (item.y > 200) {
                item.el.remove();
                this.fallingItems.splice(i, 1);
                this.missed++;
                this.hud.textContent = `Caught: ${this.score}/${this.catchTarget}  Miss: ${this.missed}/${this.maxMissed}`;
                if (this.missed >= this.maxMissed) { this.end(false); return; }
            }
        }
        this.animFrame = requestAnimationFrame(() => this.gameLoop());
    }

    end(won) {
        this.active = false;
        clearInterval(this.spawnTimer);
        cancelAnimationFrame(this.animFrame);
        this.area.removeEventListener('mousemove', this._onMove);
        this.area.removeEventListener('touchmove', this._onTouch);
        this.fallingItems.forEach(i => i.el.remove());

        const quality = won ? (this.missed === 0 ? 'perfect' : 'good') : 'fail';
        this.area.innerHTML = `<div class="mg-result">${won ? '\u{1F389} Great catch!' : '\u{1F614} Too many missed...'}<br>${this.score}/${this.catchTarget} caught</div>`;
        setTimeout(() => this.onComplete(quality), 1500);
    }
}

class MemoryGame {
    constructor(area, hud, onComplete) {
        this.area = area;
        this.hud = hud;
        this.onComplete = onComplete;
        this.symbols = ['\u{1F31F}', '\u{1F308}', '\u{1F3B5}', '\u{2764}\u{FE0F}', '\u{1F33B}', '\u{1F525}'];
        this.sequenceLen = 4;
        this.sequence = [];
        this.playerInput = [];
        this.showing = true;
        this.start();
    }

    start() {
        // Generate random sequence
        for (let i = 0; i < this.sequenceLen; i++) {
            this.sequence.push(randomInt(0, this.symbols.length - 1));
        }
        this.hud.textContent = 'Watch carefully...';
        this.showSequence();
    }

    showSequence() {
        this.area.innerHTML = '<div class="mg-sequence"><span class="mg-show-text">Watch!</span></div>';
        let i = 0;
        const showNext = () => {
            if (i >= this.sequence.length) {
                setTimeout(() => this.showInput(), 500);
                return;
            }
            this.area.innerHTML = `<div class="mg-sequence"><span style="font-size:48px">${this.symbols[this.sequence[i]]}</span></div>`;
            i++;
            setTimeout(showNext, 800);
        };
        setTimeout(showNext, 600);
    }

    showInput() {
        this.showing = false;
        this.hud.textContent = `Repeat the pattern! (${this.playerInput.length}/${this.sequenceLen})`;
        this.area.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'mg-sequence';
        this.symbols.forEach((sym, idx) => {
            const card = document.createElement('div');
            card.className = 'mg-card';
            card.textContent = sym;
            card.addEventListener('click', () => this.handleInput(idx, card));
            grid.appendChild(card);
        });
        this.area.appendChild(grid);
    }

    handleInput(idx, card) {
        if (this.showing) return;
        const expected = this.sequence[this.playerInput.length];
        if (idx === expected) {
            card.classList.add('correct');
            setTimeout(() => card.classList.remove('correct'), 300);
            this.playerInput.push(idx);
            this.hud.textContent = `Repeat the pattern! (${this.playerInput.length}/${this.sequenceLen})`;
            if (this.playerInput.length >= this.sequenceLen) {
                this.end(true);
            }
        } else {
            card.classList.add('wrong');
            this.end(false);
        }
    }

    end(won) {
        this.showing = true; // prevent further input
        const correct = this.playerInput.length;
        const quality = won ? (correct === this.sequenceLen ? 'perfect' : 'good') : (correct >= 2 ? 'good' : 'fail');
        this.area.innerHTML = `<div class="mg-result">${won ? '\u{1F9E0} Perfect memory!' : '\u{1F914} Not quite...'}<br>${correct}/${this.sequenceLen} correct</div>`;
        setTimeout(() => this.onComplete(quality), 1500);
    }
}

class MashGame {
    constructor(area, hud, onComplete) {
        this.area = area;
        this.hud = hud;
        this.onComplete = onComplete;
        this.count = 0;
        this.target = 20;
        this.timeLimit = 5000;
        this.active = true;
        this.start();
    }

    start() {
        this.area.innerHTML = '';
        this.hud.textContent = 'Mash the button!';

        // Timer bar
        const timerBar = document.createElement('div');
        timerBar.className = 'mg-timer-bar';
        const timerFill = document.createElement('div');
        timerFill.className = 'mg-timer-fill';
        timerFill.style.width = '100%';
        timerBar.appendChild(timerFill);
        this.area.appendChild(timerBar);
        this.timerFill = timerFill;

        // Mash button
        const btn = document.createElement('div');
        btn.className = 'mg-mash-btn';
        btn.textContent = '\u{1F4A5}';
        btn.addEventListener('mousedown', () => this.mash());
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.mash(); });
        this.area.appendChild(btn);
        this.mashBtn = btn;

        // Progress bar
        const progBar = document.createElement('div');
        progBar.className = 'mg-progress-bar';
        const progFill = document.createElement('div');
        progFill.className = 'mg-progress-fill';
        progFill.style.width = '0%';
        progBar.appendChild(progFill);
        this.area.appendChild(progBar);
        this.progFill = progFill;

        this.startTime = Date.now();
        this.timerLoop();
    }

    mash() {
        if (!this.active) return;
        this.count++;
        this.progFill.style.width = Math.min(100, (this.count / this.target) * 100) + '%';
        this.mashBtn.style.transform = 'translate(-50%, -50%) scale(0.85)';
        setTimeout(() => {
            if (this.mashBtn) this.mashBtn.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 50);
        if (this.count >= this.target) {
            this.end(true);
        }
    }

    timerLoop() {
        if (!this.active) return;
        const elapsed = Date.now() - this.startTime;
        const pct = Math.max(0, 1 - elapsed / this.timeLimit);
        this.timerFill.style.width = (pct * 100) + '%';
        if (elapsed >= this.timeLimit) {
            this.end(false);
            return;
        }
        requestAnimationFrame(() => this.timerLoop());
    }

    end(won) {
        this.active = false;
        const quality = won ? (this.count >= this.target * 1.5 ? 'perfect' : 'good') : (this.count >= this.target * 0.6 ? 'good' : 'fail');
        this.area.innerHTML = `<div class="mg-result">${won ? '\u{1F525} Power up!' : '\u{1F62E}\u200D\u{1F4A8} Time\'s up!'}<br>${this.count} hits</div>`;
        setTimeout(() => this.onComplete(quality), 1500);
    }
}

// === MAIN GAME CLASS ===

class Tamagotchi {
    constructor() {
        this.name = '';
        this.age = 0;
        this.stats = {};
        ALL_STATS.forEach(s => this.stats[s] = 80);
        this.stats.energy = 100;
        this.stats.cleanliness = 100;
        this.personality = null;
        this.isSick = false;
        this.isSleeping = false;
        this.isAlive = true;
        this.inMinigame = false;
        this.poopCount = 0;
        this.tickCount = 0;
        this.stage = STAGES[0];

        this.cacheElements();
        this.bindEvents();
    }

    cacheElements() {
        this.screens = {
            start: document.getElementById('start-screen'),
            name: document.getElementById('name-screen'),
            personality: document.getElementById('personality-screen'),
            game: document.getElementById('game-screen'),
            death: document.getElementById('death-screen'),
        };
        this.screenEl = document.getElementById('screen');
        this.petSprite = document.getElementById('pet-sprite');
        this.reactionEl = document.getElementById('reaction');
        this.poopEl = document.getElementById('poop');
        this.speechBubble = document.getElementById('speech-bubble');
        this.nameDisplay = document.getElementById('pet-name-display');
        this.ageDisplay = document.getElementById('age-display');
        this.stageDisplay = document.getElementById('stage-display');
        this.traitBadge = document.getElementById('trait-badge');
        this.moodText = document.getElementById('mood-text');
        this.statsContainer = document.getElementById('stats-container');

        this.minigameOverlay = document.getElementById('minigame-overlay');
        this.minigameTitle = document.getElementById('minigame-title');
        this.minigameArea = document.getElementById('minigame-area');
        this.minigameHud = document.getElementById('minigame-hud');

        this.eventOverlay = document.getElementById('event-overlay');
        this.eventIcon = document.getElementById('event-icon');
        this.eventText = document.getElementById('event-text');

        this.bars = {};
        this.statRows = {};
        this.buttons = {
            start: document.getElementById('btn-start'),
            feed: document.getElementById('btn-feed'),
            play: document.getElementById('btn-play'),
            sleep: document.getElementById('btn-sleep'),
            clean: document.getElementById('btn-clean'),
            heal: document.getElementById('btn-heal'),
            pet: document.getElementById('btn-pet'),
            study: document.getElementById('btn-study'),
            train: document.getElementById('btn-train'),
        };
        this.btnGroups = {
            pet: document.getElementById('btn-pet-group'),
            study: document.getElementById('btn-study-group'),
            train: document.getElementById('btn-train-group'),
        };
        this.nameInput = document.getElementById('pet-name-input');
        this.confirmNameBtn = document.getElementById('confirm-name-btn');
        this.personalityOkBtn = document.getElementById('personality-ok-btn');
        this.restartBtn = document.getElementById('restart-btn');
    }

    bindEvents() {
        this.buttons.start.addEventListener('click', () => this.hatch());
        this.buttons.feed.addEventListener('click', () => this.feed());
        this.buttons.play.addEventListener('click', () => this.play());
        this.buttons.sleep.addEventListener('click', () => this.toggleSleep());
        this.buttons.clean.addEventListener('click', () => this.clean());
        this.buttons.heal.addEventListener('click', () => this.heal());
        this.buttons.pet.addEventListener('click', () => this.petAction());
        this.buttons.study.addEventListener('click', () => this.study());
        this.buttons.train.addEventListener('click', () => this.train());
        this.confirmNameBtn.addEventListener('click', () => this.confirmName());
        this.nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.confirmName();
        });
        this.personalityOkBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restart());
    }

    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        this.screens[name].classList.remove('hidden');
        this.minigameOverlay.classList.add('hidden');
    }

    hatch() {
        this.showScreen('name');
        this.nameInput.focus();
    }

    confirmName() {
        const name = this.nameInput.value.trim();
        if (!name) return;
        this.name = name;

        // Roll personality
        this.personality = PERSONALITIES[randomInt(0, PERSONALITIES.length - 1)];

        // Show personality reveal
        document.getElementById('personality-sprite').textContent = STAGES[0].sprite;
        document.getElementById('personality-name').textContent = `${name} is ${this.personality.name}! ${this.personality.icon}`;
        document.getElementById('personality-desc').textContent = this.personality.desc;
        document.getElementById('personality-bonus').textContent = this.personality.bonus;
        this.showScreen('personality');
    }

    startGame() {
        this.nameDisplay.textContent = this.name;
        this.traitBadge.textContent = `${this.personality.icon} ${this.personality.name}`;
        this.showScreen('game');
        this.buildStatBars();
        this.updateButtonVisibility();
        this.petSprite.textContent = this.stage.sprite;
        this.updateBars();
        this.updateMood();
        this.startGameLoop();
    }

    buildStatBars() {
        this.statsContainer.innerHTML = '';
        this.bars = {};
        this.statRows = {};

        ALL_STATS.forEach(stat => {
            const config = STAT_CONFIG[stat];
            const row = document.createElement('div');
            row.className = 'stat';
            row.dataset.stat = stat;

            const icon = document.createElement('span');
            icon.className = 'stat-icon';
            icon.textContent = config.icon;

            const barOuter = document.createElement('div');
            barOuter.className = 'stat-bar';

            const barFill = document.createElement('div');
            barFill.className = 'stat-fill';
            barOuter.appendChild(barFill);

            row.appendChild(icon);
            row.appendChild(barOuter);

            this.statsContainer.appendChild(row);
            this.bars[stat] = barFill;
            this.statRows[stat] = row;

            if (!this.stage.stats.includes(stat)) {
                row.classList.add('hidden');
            }
        });
    }

    updateButtonVisibility() {
        const activeStats = this.stage.stats;
        this.btnGroups.pet.classList.toggle('hidden', !activeStats.includes('social'));
        this.btnGroups.study.classList.toggle('hidden', !activeStats.includes('boredom'));
        this.btnGroups.train.classList.toggle('hidden', !activeStats.includes('fitness'));

        ['feed', 'play', 'sleep', 'clean', 'heal'].forEach(b => {
            this.buttons[b].disabled = false;
        });
        ['pet', 'study', 'train'].forEach(b => {
            this.buttons[b].disabled = this.btnGroups[b].classList.contains('hidden');
        });
    }

    setGameButtons(enabled) {
        ['feed', 'play', 'sleep', 'clean', 'heal', 'pet', 'study', 'train'].forEach(b => {
            this.buttons[b].disabled = !enabled;
        });
    }

    startGameLoop() {
        this.gameInterval = setInterval(() => this.tick(), 3000);
    }

    // === PERSONALITY HELPERS ===

    getDecayRate(stat) {
        const base = this.stage.decayRates[stat];
        if (!base) return [0, 0];
        const mod = this.personality && this.personality.decayMod && this.personality.decayMod[stat];
        if (mod) {
            return [Math.round(base[0] * mod), Math.round(base[1] * mod)];
        }
        return base;
    }

    applyActionBonus(action, stat, value) {
        if (!this.personality || !this.personality.actionMod) return value;
        const mod = this.personality.actionMod[action];
        if (mod && mod[stat]) {
            return Math.round(value * mod[stat]);
        }
        return value;
    }

    // === SPEECH BUBBLES ===

    showSpeech(text) {
        this.speechBubble.textContent = text;
        this.speechBubble.classList.remove('hidden');
        clearTimeout(this._speechTimeout);
        this._speechTimeout = setTimeout(() => {
            this.speechBubble.classList.add('hidden');
        }, 2500);
    }

    randomSpeech() {
        if (!this.personality || this.isSleeping || !this.isAlive) return;
        if (Math.random() < 0.3) {
            const lines = this.personality.speech;
            this.showSpeech(lines[randomInt(0, lines.length - 1)]);
        }
    }

    // === TICK / GAME LOOP ===

    tick() {
        if (!this.isAlive || this.inMinigame) return;

        this.tickCount++;

        // Age every 20 ticks (~60s)
        if (this.tickCount % 20 === 0) {
            this.age++;
            this.ageDisplay.textContent = `Age: ${this.age}`;
            this.checkEvolution();
        }

        // Stat decay with personality modifiers
        if (!this.isSleeping) {
            for (const stat of this.stage.stats) {
                const [min, max] = this.getDecayRate(stat);
                this.stats[stat] = Math.max(0, this.stats[stat] - randomInt(min, max));
            }
        } else {
            const sleepRestore = this.personality && this.personality.actionMod && this.personality.actionMod.sleep
                ? this.personality.actionMod.sleep.energy || 1 : 1;
            this.stats.energy = Math.min(100, this.stats.energy + Math.round(5 * sleepRestore));
            this.stats.hunger = Math.max(0, this.stats.hunger - 1);
            if (this.stage.stats.includes('social')) {
                this.stats.social = Math.max(0, this.stats.social - 1);
            }
            if (this.stats.energy >= 100) {
                this.wakeUp();
            }
        }

        // Poop chance
        if (!this.isSleeping && this.tickCount % 10 === 0 && Math.random() < 0.4) {
            this.poopCount++;
            this.stats.cleanliness = Math.max(0, this.stats.cleanliness - 10);
        }

        // Sickness chance
        if (!this.isSick) {
            const lowStats = this.stage.stats.filter(s => this.stats[s] < 20);
            const sickChance = lowStats.length * 0.08;
            if (sickChance > 0 && Math.random() < sickChance) {
                this.isSick = true;
            }
        }

        if (this.isSick) {
            this.stats.happiness = Math.max(0, this.stats.happiness - 3);
            this.stats.hunger = Math.max(0, this.stats.hunger - 2);
        }

        // Random event chance (~8% per tick)
        if (!this.isSleeping && Math.random() < 0.08) {
            this.triggerRandomEvent();
        }

        // Random personality speech
        this.randomSpeech();

        // Check death
        const allZero = this.stage.stats.every(s => this.stats[s] <= 0);
        if (allZero) {
            this.die();
            return;
        }

        this.updateBars();
        this.updatePetState();
        this.updateMood();
        this.updatePoop();
    }

    checkEvolution() {
        for (let i = STAGES.length - 1; i >= 0; i--) {
            if (this.age >= STAGES[i].minAge) {
                if (this.stage !== STAGES[i]) {
                    const oldStage = this.stage;
                    this.stage = STAGES[i];
                    this.petSprite.textContent = this.stage.sprite;
                    this.showReaction('\u2B50');
                    this.stageDisplay.textContent = this.stage.name;

                    const newStats = this.stage.stats.filter(s => !oldStage.stats.includes(s));
                    newStats.forEach(s => this.stats[s] = 70);

                    newStats.forEach(s => {
                        if (this.statRows[s]) {
                            this.statRows[s].classList.remove('hidden');
                            this.statRows[s].classList.add('stat-new');
                            setTimeout(() => this.statRows[s].classList.remove('stat-new'), 2000);
                        }
                    });

                    this.updateButtonVisibility();
                    this.showSpeech(`Evolved into ${this.stage.name}!`);
                }
                break;
            }
        }
    }

    // === RANDOM EVENTS ===

    triggerRandomEvent() {
        const eligible = RANDOM_EVENTS.filter(e => this.age >= e.minAge);
        if (eligible.length === 0) return;

        const event = eligible[randomInt(0, eligible.length - 1)];

        // Apply effects (only to active stats)
        for (const [stat, delta] of Object.entries(event.effects)) {
            if (this.stage.stats.includes(stat)) {
                this.stats[stat] = Math.max(0, Math.min(100, this.stats[stat] + delta));
            }
        }

        if (event.causesSickness && Math.random() < 0.5) {
            this.isSick = true;
        }

        // Show event overlay
        this.eventIcon.textContent = event.icon;
        this.eventText.textContent = event.text;
        this.eventOverlay.classList.remove('hidden');

        setTimeout(() => {
            this.eventOverlay.classList.add('hidden');
        }, 2500);

        this.updateBars();
    }

    // === MINI-GAME LAUNCHER ===

    launchMinigame(type, onDone) {
        this.inMinigame = true;
        this.setGameButtons(false);
        this.minigameOverlay.classList.remove('hidden');
        // Hide game screen content behind overlay
        this.screens.game.classList.add('hidden');

        const onComplete = (quality) => {
            this.minigameOverlay.classList.add('hidden');
            this.screens.game.classList.remove('hidden');
            this.inMinigame = false;
            this.updateButtonVisibility();
            onDone(quality);
        };

        if (type === 'catch') {
            this.minigameTitle.textContent = '\u{1F3AE} Catch Game!';
            new CatchGame(this.minigameArea, this.minigameHud, onComplete);
        } else if (type === 'memory') {
            this.minigameTitle.textContent = '\u{1F9E0} Memory Game!';
            new MemoryGame(this.minigameArea, this.minigameHud, onComplete);
        } else if (type === 'mash') {
            this.minigameTitle.textContent = '\u{1F4A5} Mash It!';
            new MashGame(this.minigameArea, this.minigameHud, onComplete);
        }
    }

    // === ACTIONS ===

    feed() {
        if (!this.isAlive || this.isSleeping || this.inMinigame) return;

        if (this.stats.hunger >= 100) {
            this.showReaction('\u{1F645}');
            this.moodText.textContent = "I'm full!";
            return;
        }

        const food = FOOD_MENU[randomInt(0, FOOD_MENU.length - 1)];
        const hungerGain = this.applyActionBonus('feed', 'hunger', 20);
        this.stats.hunger = Math.min(100, this.stats.hunger + hungerGain);
        this.stats.happiness = Math.min(100, this.stats.happiness + 5);
        this.stats.cleanliness = Math.max(0, this.stats.cleanliness - 3);

        this.showReaction(food);
        this.petSprite.className = 'pet eating';
        setTimeout(() => {
            this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        }, 900);

        if (this.personality && this.personality.favAction === 'feed') {
            this.showSpeech('Yummy! My favorite!');
        }

        this.updateBars();
        this.updateMood();
    }

    play() {
        if (!this.isAlive || this.isSleeping || this.inMinigame) return;

        if (this.stats.energy < 10) {
            this.showReaction('\u{1F62B}');
            this.moodText.textContent = 'Too tired to play...';
            return;
        }

        // Launch catch mini-game
        this.launchMinigame('catch', (quality) => {
            const mult = quality === 'perfect' ? 1.5 : quality === 'good' ? 1.0 : 0.3;
            this.stats.happiness = Math.min(100, this.stats.happiness + Math.round(25 * mult));
            this.stats.energy = Math.max(0, this.stats.energy - 15);
            this.stats.hunger = Math.max(0, this.stats.hunger - 8);
            this.stats.cleanliness = Math.max(0, this.stats.cleanliness - 5);

            if (this.stage.stats.includes('social')) {
                this.stats.social = Math.min(100, this.stats.social + Math.round(8 * mult));
            }
            if (this.stage.stats.includes('boredom')) {
                this.stats.boredom = Math.min(100, this.stats.boredom + Math.round(5 * mult));
            }
            if (this.stage.stats.includes('fitness')) {
                this.stats.fitness = Math.min(100, this.stats.fitness + Math.round(5 * mult));
            }

            if (quality === 'perfect') this.showSpeech('That was amazing!');
            else if (quality === 'fail') this.showSpeech('Aww, better luck next time...');

            this.updateBars();
            this.updateMood();
        });
    }

    petAction() {
        if (!this.isAlive || this.isSleeping || this.inMinigame) return;
        if (!this.stage.stats.includes('social')) return;

        const socialGain = this.applyActionBonus('pet', 'social', 25);
        this.stats.social = Math.min(100, this.stats.social + socialGain);
        this.stats.happiness = Math.min(100, this.stats.happiness + 10);

        const reactions = ['\u{1F49B}', '\u{1F495}', '\u{1F970}', '\u{1F497}', '\u{1F60A}'];
        this.showReaction(reactions[randomInt(0, reactions.length - 1)]);

        this.petSprite.className = 'pet eating';
        setTimeout(() => {
            this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        }, 900);

        if (this.personality && this.personality.favAction === 'pet') {
            this.showSpeech('I love you!');
        }

        this.updateBars();
        this.updateMood();
    }

    study() {
        if (!this.isAlive || this.isSleeping || this.inMinigame) return;
        if (!this.stage.stats.includes('boredom')) return;

        if (this.stats.energy < 10) {
            this.showReaction('\u{1F62B}');
            this.moodText.textContent = 'Too tired to study...';
            return;
        }

        // Launch memory mini-game
        this.launchMinigame('memory', (quality) => {
            const mult = quality === 'perfect' ? 1.5 : quality === 'good' ? 1.0 : 0.3;
            const boredomGain = this.applyActionBonus('study', 'boredom', Math.round(30 * mult));
            this.stats.boredom = Math.min(100, this.stats.boredom + boredomGain);
            this.stats.energy = Math.max(0, this.stats.energy - 10);
            this.stats.happiness = Math.min(100, this.stats.happiness + Math.round(5 * mult));

            if (this.stage.stats.includes('social')) {
                this.stats.social = Math.max(0, this.stats.social - 5);
            }

            if (quality === 'perfect') this.showSpeech('Big brain time!');
            else if (quality === 'fail') this.showSpeech('This is hard...');

            this.updateBars();
            this.updateMood();
        });
    }

    train() {
        if (!this.isAlive || this.isSleeping || this.inMinigame) return;
        if (!this.stage.stats.includes('fitness')) return;

        if (this.stats.energy < 15) {
            this.showReaction('\u{1F62B}');
            this.moodText.textContent = 'Too tired to train...';
            return;
        }

        // Launch mash mini-game
        this.launchMinigame('mash', (quality) => {
            const mult = quality === 'perfect' ? 1.5 : quality === 'good' ? 1.0 : 0.3;
            const fitnessGain = this.applyActionBonus('train', 'fitness', Math.round(25 * mult));
            this.stats.fitness = Math.min(100, this.stats.fitness + fitnessGain);
            this.stats.energy = Math.max(0, this.stats.energy - 20);
            this.stats.hunger = Math.max(0, this.stats.hunger - 10);
            this.stats.happiness = Math.min(100, this.stats.happiness + Math.round(8 * mult));

            if (quality === 'perfect') this.showSpeech('BEAST MODE!');
            else if (quality === 'fail') this.showSpeech('Need more practice...');

            this.updateBars();
            this.updateMood();
        });
    }

    toggleSleep() {
        if (!this.isAlive || this.inMinigame) return;

        if (this.isSleeping) {
            this.wakeUp();
        } else {
            this.isSleeping = true;
            this.petSprite.className = 'pet sleeping';
            this.screenEl.classList.add('night');
            this.showReaction('\u{1F4A4}');
            this.moodText.textContent = 'Zzz...';
        }
    }

    wakeUp() {
        this.isSleeping = false;
        this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        this.screenEl.classList.remove('night');
        this.showReaction('\u2600\uFE0F');
        this.moodText.textContent = 'Good morning!';
    }

    clean() {
        if (!this.isAlive || this.isSleeping || this.inMinigame) return;

        const cleanGain = this.applyActionBonus('clean', 'cleanliness', 30);
        this.stats.cleanliness = Math.min(100, this.stats.cleanliness + cleanGain);
        this.poopCount = Math.max(0, this.poopCount - 1);
        this.stats.happiness = Math.min(100, this.stats.happiness + 5);

        this.showReaction('\u2728');

        if (this.personality && this.personality.favAction === 'clean') {
            this.showSpeech('Sparkly clean!');
        }

        this.updateBars();
        this.updatePoop();
        this.updateMood();
    }

    heal() {
        if (!this.isAlive || !this.isSick || this.inMinigame) return;

        this.isSick = false;
        this.stats.hunger = Math.min(100, this.stats.hunger + 10);
        this.stats.happiness = Math.min(100, this.stats.happiness + 10);

        this.petSprite.className = 'pet';
        this.showReaction('\u{1F496}');
        this.moodText.textContent = 'Feeling better!';
        this.updateBars();
    }

    // === UI UPDATES ===

    showReaction(emoji) {
        this.reactionEl.textContent = emoji;
        this.reactionEl.classList.remove('show');
        void this.reactionEl.offsetWidth;
        this.reactionEl.classList.add('show');
        setTimeout(() => this.reactionEl.classList.remove('show'), 1500);
    }

    updateBars() {
        for (const stat of this.stage.stats) {
            const bar = this.bars[stat];
            if (!bar) continue;
            const value = this.stats[stat];
            bar.style.width = value + '%';
            if (value < 25) {
                bar.classList.add('low');
            } else {
                bar.classList.remove('low');
            }
        }
    }

    updatePetState() {
        if (this.isSleeping) return;
        if (this.isSick) {
            this.petSprite.className = 'pet sick';
        } else {
            this.petSprite.className = 'pet';
        }
    }

    updateMood() {
        if (this.isSleeping) return;
        if (this.isSick) {
            this.moodText.textContent = "I don't feel well...";
            return;
        }
        const activeStats = this.stage.stats;
        const avg = activeStats.reduce((sum, s) => sum + this.stats[s], 0) / activeStats.length;
        for (const mood of MOODS) {
            if (avg >= mood.min) {
                this.moodText.textContent = mood.text;
                break;
            }
        }
    }

    updatePoop() {
        if (this.poopCount > 0) {
            this.poopEl.classList.remove('hidden');
            this.poopEl.textContent = '\u{1F4A9}'.repeat(Math.min(this.poopCount, 3));
        } else {
            this.poopEl.classList.add('hidden');
        }
    }

    die() {
        this.isAlive = false;
        clearInterval(this.gameInterval);
        this.setGameButtons(false);
        this.screenEl.classList.remove('night');

        const msg = document.getElementById('death-message');
        msg.textContent = `${this.name} (${this.personality.name}) passed away at age ${this.age}... Take better care next time!`;
        this.showScreen('death');
    }

    restart() {
        clearInterval(this.gameInterval);
        this.name = '';
        this.age = 0;
        ALL_STATS.forEach(s => this.stats[s] = 80);
        this.stats.energy = 100;
        this.stats.cleanliness = 100;
        this.personality = null;
        this.isSick = false;
        this.isSleeping = false;
        this.isAlive = true;
        this.inMinigame = false;
        this.poopCount = 0;
        this.tickCount = 0;
        this.stage = STAGES[0];
        this.screenEl.classList.remove('night');
        this.poopEl.classList.add('hidden');
        this.speechBubble.classList.add('hidden');
        this.nameInput.value = '';
        this.setGameButtons(false);
        this.btnGroups.pet.classList.add('hidden');
        this.btnGroups.study.classList.add('hidden');
        this.btnGroups.train.classList.add('hidden');
        this.showScreen('start');
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Start the game
const game = new Tamagotchi();
