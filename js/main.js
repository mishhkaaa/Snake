import { initGame } from './game.js';
import { showSetupScreen } from './ui.js';
import { loadAudio } from './audio.js';

let playerName = 'Player';
let difficulty = 'medium';

document.addEventListener('DOMContentLoaded', async () => {
    await initializeGame();
});

async function initializeGame() {
    await loadAudio();
    const settings = await showSetupScreen();
    initGame(settings);
}

// Fix event listeners
window.addEventListener('gameRestart', async () => {
    console.log("Game restart event triggered");
    const difficulty = document.getElementById('difficultySelect')?.value || 'medium';
    initGame({ playerName, difficulty });
});

// Fix Play Again button
window.addEventListener('showSetupScreen', async () => {
    console.log("Setup screen triggered");
    const settings = await showSetupScreen();
    initGame(settings);
});
