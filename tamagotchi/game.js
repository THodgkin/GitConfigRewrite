// Tamagotchi Game

const STAGES = [
    { name: 'baby', minAge: 0, sprite: '🐣', evolvesAt: 5 },
    { name: 'child', minAge: 5, sprite: '🐥', evolvesAt: 15 },
    { name: 'teen', minAge: 15, sprite: '🐤', evolvesAt: 30 },
    { name: 'adult', minAge: 30, sprite: '🐔', evolvesAt: null },
];

const MOODS = [
    { min: 80, text: 'Feeling great! ♪', },
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
        this.hunger = 80;
        this.happiness = 80;
        this.energy = 100;
        this.cleanliness = 100;
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
        this.moodText = document.getElementById('mood-text');
        this.bars = {
            hunger: document.getElementById('hunger-bar'),
            happiness: document.getElementById('happy-bar'),
            energy: document.getElementById('energy-bar'),
            cleanliness: document.getElementById('clean-bar'),
        };
        this.buttons = {
            start: document.getElementById('btn-start'),
            feed: document.getElementById('btn-feed'),
            play: document.getElementById('btn-play'),
            sleep: document.getElementById('btn-sleep'),
            clean: document.getElementById('btn-clean'),
            heal: document.getElementById('btn-heal'),
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
        this.setGameButtons(true);
        this.petSprite.textContent = this.stage.sprite;
        this.updateBars();
        this.updateMood();
        this.startGameLoop();
    }

    setGameButtons(enabled) {
        ['feed', 'play', 'sleep', 'clean', 'heal'].forEach(b => {
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

        // Stat decay
        if (!this.isSleeping) {
            this.hunger = Math.max(0, this.hunger - randomInt(1, 3));
            this.happiness = Math.max(0, this.happiness - randomInt(0, 2));
            this.energy = Math.max(0, this.energy - randomInt(1, 2));
        } else {
            // Sleeping restores energy
            this.energy = Math.min(100, this.energy + 5);
            this.hunger = Math.max(0, this.hunger - 1);
            // Wake up when fully rested
            if (this.energy >= 100) {
                this.wakeUp();
            }
        }

        // Cleanliness decays
        this.cleanliness = Math.max(0, this.cleanliness - randomInt(0, 2));

        // Poop chance
        if (!this.isSleeping && this.tickCount % 10 === 0 && Math.random() < 0.4) {
            this.poopCount++;
            this.cleanliness = Math.max(0, this.cleanliness - 10);
        }

        // Sickness chance when stats are low
        if (!this.isSick && (this.hunger < 20 || this.cleanliness < 20)) {
            if (Math.random() < 0.15) {
                this.isSick = true;
            }
        }

        // Sickness drains stats faster
        if (this.isSick) {
            this.happiness = Math.max(0, this.happiness - 3);
            this.hunger = Math.max(0, this.hunger - 2);
        }

        // Check death
        if (this.hunger <= 0 && this.happiness <= 0 && this.energy <= 0) {
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
                    this.stage = STAGES[i];
                    this.petSprite.textContent = this.stage.sprite;
                    this.showReaction('⭐');
                }
                break;
            }
        }
    }

    feed() {
        if (!this.isAlive || this.isSleeping) return;

        if (this.hunger >= 100) {
            this.showReaction('🙅');
            this.moodText.textContent = "I'm full!";
            return;
        }

        const food = FOOD_MENU[randomInt(0, FOOD_MENU.length - 1)];
        this.hunger = Math.min(100, this.hunger + 20);
        this.happiness = Math.min(100, this.happiness + 5);
        this.cleanliness = Math.max(0, this.cleanliness - 3);

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

        if (this.energy < 10) {
            this.showReaction('😫');
            this.moodText.textContent = 'Too tired to play...';
            return;
        }

        this.happiness = Math.min(100, this.happiness + 25);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.max(0, this.hunger - 8);
        this.cleanliness = Math.max(0, this.cleanliness - 5);

        const reactions = ['🎵', '🎉', '⭐', '💕', '🌟'];
        this.showReaction(reactions[randomInt(0, reactions.length - 1)]);

        this.petSprite.className = 'pet playing';
        setTimeout(() => {
            this.petSprite.className = 'pet' + (this.isSick ? ' sick' : '');
        }, 1600);

        this.updateBars();
        this.updateMood();
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

        this.cleanliness = Math.min(100, this.cleanliness + 30);
        this.poopCount = Math.max(0, this.poopCount - 1);
        this.happiness = Math.min(100, this.happiness + 5);

        this.showReaction('✨');
        this.updateBars();
        this.updatePoop();
        this.updateMood();
    }

    heal() {
        if (!this.isAlive || !this.isSick) return;

        this.isSick = false;
        this.hunger = Math.min(100, this.hunger + 10);
        this.happiness = Math.min(100, this.happiness + 10);

        this.petSprite.className = 'pet';
        this.showReaction('💖');
        this.moodText.textContent = 'Feeling better!';
        this.updateBars();
    }

    showReaction(emoji) {
        this.reactionEl.textContent = emoji;
        this.reactionEl.classList.remove('show');
        // Trigger reflow
        void this.reactionEl.offsetWidth;
        this.reactionEl.classList.add('show');
        setTimeout(() => this.reactionEl.classList.remove('show'), 1500);
    }

    updateBars() {
        const stats = {
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy,
            cleanliness: this.cleanliness,
        };

        for (const [key, value] of Object.entries(stats)) {
            const bar = this.bars[key];
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
        const avg = (this.hunger + this.happiness + this.energy + this.cleanliness) / 4;
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
        this.hunger = 80;
        this.happiness = 80;
        this.energy = 100;
        this.cleanliness = 100;
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
        this.showScreen('start');
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Start the game
const game = new Tamagotchi();
