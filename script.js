// Game State
const gameState = {
    currentLevel: 1,
    score: 0,
    timeRemaining: 30,
    maxTime: 30,
    isGameRunning: false,
    timerInterval: null,
    tiles: [],
    correctTile: null
};

// DOM Elements
const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

const startGameBtn = document.getElementById('startGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const homeBtn = document.getElementById('homeBtn');

const gridContainer = document.getElementById('gridContainer');
const levelDisplay = document.getElementById('levelDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerBar = document.getElementById('timerBar');
const finalScore = document.getElementById('finalScore');
const highScoreDisplay = document.getElementById('highScore');

// Event Listeners
startGameBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => {
    resetGame();
    startGame();
});
homeBtn.addEventListener('click', () => {
    resetGame();
    showScreen('home');
});

// Screen Management
function showScreen(screenName) {
    homeScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');

    if (screenName === 'home') {
        homeScreen.classList.add('active');
    } else if (screenName === 'game') {
        gameScreen.classList.add('active');
    } else if (screenName === 'gameOver') {
        gameOverScreen.classList.add('active');
    }
}

// Start Game
function startGame() {
    showScreen('game');
    gameState.isGameRunning = true;
    generateGrid();
    startTimer();
}

// Generate Grid
function generateGrid() {
    gridContainer.innerHTML = '';
    gameState.tiles = [];

    const gridSize = Math.min(8, 2 + gameState.currentLevel); // 3x3, 4x4, 5x5, 6x6, 7x7, 8x8 max
    const totalTiles = gridSize * gridSize;

    // Set grid columns
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // Set tile font size based on grid size and screen size (smaller grids = larger text, larger screens = larger text)
    const viewportScale = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.8) / 600; // Scale based on available board space
    const baseSize = 4 - gridSize * 0.3;
    const fontSize = Math.max(1, baseSize * viewportScale);
    gridContainer.style.setProperty('--tile-font-size', fontSize + 'rem');

    // Determine correct tile position
    gameState.correctTile = Math.floor(Math.random() * totalTiles);

    // Color cycles through 7 colors based on level
    const colorClass = `color-${(gameState.currentLevel - 1) % 7}`;

    // Create tiles
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = `tile ${colorClass}`;

        if (i === gameState.correctTile) {
            tile.textContent = '67';
            tile.dataset.value = '67';
        } else {
            // Random number between 1 and 99, excluding 67
            let randomNum;
            do {
                randomNum = Math.floor(Math.random() * 99) + 1;
            } while (randomNum === 67);
            tile.textContent = randomNum;
            tile.dataset.value = randomNum;
        }

        tile.addEventListener('click', () => handleTileClick(tile, i));
        gridContainer.appendChild(tile);
        gameState.tiles.push(tile);
    }

    levelDisplay.textContent = gameState.currentLevel;
    scoreDisplay.textContent = gameState.score;
}

// Handle Tile Click
function handleTileClick(tile, index) {
    if (!gameState.isGameRunning) return;

    if (index === gameState.correctTile) {
        // Correct tile clicked
        tile.classList.add('correct');
        gameState.score++;
        scoreDisplay.textContent = gameState.score;
        gameState.isGameRunning = false;

        // Move to next level after a short delay
        setTimeout(() => {
            gameState.currentLevel++;
            gameState.timeRemaining = gameState.maxTime;
            gameState.maxTime = Math.max(8, gameState.maxTime - 0.3); // Gradually decrease time for higher difficulty
            gameState.isGameRunning = true;
            generateGrid();
        }, 600);
    } else {
        // Wrong tile clicked - shake animation
        tile.classList.add('wrong');
        setTimeout(() => {
            tile.classList.remove('wrong');
        }, 500);
    }
}

// Start Timer
function startTimer() {
    gameState.timeRemaining = gameState.maxTime;
    updateTimerBar();

    // Set smooth transition matching the update interval
    timerBar.style.transition = 'width 0.016s linear';

    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining -= 0.016; // ~60fps

        if (gameState.timeRemaining <= 0) {
            gameState.timeRemaining = 0;
            clearInterval(gameState.timerInterval);
            endGame();
        }

        updateTimerBar();
    }, 16); // ~60fps
}

// Update Timer Bar
function updateTimerBar() {
    const percentage = (gameState.timeRemaining / gameState.maxTime) * 100;
    timerBar.style.width = percentage + '%';
}

// End Game
function endGame() {
    gameState.isGameRunning = false;
    clearInterval(gameState.timerInterval);

    // Update and display scores
    finalScore.textContent = gameState.score;

    // Get high score from localStorage
    let highScore = parseInt(localStorage.getItem('highScore67')) || 0;
    if (gameState.score > highScore) {
        highScore = gameState.score;
        localStorage.setItem('highScore67', highScore);
    }
    highScoreDisplay.textContent = highScore;

    showScreen('gameOver');
}

// Reset Game
function resetGame() {
    gameState.currentLevel = 1;
    gameState.score = 0;
    gameState.timeRemaining = 30;
    gameState.maxTime = 30;
    gameState.isGameRunning = false;
    clearInterval(gameState.timerInterval);
    gridContainer.innerHTML = '';
    gameState.tiles = [];
    timerBar.style.width = '100%';
    timerBar.style.transition = 'none';
}

// Initialize high score display on page load
window.addEventListener('load', () => {
    let highScore = parseInt(localStorage.getItem('highScore67')) || 0;
    highScoreDisplay.textContent = highScore;
});
