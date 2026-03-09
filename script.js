// Shared initialization entrypoint
window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("gridContainer")) {
        initFind67();
    }

    if (document.getElementById("numberDisplay")) {
        initReach67();
    }

    if(document.getElementById("clickButton")){
        initClicker67()
    }
});

// --------- Find the 67 Game Implementation ---------
function initFind67() {
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
    const homeBtnGameOver = document.getElementById('homeBtnGameOver');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');

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
        window.location.href = 'index.html';
    });
    if (homeBtnGameOver) {
        homeBtnGameOver.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartLevel);


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
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;
        
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
    function startTimer(reset = true) {
        if (reset) {
            gameState.timeRemaining = gameState.maxTime;
            updateTimerBar();
        }

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

    // Pause / Restart helpers
    function togglePause() {
        if (gameState.isGameRunning) {
            clearInterval(gameState.timerInterval);
            gameState.isGameRunning = false;
            pauseBtn.textContent = '▶';
        } else {
            gameState.isGameRunning = true;
            pauseBtn.textContent = '⏸';
            startTimer(false);
        }
    }

    function restartLevel() {
        clearInterval(gameState.timerInterval);
        gameState.isGameRunning = false;
        gameState.timeRemaining = gameState.maxTime;
        gameState.isGameRunning = true;
        generateGrid();
        startTimer(true);
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
    let highScore = parseInt(localStorage.getItem('highScore67')) || 0;
    highScoreDisplay.textContent = highScore;
}

// --------- Reach 67 Game Implementation ---------
function initReach67() {
    const state = {
        currentLevel: 1,
        score: 0,
        currentNumber: 0,
        isRunning: false,
        interval: null,
        baseSpeed: 120,
        speedDecrease: 5
    };

    const homeScreen = document.getElementById('homeScreen');
    const gameScreen = document.getElementById('gameScreen');
    const resultScreen = document.getElementById('resultScreen');

    const startGameBtn = document.getElementById('startGameBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const homeBtn = document.getElementById('homeBtn');
    const homeBtnGameOver = document.getElementById('homeBtnGameOver');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');

    const levelDisplay = document.getElementById('levelDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const numberDisplay = document.getElementById('numberDisplay');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');

    startGameBtn.addEventListener('click', startGame);
    stopBtn.addEventListener('click', stopCounter);
    playAgainBtn.addEventListener('click', () => {
        resetGame();
        startGame();
    });
    homeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    if (homeBtnGameOver) {
        homeBtnGameOver.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartLevel);


    function showScreen(name) {
        homeScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        resultScreen.classList.remove('active');
        if (name === 'home') homeScreen.classList.add('active');
        if (name === 'game') gameScreen.classList.add('active');
        if (name === 'result') resultScreen.classList.add('active');
    }

    function startGame(reset = true) {
        showScreen('game');
        state.isRunning = true;
        if (reset) {
            state.currentNumber = 0;
            numberDisplay.textContent = '0';
        }
        const speed = Math.max(50, state.baseSpeed - (state.currentLevel - 1) * state.speedDecrease);
        state.interval = setInterval(() => {
            state.currentNumber++;
            numberDisplay.textContent = state.currentNumber;
            if (state.currentNumber >= 100) stopCounter();
        }, speed);
    }

    function stopCounter() {
        if (!state.isRunning) return;
        state.isRunning = false;
        clearInterval(state.interval);
        if (state.currentNumber === 67) {
            state.score++;
            state.currentLevel++;
            scoreDisplay.textContent = state.score;
            levelDisplay.textContent = state.currentLevel;
            resultTitle.textContent = 'Perfect!';
            resultTitle.className = 'result-title perfect';
            resultMessage.textContent = 'You hit exactly 67!';
            resultMessage.className = 'result-message perfect';
        } else {
            resultTitle.textContent = 'Game Over';
            resultTitle.className = 'result-title failed';
            resultMessage.textContent = `You stopped at ${state.currentNumber}`;
            resultMessage.className = 'result-message failed';
        }
        showScreen('result');
    }

    function resetGame() {
        state.currentLevel = 1;
        state.score = 0;
        state.currentNumber = 0;
        state.isRunning = false;
        clearInterval(state.interval);
        levelDisplay.textContent = '1';
        scoreDisplay.textContent = '0';
    }

    function togglePause() {
        if (state.isRunning) {
            clearInterval(state.interval);
            state.isRunning = false;
            pauseBtn.textContent = '▶';
        } else {
            state.isRunning = true;
            pauseBtn.textContent = '⏸';
            startGame(false); // resume without resetting the number
        }
    }

    function restartLevel() {
        clearInterval(state.interval);
        state.isRunning = false;
        state.currentNumber = 0;
        state.isRunning = true;
        numberDisplay.textContent = '0';
        startGame();
    }
}

// --------- Clicker 67 Game Implementation ---------
function initClicker67(){
// Number formatting
function formatNumber(value) {
    if (value >= 1e9) return (value / 1e9).toFixed(value % 1e9 === 0 ? 0 : 2).replace(/\.00$/,'') + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(value % 1e6 === 0 ? 0 : 2).replace(/\.00$/,'') + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(value % 1e3 === 0 ? 0 : 2).replace(/\.00$/,'') + 'K';
    return value.toString();
}
// Achievement system
const achievementPopup = document.getElementById("achievementPopup");
const achievementsBtn = document.getElementById("achievementsBtn");
const achievementPanel = document.getElementById("achievementPanel");
const closeAchievements = document.getElementById("closeAchievements");
const achievementList = document.getElementById("achievementList");

const achievementMilestones = [67, 670, 6700, 67000, 670000, 6700000];
const achievementNames = [
    "Reached 67",
    "Reached 670",
    "Reached 6.7K",
    "Reached 67K",
    "Reached 670K",
    "Reached 6.7M"
];
let unlockedAchievements = [];

function checkAchievements() {
    for (let i = 0; i < achievementMilestones.length; i++) {
        if (score >= achievementMilestones[i] && !unlockedAchievements.includes(i)) {
            unlockedAchievements.push(i);
            showAchievementPopup(achievementNames[i]);
            updateAchievementPanel();
        }
    }
}

function showAchievementPopup(name) {
    achievementPopup.textContent = `Achievement Unlocked\n"${name}"`;
    achievementPopup.style.display = "block";
    achievementPopup.classList.remove("fadeout");
    achievementPopup.classList.add("fadein");
    setTimeout(() => {
        achievementPopup.classList.remove("fadein");
        achievementPopup.classList.add("fadeout");
        setTimeout(() => {
            achievementPopup.style.display = "none";
        }, 2000);
    }, 2000);
}

function updateAchievementPanel() {
    achievementList.innerHTML = "";
    if (unlockedAchievements.length === 0) {
        achievementList.innerHTML = '<div class="achievement-empty">No achievements unlocked yet.</div>';
        return;
    }
    for (let idx of unlockedAchievements) {
        const item = document.createElement("div");
        item.className = "achievement-item";
        item.textContent = achievementNames[idx];
        achievementList.appendChild(item);
    }
}

achievementsBtn.addEventListener("click", () => {
    achievementPanel.style.display = "block";
    updateAchievementPanel();
});
closeAchievements.addEventListener("click", () => {
    achievementPanel.style.display = "none";
});

let score = 0;
let clickPower = 1;
let autoPower = 0;

const scoreDisplay = document.getElementById("score");
const autoPowerDisplay = document.getElementById("autoPowerDisplay");
const clickPowerDisplay = document.getElementById("clickPowerDisplay");
const clickButton = document.getElementById("clickButton");


const upgradeClick = document.getElementById("upgradeClick");
const upgradeAuto = document.getElementById("upgradeAuto");
const upgradeFactory = document.getElementById("upgradeFactory");
const upgradeMine = document.getElementById("upgradeMine");
const upgradeSilverCursor = document.getElementById("upgradeSilverCursor");
const upgradeFactory2 = document.getElementById("upgradeFactory2");
const upgradeLab = document.getElementById("upgradeLab");
const upgradeTemple = document.getElementById("upgradeTemple");
const upgradeGoldCursor = document.getElementById("upgradeGoldCursor");
const upgradeRocket = document.getElementById("upgradeRocket");
const upgradeMan = document.getElementById("upgradeMan");

const floating = document.getElementById("floatingNumbers");
const shopButton = document.getElementById("shopButton");
const shopPanel = document.getElementById("shopPanel");
const shopNotification = document.getElementById("shopNotification");
const closeShop = document.getElementById("closeShop");

let shopOpen = false;

function updateScore() {
    scoreDisplay.textContent = formatNumber(score);
    updateShopNotification();
    checkAchievements();
    updateClickPowerIndicator();
}

function updateAutoPower() {
    function updateClickPowerIndicator() {
        clickPowerDisplay.textContent = "+" + clickPower;
    }
    autoPowerDisplay.textContent = formatNumber(autoPower);
    // Set upgrade costs formatted
    document.getElementById("costClick").textContent = formatNumber(10);
    document.getElementById("costAuto").textContent = formatNumber(50);
    document.getElementById("costFactory").textContent = formatNumber(250);
    document.getElementById("costMine").textContent = formatNumber(6500);
    document.getElementById("costSilverCursor").textContent = formatNumber(150000);
    document.getElementById("costFactory2").textContent = formatNumber(2000000);
    document.getElementById("costLab").textContent = formatNumber(20000000);
    document.getElementById("costTemple").textContent = formatNumber(125000000);
    document.getElementById("costGoldCursor").textContent = formatNumber(400000000);
    document.getElementById("costRocket").textContent = formatNumber(5000000000);
    document.getElementById("costMan").textContent = formatNumber(100000000000);
}

function updateShopNotification() {
    let availableUpgrades = 0;
    if (score >= 10) availableUpgrades++;
    if (score >= 50) availableUpgrades++;
    if (score >= 250) availableUpgrades++;

    if (availableUpgrades > 0 && !shopOpen) {
        shopNotification.textContent = availableUpgrades;
        shopNotification.style.display = 'flex';
    } else {
        shopNotification.style.display = 'none';
    }
}

function toggleShop() {
    shopOpen = !shopOpen;
    if (shopOpen) {
        shopPanel.classList.add('open');
        shopNotification.style.display = 'none';
    } else {
        shopPanel.classList.remove('open');
    }
}

shopButton.addEventListener('click', toggleShop);
closeShop.addEventListener('click', toggleShop);

clickButton.addEventListener("click", (e) => {
    score += clickPower;
    updateScore();

    clickButton.classList.add("bounce");

    // Spawn glowing 67 numbers
    const rect = clickButton.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    for (let i = 0; i < clickPower; i++) {
        // Slight random offset for each
        const offsetX = clickX + (Math.random() - 0.5) * 40;
        const offsetY = clickY + (Math.random() - 0.5) * 24;
        spawnGlowing67(offsetX, offsetY);
    }

    setTimeout(() => {
        clickButton.classList.remove("bounce");
    }, 150);
});


upgradeClick.addEventListener("click", () => {
    if (score >= 10) {
        score -= 10;
        clickPower += 1;
        updateScore();
        updateClickPowerIndicator();
    }
});

upgradeAuto.addEventListener("click", () => {
    if (score >= 50) {
        score -= 50;
        autoPower += 1;
        updateScore();
        updateAutoPower();
    }
});

upgradeFactory.addEventListener("click", () => {
    if (score >= 250) {
        score -= 250;
        autoPower += 5;
        updateScore();
        updateAutoPower();
    }
});

// New Upgrades
upgradeMine.addEventListener("click", () => {
    if (score >= 6500) {
        score -= 6500;
        autoPower += 100;
        updateScore();
        updateAutoPower();
    }
});

upgradeSilverCursor.addEventListener("click", () => {
    if (score >= 150000) {
        score -= 150000;
        clickPower += 2000;
        updateScore();
        updateClickPowerIndicator();
    }
});

upgradeFactory2.addEventListener("click", () => {
    if (score >= 2000000) {
        score -= 2000000;
        autoPower += 15000;
        updateScore();
        updateAutoPower();
    }
});

upgradeLab.addEventListener("click", () => {
    if (score >= 20000000) {
        score -= 20000000;
        autoPower += 250000;
        updateScore();
        updateAutoPower();
    }
});

upgradeTemple.addEventListener("click", () => {
    if (score >= 125000000) {
        score -= 125000000;
        autoPower += 5000000;
        updateScore();
        updateAutoPower();
    }
});

upgradeGoldCursor.addEventListener("click", () => {
    if (score >= 400000000) {
        score -= 400000000;
        clickPower += 2000000;
        updateScore();
        updateClickPowerIndicator();
    }
});

upgradeRocket.addEventListener("click", () => {
    if (score >= 5000000000) {
        score -= 5000000000;
        autoPower += 100000000;
        updateScore();
        updateAutoPower();
        updateClickPowerIndicator();
    }
});

upgradeMan.addEventListener("click", () => {
    if (score >= 100000000000) {
        score -= 100000000000;
        autoPower += 5000000000;
        updateScore();
        updateAutoPower();
    }
});

setInterval(() => {
    score += autoPower;
    updateScore();
}, 1000);

function spawnNumber(x, y, power) {
    // Deprecated: no longer used
}

function spawnGlowing67(x, y) {
    const el = document.createElement("div");
    el.className = "floating67";
    el.textContent = "67";
    // Position relative to button
    el.style.left = (x + clickButton.offsetLeft - 40) + "px";
    el.style.top = (y + clickButton.offsetTop + 40) + "px";
    // Random rotation
    const rot = (Math.random() - 0.5) * 32;
    el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
    floating.appendChild(el);
    setTimeout(() => {
        el.style.opacity = 0;
    }, 700);
    setTimeout(() => {
        el.remove();
    }, 800);
}

updateScore();
updateAutoPower();
}

