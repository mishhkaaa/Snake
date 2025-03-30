export const CONFIG = {
    GRID_SIZE: 10,
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 400,
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