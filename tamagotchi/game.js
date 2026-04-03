// Tamagotchi Game

const STAGES = [
    {
        name: 'baby', minAge: 0, sprite: '🐣', evolvesAt: 5,
        stats: ['hunger', 'happiness', 'energy', 'cleanliness'],
        decayRates: { hunger: [2, 4], happiness: [1, 3], energy: [2, 3], cleanliness: [1, 2] },
    },
    {
        name: 'child', minAge: 5, sprite: '🐥', evolvesAt: 15,
        stats: ['hunger', 'happiness', 'energy', 'cleanliness', 'social'],
        decayRates: { hunger: [1, 3], happiness: [1, 2], energy: [1, 2], cleanliness: [1, 2], social: [1, 3] },
    },
    {
        name: 'teen', minAge: 15, sprite: '🐤', evolvesAt: 30,
        stats: ['hunger', 'happiness', 'energy', 'cleanliness', 'social', 'boredom'],
        decayRates: { hunger: [1, 2], happiness: [1, 2], energy: [1, 2], cleanliness: [0, 1], social: [2, 4], boredom: [1, 3] },
    },
    {
        name: 'adult', minAge: 30, sprite: '🐔', evolvesAt: null,
        stats: ['hunger', 'happiness', 'energy', 'cleanliness', 'social', 'boredom', 'fitness'],
        decayRates: { hunger: [1, 2], happiness: [0, 1], energy: [1, 2], cleanliness: [0, 1], social: [1, 2], boredom: [1, 2], fitness: [1, 3] },
    },
];

const STAT_CONFIG = {
    hunger:      { icon: '🍔', label: 'Hunger' },
    happiness:   { icon: '😊', label: 'Happy' },
    energy:      { icon: '💤', label: 'Energy' },
    cleanliness: { icon: '🧼', label: 'Clean' },
    social:      { icon: '💛', label: 'Social' },
    boredom:     { icon: '📚', label: 'Stimulation' },
    fitness:     { icon: '💪', label: 'Fitness' },
};

const ALL_STATS = ['hunger', 'happiness', 'energy', 'cleanliness', 'social', 'boredom', 'fitness'];

const MOODS = [
    { min: 80, text: 'Feeling great! ♪' },
    { min: 60, text: 'Doing okay~' },
    { min: 40, text: 'Not so good...' },
    { min: 20, text: 'Feeling terrible!' },
    { min: 0, text: 'Help me...' },
];

const FOOD_MENU = ['🍔', '🍕', '🍎', '🍰', '🍣', '🥕'];

class Tamagotchi {
    constructor() {
        this.name = '';
        this.age = 0;
        this.stats = {};
        ALL_STATS.forEach(s => this.stats[s] = 80);
        this.stats.energy = 100;
        this.stats.cleanliness = 100;
        this.isSick = false;
        this.isSleeping = false;
        this.isAlive = true;
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
            game: document.getElementById('game-screen'),
            death: document.getElementById('death-screen'),
        };
        this.screenEl = document.getElementById('screen');
        this.petSprite = document.getElementById('pet-sprite');
        this.reactionEl = document.getElementById('reaction');
        this.poopEl = document.getElementById('poop');
        this.nameDisplay = document.getElementById('pet-name-display');
        this.ageDisplay = document.getElementById('age-display');
        this.stageDisplay = document.getElementById('stage-display');
        this.moodText = document.getElementById('mood-text');
        this.statsContainer = document.getElementById('stats-container');
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
        this.restartBtn.addEventListener('click', () => this.restart());
    }

    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        this.screens[name].classList.remove('hidden');
    }

    hatch() {
        this.showScreen('name');
        this.nameInput.focus();
    }

    confirmName() {
        const name = this.nameInput.value.trim();
        if (!name) return;
        this.name = name;
        this.nameDisplay.textContent = name;
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

            // Hide stats not active for current stage
            if (!this.stage.stats.includes(stat)) {
                row.classList.add('hidden');
            }
        });
    }

    updateButtonVisibility() {
        const activeStats = this.stage.stats;
        // Pet button unlocks with social (child+)
        this.btnGroups.pet.classList.toggle('hidden', !activeStats.includes('social'));
        // Study button unlocks with boredom (teen+)
        this.btnGroups.study.classList.toggle('hidden', !activeStats.includes('boredom'));
        // Train button unlocks with fitness (adult)
        this.btnGroups.train.classList.toggle('hidden', !activeStats.includes('fitness'));

        // Enable all visible action buttons
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

    tick() {
        if (!this.isAlive) return;

        this.tickCount++;

        // Age every 20 ticks (~60s)
        if (this.tickCount % 20 === 0) {
            this.age++;
            this.ageDisplay.textContent = `Age: ${this.age}`;
            this.checkEvolution();
        }

        // Stat decay based on current stage's rates
        const rates = this.stage.decayRates;
        if (!this.isSleeping) {
            for (const stat of this.stage.stats) {
                const [min, max] = rates[stat];
                this.stats[stat] = Math.max(0, this.stats[stat] - randomInt(min, max));
            }
        } else {
            // Sleeping restores energy, slowly drains hunger
            this.stats.energy = Math.min(100, this.stats.energy + 5);
            this.stats.hunger = Math.max(0, this.stats.hunger - 1);
            // Social decays while sleeping (lonely)
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

        // Sickness chance when stats are low
        if (!this.isSick) {
            const lowStats = this.stage.stats.filter(s => this.stats[s] < 20);
            const sickChance = lowStats.length * 0.08;
            if (sickChance > 0 && Math.random() < sickChance) {
                this.isSick = true;
            }
        }

        // Sickness drains stats faster
        if (this.isSick) {
            this.stats.happiness = Math.max(0, this.stats.happiness - 3);
            this.stats.hunger = Math.max(0, this.stats.hunger - 2);
        }

        // Check death - all active stats at zero
        const activeStats = this.stage.stats;
        const allZero = activeStats.every(s => this.stats[s] <= 0);
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
                    this.showReaction('⭐');
                    this.stageDisplay.textContent = this.stage.name;

                    // Initialize newly unlocked stats at 70 (not full, gives urgency)
                    const newStats = this.stage.stats.filter(s => !oldStage.stats.includes(s));
                    newStats.forEach(s => this.stats[s] = 70);

                    // Reveal new stat bars with animation
                    newStats.forEach(s => {
                        if (this.statRows[s]) {
                            this.statRows[s].classList.remove('hidden');
                            this.statRows[s].classList.add('stat-new');
                            setTimeout(() => this.statRows[s].classList.remove('stat-new'), 2000);
                        }
                    });

                    // Show/hide new buttons
                    this.updateButtonVisibility();

                    // Flash a notification
                    this.moodText.textContent = `Evolved into ${this.stage.name}!`;
                }
                break;
            }
        }
    }

    // === ACTIONS ===

    feed() {
        if (!this.isAlive || this.isSleeping) return;

        if (this.stats.hunger >= 100) {
            this.showReaction('🙅');
            this.moodText.textContent = "I'm full!";
            return;
        }

        const food = FOOD_MENU[randomInt(0, FOOD_MENU.length - 1)];
        this.stats.hunger = Math.min(100, this.stats.hunger + 20);
        this.stats.happiness = Math.min(100, this.stats.happiness + 5);
        this.stats.cleanliness = Math.max(0, this.stats.cleanliness - 3);

        this.showReaction(food);
        this.petSprite.className = 'pet eating';
        setTimeout(() => {
            this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        }, 900);

        this.updateBars();
        this.updateMood();
    }

    play() {
        if (!this.isAlive || this.isSleeping) return;

        if (this.stats.energy < 10) {
            this.showReaction('😫');
            this.moodText.textContent = 'Too tired to play...';
            return;
        }

        this.stats.happiness = Math.min(100, this.stats.happiness + 25);
        this.stats.energy = Math.max(0, this.stats.energy - 15);
        this.stats.hunger = Math.max(0, this.stats.hunger - 8);
        this.stats.cleanliness = Math.max(0, this.stats.cleanliness - 5);
        // Playing helps social and boredom a little
        if (this.stage.stats.includes('social')) {
            this.stats.social = Math.min(100, this.stats.social + 8);
        }
        if (this.stage.stats.includes('boredom')) {
            this.stats.boredom = Math.min(100, this.stats.boredom + 5);
        }
        if (this.stage.stats.includes('fitness')) {
            this.stats.fitness = Math.min(100, this.stats.fitness + 5);
        }

        const reactions = ['🎵', '🎉', '⭐', '💕', '🌟'];
        this.showReaction(reactions[randomInt(0, reactions.length - 1)]);

        this.petSprite.className = 'pet playing';
        setTimeout(() => {
            this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        }, 1600);

        this.updateBars();
        this.updateMood();
    }

    petAction() {
        if (!this.isAlive || this.isSleeping) return;
        if (!this.stage.stats.includes('social')) return;

        this.stats.social = Math.min(100, this.stats.social + 25);
        this.stats.happiness = Math.min(100, this.stats.happiness + 10);

        const reactions = ['💛', '💕', '🥰', '💗', '😊'];
        this.showReaction(reactions[randomInt(0, reactions.length - 1)]);

        this.petSprite.className = 'pet eating'; // reuse the pulse animation
        setTimeout(() => {
            this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        }, 900);

        this.updateBars();
        this.updateMood();
    }

    study() {
        if (!this.isAlive || this.isSleeping) return;
        if (!this.stage.stats.includes('boredom')) return;

        if (this.stats.energy < 10) {
            this.showReaction('😫');
            this.moodText.textContent = 'Too tired to study...';
            return;
        }

        this.stats.boredom = Math.min(100, this.stats.boredom + 30);
        this.stats.energy = Math.max(0, this.stats.energy - 10);
        this.stats.happiness = Math.min(100, this.stats.happiness + 5);
        // Studying is a bit antisocial
        if (this.stage.stats.includes('social')) {
            this.stats.social = Math.max(0, this.stats.social - 5);
        }

        const reactions = ['📖', '💡', '🧠', '✏️', '🎓'];
        this.showReaction(reactions[randomInt(0, reactions.length - 1)]);

        this.moodText.textContent = 'Learning new things!';
        this.updateBars();
    }

    train() {
        if (!this.isAlive || this.isSleeping) return;
        if (!this.stage.stats.includes('fitness')) return;

        if (this.stats.energy < 15) {
            this.showReaction('😫');
            this.moodText.textContent = 'Too tired to train...';
            return;
        }

        this.stats.fitness = Math.min(100, this.stats.fitness + 25);
        this.stats.energy = Math.max(0, this.stats.energy - 20);
        this.stats.hunger = Math.max(0, this.stats.hunger - 10);
        this.stats.happiness = Math.min(100, this.stats.happiness + 8);

        const reactions = ['🏋️', '💪', '🔥', '⚡', '🏃'];
        this.showReaction(reactions[randomInt(0, reactions.length - 1)]);

        this.petSprite.className = 'pet playing';
        setTimeout(() => {
            this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        }, 1600);

        this.moodText.textContent = 'Getting stronger!';
        this.updateBars();
    }

    toggleSleep() {
        if (!this.isAlive) return;

        if (this.isSleeping) {
            this.wakeUp();
        } else {
            this.isSleeping = true;
            this.petSprite.className = 'pet sleeping';
            this.screenEl.classList.add('night');
            this.showReaction('💤');
            this.moodText.textContent = 'Zzz...';
        }
    }

    wakeUp() {
        this.isSleeping = false;
        this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        this.screenEl.classList.remove('night');
        this.showReaction('☀️');
        this.moodText.textContent = 'Good morning!';
    }

    clean() {
        if (!this.isAlive || this.isSleeping) return;

        this.stats.cleanliness = Math.min(100, this.stats.cleanliness + 30);
        this.poopCount = Math.max(0, this.poopCount - 1);
        this.stats.happiness = Math.min(100, this.stats.happiness + 5);

        this.showReaction('✨');
        this.updateBars();
        this.updatePoop();
        this.updateMood();
    }

    heal() {
        if (!this.isAlive || !this.isSick) return;

        this.isSick = false;
        this.stats.hunger = Math.min(100, this.stats.hunger + 10);
        this.stats.happiness = Math.min(100, this.stats.happiness + 10);

        this.petSprite.className = 'pet';
        this.showReaction('💖');
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
            this.poopEl.textContent = '💩'.repeat(Math.min(this.poopCount, 3));
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
        msg.textContent = `${this.name} has passed away at age ${this.age}... Take better care next time!`;
        this.showScreen('death');
    }

    restart() {
        clearInterval(this.gameInterval);
        this.name = '';
        this.age = 0;
        ALL_STATS.forEach(s => this.stats[s] = 80);
        this.stats.energy = 100;
        this.stats.cleanliness = 100;
        this.isSick = false;
        this.isSleeping = false;
        this.isAlive = true;
        this.poopCount = 0;
        this.tickCount = 0;
        this.stage = STAGES[0];
        this.screenEl.classList.remove('night');
        this.poopEl.classList.add('hidden');
        this.nameInput.value = '';
        this.setGameButtons(false);
        // Hide evolution buttons
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
