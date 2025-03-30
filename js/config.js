export const CONFIG = {
    GRID_SIZE: 20,
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 600,
    INITIAL_SPEED: {
        easy: 200,
        medium: 150,
        hard: 100
    },
    SPEED_INCREMENT: 2,
    MIN_SPEED: 50,
    SCORE_INCREMENT: 10,
    SNAKE_START_LENGTH: 3,
    AUDIO: {
        EAT: '/sounds/eat.wav',
        GAME_OVER: '/sounds/GameOver.wav'
    }
};

export const DIRECTIONS = {
    UP: { dx: 0, dy: -CONFIG.GRID_SIZE },
    DOWN: { dx: 0, dy: CONFIG.GRID_SIZE },
    LEFT: { dx: -CONFIG.GRID_SIZE, dy: 0 },
    RIGHT: { dx: CONFIG.GRID_SIZE, dy: 0 }
};