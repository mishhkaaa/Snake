export function getInitialSettings() {
    return {
        soundEnabled: true,
        theme: 'light',
        difficulty: 'medium'
    };
}

export function saveSettings(settings) {
    localStorage.setItem('snakeSettings', JSON.stringify(settings));
}

export function loadSettings() {
    const defaultSettings = getInitialSettings();
    const savedSettings = JSON.parse(localStorage.getItem('snakeSettings'));
    return { ...defaultSettings, ...savedSettings };
}