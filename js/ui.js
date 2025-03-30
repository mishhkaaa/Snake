import { CONFIG, DIRECTIONS } from './config.js';
import { togglePause, changeDirection } from './game.js';
import { toggleSound, isSoundEnabled } from './audio.js';
import { displayLeaderboard } from './leaderboard.js';
import { formatTime } from './utilities.js';
import { initGame } from './game.js';


// Game state
let isGameOver = false;

// DOM elements
let scoreElement;
let timerElement;
let pauseButton;
let soundButton;
let themeButton;
let difficultySelect;
let difficultyIndicator;

export function updateUI({ score, timer }) {
    if (score !== undefined && scoreElement) {
        scoreElement.textContent = score;
    }
    if (timer !== undefined && timerElement) {
        timerElement.textContent = formatTime(timer);
    }
}

export async function showSetupScreen() {
    return new Promise((resolve) => {
        const setupHTML = `
            <div class="overlay active" id="setupScreen">
                <div class="overlay-content setup-screen">
                    <h2>Snake Game</h2>
                    <div class="setup-form">
                        <input type="text" id="playerName" placeholder="Enter your name" required />
                        <select id="difficultySelect">
                            <option value="easy">Easy</option>
                            <option value="medium" selected>Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                        <button id="startGameBtn">Start Game</button>
                    </div>
                    <div class="instructions">
                        <h3>How to Play:</h3>
                        <ul>
                            <li>Use arrow keys (↑ ↓ ← →) to control the snake</li>
                            <li>Eat the red food to grow longer</li>
                            <li>Avoid hitting walls or yourself</li>
                            <li>Press SPACE or the pause button to pause</li>
                            <li>Higher difficulty = faster speed</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', setupHTML);

        document.getElementById('startGameBtn').addEventListener('click', () => {
            const playerName = document.getElementById('playerName').value || 'Player';
            const difficulty = document.getElementById('difficultySelect').value;
            isGameOver = false;

            document.getElementById('setupScreen').remove();
            initializeGameUI();
            resolve({ playerName, difficulty });
        });
    });
}

export function showGameOverScreen({ score, time }) {
    console.log("🔥 showGameOverScreen() is being called!");
    isGameOver = true;

    const gameOverHTML = `
        <div class="overlay active" id="gameOverScreen">
            <div class="overlay-content game-over-screen">
                <h2>Game Over!</h2>
                <p>Score: <span id="finalScore">${score}</span></p>
                <p>Time: <span id="finalTime">${formatTime(time)}</span></p>
                <div class="leaderboard">
                    <h3>Top Scores</h3>
                    <ol id="leaderboardList"></ol>
                </div>
                <button class="btn" id="restartButton">Play Again</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', gameOverHTML);
    displayLeaderboard();

    setTimeout(() => {
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            console.log("Adding event listener to Play Again button");
            restartButton.onclick = async () => {
                console.log("Play Again button clicked!");
                document.getElementById('gameOverScreen').remove();
                const settings = await showSetupScreen();
                initGame(settings);
            };
        } else {
            console.error("Restart button not found!");
        }
    }, 100);

    setTimeout(() => {
        const leaderboardList = document.getElementById('leaderboardList');
        if (leaderboardList) {
            console.log("✅ Leaderboard list found, updating...");
            displayLeaderboard(getLeaderboard());
        } else {
            console.error("❌ leaderboardList is still missing from DOM!");
        }
    }, 100);

    const resetContainer = document.createElement("div");
    resetContainer.style.textAlign = "center";  // Centers content

    const resetLeaderboardBtn = document.createElement("button");
    resetLeaderboardBtn.textContent = "Reset Leaderboard";
    resetLeaderboardBtn.classList.add("btn");
    resetLeaderboardBtn.addEventListener("click", () => {
        localStorage.removeItem("snakeLeaderboard");
        console.log("✅ Leaderboard has been reset!");
        displayLeaderboard([]); // Refresh the UI
    });

    resetContainer.appendChild(resetLeaderboardBtn);
    document.querySelector(".leaderboard").appendChild(resetContainer);

}

function initializeGameUI() {


    // Wait for UI to be inserted before attaching listeners
    let retryCount = 0; // Initialize retry count
    const maxRetries = 5; // Set maximum retries
    console.log("🛠 Initializing Game UI...");


    const checkUIElements = () => {
        soundButton = document.getElementById('soundToggle');
        themeButton = document.getElementById('themeToggle');

        console.log("🔎 Checking UI Elements...");
        console.log("🔊 Sound Button:", soundButton);
        console.log("🌗 Theme Button:", themeButton);

        if (!soundButton || !themeButton) {
            retryCount++;
            if (retryCount < maxRetries) {
                console.error("❌ UI elements missing! Retrying...");
                setTimeout(checkUIElements, 50); // Retry if elements are missing
            } else {
                console.error("❌ Maximum retries reached. UI elements are still missing.");
            }
        } else {
            setupEventListeners();
        }
    };

    setTimeout(checkUIElements, 50);

    // Remove existing UI container if it exists
    const existingUIContainer = document.querySelector('.ui-container');
    if (existingUIContainer) {
        existingUIContainer.remove();
    }


    // Create container for UI controls above canvas
    const uiContainer = document.createElement('div');
    uiContainer.className = 'ui-container';

    const gameUIHTML = `
        <div class="game-ui">
            <div class="game-info">
                <div class="score-display">Score: <span id="scoreValue">0</span></div>
                <div class="timer-display">Time: <span id="timerValue">00:00</span></div>
            </div>
            <div class="controls">
                <button id="themeToggle" class="control-btn" title="Toggle Theme">
                    <i class="fas ${document.body.classList.contains('dark-theme') ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
                <button id="soundToggle" class="control-btn" title="Toggle Sound">
                    <i class="fas ${isSoundEnabled() ? 'fa-volume-up' : 'fa-volume-mute'}"></i>
                </button>
                <select id="difficultySelect" class="control-btn" title="Difficulty">
                    <option value="easy">Easy</option>
                    <option value="medium" selected>Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <button id="pauseButton" class="control-btn" title="Pause">
                    <i class="fas fa-pause"></i>
                </button>
            </div>
        </div>
    `;

    function createHeaderAndFooter() {
        // Check if header/footer already exists
        if (document.getElementById('gameHeader') || document.getElementById('gameFooter')) {
            return; // Prevent duplicates
        }
    
        // Create header
        const header = document.createElement('header');
        header.id = 'gameHeader';
        header.innerHTML = `
            <h2>🐍 Snake Game</h2>
        `;
        
        
    
        // Insert into the document
        document.body.prepend(header);
    }
    
    // Call this function in initializeGameUI()
    createHeaderAndFooter();
    

    uiContainer.innerHTML = gameUIHTML;

    // Insert UI container before the canvas
    const gameContainer = document.querySelector('.game-container');
    const canvasContainer = document.getElementById('gameCanvasContainer');
    gameContainer.insertBefore(uiContainer, canvasContainer);

    // Get references to UI elements
    scoreElement = document.getElementById('scoreValue');
    timerElement = document.getElementById('timerValue');
    pauseButton = document.getElementById('pauseButton');
    soundButton = document.getElementById('soundToggle');
    themeButton = document.getElementById('themeToggle');
    difficultySelect = document.getElementById('difficultySelect');

    // Add difficulty indicator
    if (!difficultyIndicator) {
        difficultyIndicator = document.createElement('div');
        difficultyIndicator.className = 'difficulty-indicator';
        difficultyIndicator.id = 'difficultyIndicator';
        difficultyIndicator.textContent = difficultySelect.value;
        document.querySelector('.game-info').appendChild(difficultyIndicator);
    }


    // Set up event listeners
    setupEventListeners();
    // Wait for next tick to ensure DOM is updated
    setTimeout(() => {
        scoreElement = document.getElementById('scoreValue');
        timerElement = document.getElementById('timerValue');
        pauseButton = document.getElementById('pauseButton');
        soundButton = document.getElementById('soundToggle');
        themeButton = document.getElementById('themeToggle');
        difficultySelect = document.getElementById('difficultySelect');

        if (!pauseButton || !soundButton || !themeButton) {
            console.error("UI elements missing! Retrying...");
            setTimeout(initializeGameUI, 50);
            return;
        }

        setupEventListeners();
    }, 0);
}

function setupEventListeners() {
    console.log("🛠 Adding event listeners...");
    removeExistingEventListeners(); // Ensure no duplicate event listeners


    console.log("Initializing event listeners...");
    console.log("Pause button:", pauseButton);
    console.log("Sound button:", soundButton);
    console.log("Theme button:", themeButton);

    // Pause button
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            const isPaused = togglePause();
            pauseButton.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
        });
    }

    // In initializeGameUI():
    if (soundButton) {
        soundButton.innerHTML = isSoundEnabled()
            ? '<i class="fas fa-volume-up"></i>'
            : '<i class="fas fa-volume-mute"></i>';
    }

    // Sound toggle
    if (soundButton) {
        soundButton.addEventListener('click', () => {
            const soundOn = toggleSound();
            soundButton.innerHTML = soundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        });
    }

    // Theme toggle
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
    }

    // Difficulty change
    if (difficultySelect) {
        difficultySelect.addEventListener('change', () => {
            difficultyIndicator.textContent = difficultySelect.value;
            localStorage.setItem('snakeDifficulty', difficultySelect.value);
        });
    }

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
}

// 🔥 Ensure no duplicate event listeners
function removeExistingEventListeners() {
    const newPauseButton = document.getElementById('pauseButton');
    const newSoundButton = document.getElementById('soundToggle');
    const newThemeButton = document.getElementById('themeToggle');
    const newDifficultySelect = document.getElementById('difficultySelect');

    if (newPauseButton) {
        newPauseButton.replaceWith(newPauseButton.cloneNode(true));
        pauseButton = document.getElementById('pauseButton');
    }
    if (newSoundButton) {
        newSoundButton.replaceWith(newSoundButton.cloneNode(true));
        soundButton = document.getElementById('soundToggle');
    }
    if (newThemeButton) {
        newThemeButton.replaceWith(newThemeButton.cloneNode(true));
        themeButton = document.getElementById('themeToggle');
    }
    if (newDifficultySelect) {
        newDifficultySelect.replaceWith(newDifficultySelect.cloneNode(true));
        difficultySelect = document.getElementById('difficultySelect');
    }
}


function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('snakeTheme', isDark ? 'dark' : 'light');

    // Force update all theme-dependent elements
    document.querySelectorAll('.theme-dependent').forEach(el => {
        el.classList.toggle('dark-theme', isDark);
    });

    // Update button icon
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        themeButton.innerHTML = isDark
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }
}

function handleKeyDown(event) {
    if (isGameOver) return;

    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            changeDirection(DIRECTIONS.UP);
            break;
        case 'ArrowDown':
            event.preventDefault();
            changeDirection(DIRECTIONS.DOWN);
            break;
        case 'ArrowLeft':
            event.preventDefault();
            changeDirection(DIRECTIONS.LEFT);
            break;
        case 'ArrowRight':
            event.preventDefault();
            changeDirection(DIRECTIONS.RIGHT);
            break;
        case ' ':
            event.preventDefault();
            const isPaused = togglePause();
            pauseButton.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
            break;
    }
}

// Initialize theme from localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('snakeTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    // Update theme button icon if it exists
    if (themeButton) {
        themeButton.innerHTML = document.body.classList.contains('dark-theme')
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }
}

// Initialize when module loads
initializeTheme();
