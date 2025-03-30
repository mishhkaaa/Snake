import { CONFIG } from './config.js';

let soundEnabled = true;
const audioElements = {};

export async function loadAudio() {
    try {
        // Load saved settings
        const settings = JSON.parse(localStorage.getItem('snakeSettings')) || {};
        soundEnabled = settings.soundEnabled !== false; // Default to true
        
        audioElements.eat = document.getElementById('eatSound');
        audioElements.gameOver = document.getElementById('gameOverSound');
        await Promise.all([audioElements.eat.load(), audioElements.gameOver.load()]);
    } catch (error) {
        console.error('Audio error:', error);
        soundEnabled = false;
    }
}

export function playSound(type) {
    if (soundEnabled && audioElements[type]) {
        if (!audioElements[type].canPlayType("audio/wav")) {
            console.warn(`Audio format not supported: ${type}`);
            return;
        }
        audioElements[type].currentTime = 0;
        audioElements[type].play().catch(e => console.log('Audio play failed:', e));
    }
}


export function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}

export function isSoundEnabled() {
    return soundEnabled;
}

window.toggleSound = toggleSound;
window.isSoundEnabled = isSoundEnabled;
