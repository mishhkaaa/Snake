import { CONFIG, DIRECTIONS } from './config.js';
import { updateUI, showGameOverScreen } from './ui.js';
import { playSound } from './audio.js';
import { updateLeaderboard } from './leaderboard.js';

let snake, food, currentDirection, nextDirection;
let score, timer, timerInterval;
let isPaused = false, isGameOver = false;
let speed, playerName, lastRenderTime;
let canvas, ctx;

export function initGame({ playerName: name, difficulty }) {
    cancelAnimationFrame(gameLoop);
    playerName = name;
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    const startX = Math.floor(CONFIG.CANVAS_WIDTH / 2 / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    const startY = Math.floor(CONFIG.CANVAS_HEIGHT / 2 / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    
    snake = [];
    for (let i = 0; i < CONFIG.SNAKE_START_LENGTH; i++) {
        snake.push({
            x: startX - (i * CONFIG.GRID_SIZE),
            y: startY,
            type: i === 0 ? 'head' : 'body'
        });
    }
    
    generateFood();
    currentDirection = nextDirection = DIRECTIONS.RIGHT;
    score = 0;
    isGameOver = isPaused = false;
    speed = CONFIG.INITIAL_SPEED[difficulty];
    timer = 0;
    
    updateUI({ score, timer });
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            timer++;
            updateUI({ timer });
        }
    }, 1000);
    
    lastRenderTime = 0;
    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (isPaused || isGameOver) {
        if (!isGameOver) window.requestAnimationFrame(gameLoop);
        return;
    }
    
    const secondsSinceLastRender = (timestamp - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / (1000 / speed)) {
        window.requestAnimationFrame(gameLoop);
        return;
    }
    lastRenderTime = timestamp;
    
    updateGame();
    renderGame();
    window.requestAnimationFrame(gameLoop);
}

function updateGame() {
    currentDirection = nextDirection;
    
    // Move snake
    const head = {
        x: snake[0].x + currentDirection.dx,
        y: snake[0].y + currentDirection.dy,
        type: 'head'
    };
    
    snake[0].type = 'body';
    snake.unshift(head);
    
    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
        playSound('eat');
        score += CONFIG.SCORE_INCREMENT;
        updateUI({ score });
        generateFood();
        
        // Increase speed
        if (speed > CONFIG.MIN_SPEED) {
            speed -= CONFIG.SPEED_INCREMENT;
        }
    } else {
        snake.pop();
    }
    
    checkCollisions();
}

function renderGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw food
    drawFood();
    
    // Draw snake
    drawSnake();
}

function drawSnake() {
    snake.forEach((segment, index) => {
        if (segment.type === 'head') {
            drawSnakeHead(segment);
        } else {
            drawSnakeBody(segment, index);
        }
    });
}

function drawSnakeHead(segment) {
    // Head gradient
    const gradient = ctx.createLinearGradient(
        segment.x, segment.y,
        segment.x + CONFIG.GRID_SIZE, segment.y + CONFIG.GRID_SIZE
    );
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#81C784');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(
        segment.x, segment.y,
        CONFIG.GRID_SIZE, CONFIG.GRID_SIZE,
        [5]
    );
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'white';
    const eyeSize = CONFIG.GRID_SIZE / 5;
    const eyeOffset = CONFIG.GRID_SIZE / 4;
    
    if (currentDirection === DIRECTIONS.RIGHT || currentDirection === DIRECTIONS.LEFT) {
        // Horizontal eyes
        ctx.fillRect(
            segment.x + eyeOffset - eyeSize/2,
            segment.y + eyeOffset - eyeSize/2,
            eyeSize, eyeSize
        );
        ctx.fillRect(
            segment.x + CONFIG.GRID_SIZE - eyeOffset - eyeSize/2,
            segment.y + eyeOffset - eyeSize/2,
            eyeSize, eyeSize
        );
    } else {
        // Vertical eyes
        ctx.fillRect(
            segment.x + eyeOffset - eyeSize/2,
            segment.y + eyeOffset - eyeSize/2,
            eyeSize, eyeSize
        );
        ctx.fillRect(
            segment.x + eyeOffset - eyeSize/2,
            segment.y + CONFIG.GRID_SIZE - eyeOffset - eyeSize/2,
            eyeSize, eyeSize
        );
    }
}

function drawSnakeBody(segment, index) {
    // Body gradient - gets darker towards the tail
    const darkness = Math.min(0.3, index / snake.length * 0.3);
    const r = parseInt('4C', 16) - Math.floor(parseInt('4C', 16) * darkness);
    const g = parseInt('AF', 16) - Math.floor(parseInt('AF', 16) * darkness);
    const b = parseInt('50', 16) - Math.floor(parseInt('50', 16) * darkness);
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.roundRect(
        segment.x, segment.y,
        CONFIG.GRID_SIZE, CONFIG.GRID_SIZE,
        [3]
    );
    ctx.fill();
}

function drawFood() {
    const pulse = (Date.now() % 1000) / 1000;
    const size = CONFIG.GRID_SIZE * (0.9 + 0.1 * Math.sin(pulse * Math.PI * 2));
    const offset = (CONFIG.GRID_SIZE - size) / 2;
    
    const gradient = ctx.createRadialGradient(
        food.x + CONFIG.GRID_SIZE/2,
        food.y + CONFIG.GRID_SIZE/2,
        0,
        food.x + CONFIG.GRID_SIZE/2,
        food.y + CONFIG.GRID_SIZE/2,
        CONFIG.GRID_SIZE/2
    );
    gradient.addColorStop(0, '#FF5252');
    gradient.addColorStop(1, '#D32F2F');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
        food.x + CONFIG.GRID_SIZE/2,
        food.y + CONFIG.GRID_SIZE/2,
        size/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function generateFood() {
    let newFoodPosition;
    let positionValid = false;
    const maxAttempts = 100;
    let attempts = 0;
    
    while (!positionValid && attempts < maxAttempts) {
        attempts++;
        newFoodPosition = {
            x: Math.floor(Math.random() * (canvas.width / CONFIG.GRID_SIZE)) * CONFIG.GRID_SIZE,
            y: Math.floor(Math.random() * (canvas.height / CONFIG.GRID_SIZE)) * CONFIG.GRID_SIZE
        };
        
        positionValid = !snake.some(segment => 
            segment.x === newFoodPosition.x && 
            segment.y === newFoodPosition.y
        );
    }
    
    food = newFoodPosition || { x: 0, y: 0 };
}

function checkCollisions() {
    const head = snake[0];
    
    // Wall collision
    if (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height
    ) {
        handleGameOver();
        return;
    }
    
    // Self collision (skip head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            handleGameOver();
            return;
        }
    }
}

function handleGameOver() {
    isGameOver = true;
    clearInterval(timerInterval);
    playSound('gameOver');

    // Update leaderboard
    updateLeaderboard({
        playerName,
        score,
        time: timer,
        difficulty: getCurrentDifficulty()
    });

    // Show game over screen
    showGameOverScreen({
        score,
        time: timer
    });

    // Clear the existing game loop
    cancelAnimationFrame(gameLoop);
}

function getCurrentDifficulty() {
    const difficultySelect = document.getElementById('difficultySelect');
    return difficultySelect ? difficultySelect.value : 'medium';
}

// Export public functions
export function togglePause() {
    if (isGameOver) return isPaused;
    
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(timerInterval);
    } else {
        timerInterval = setInterval(() => {
            if (!isGameOver) timer++;
            updateUI({ timer });
        }, 1000);
    }
    return isPaused;
}

export function changeDirection(newDirection) {
    if (isPaused || isGameOver) return;
    
    if (
        (currentDirection === DIRECTIONS.UP && newDirection !== DIRECTIONS.DOWN) ||
        (currentDirection === DIRECTIONS.DOWN && newDirection !== DIRECTIONS.UP) ||
        (currentDirection === DIRECTIONS.LEFT && newDirection !== DIRECTIONS.RIGHT) ||
        (currentDirection === DIRECTIONS.RIGHT && newDirection !== DIRECTIONS.LEFT)
    ) {
        nextDirection = newDirection;
    }
}