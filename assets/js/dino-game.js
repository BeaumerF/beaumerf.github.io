const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Constants to ensure consistency
const GAME_SPEED_BASE = 3;
const GRAVITY = 0.4; // Unified gravity
const JUMP_POWER = -8;
const OBSTACLE_INTERVAL_FRAMES = 90; // Approx 1.5 seconds at 60fps base

// Variables
let currentYear = 2015;
let dino, obstacles, gameSpeed, score, isGameOver, obstacleTimer, gameStarted;
let lastTime = 0;

function resetGame() {
    dino = { 
        x: 50, 
        y: 150, 
        width: 40, 
        height: 40, 
        dy: 0, 
        jumpPower: JUMP_POWER, 
        gravity: GRAVITY, 
        grounded: true 
    };
    obstacles = [];
    gameSpeed = GAME_SPEED_BASE;
    score = 0;
    isGameOver = false;
    obstacleTimer = 0;
    gameStarted = true;
    currentYear = 2015;
    lastTime = 0;
    requestAnimationFrame(gameLoop);
}

function drawDino() {
    ctx.fillStyle = "#555";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacles() {
    // Optimization: Batch drawing similar elements to minimize state changes
    
    // 1. Draw all obstacle rectangles
    ctx.fillStyle = "hsl(175, 70%, 55%)";
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // 2. Draw all text elements
    ctx.textAlign = "center";
    obstacles.forEach(obs => {
        const textX = obs.x + obs.width / 2;
        const textY = obs.y - 5;

        // Determine label
        let label = "";
        if (obs.year >= 2015 && obs.year <= 2019) label = "Student";
        else if (obs.year >= 2020 && obs.year <= 2022) label = "Ubisoft";
        else if (obs.year >= 2023 && obs.year <= 2024) label = "Voodoo";
        else if (obs.year === 2025) label = "Kawak";

        if (label) {
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText(label, textX, textY - 20);
        }

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        if (obs.year <= new Date().getFullYear()) {
            ctx.fillText(obs.year, textX, textY);
        }
    });
}

function spawnObstacle() {
    let height = Math.random() * 30 + 20;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - height - 10,
        width: 20,
        height: height,
        year: currentYear
    });
    currentYear++;
}

function updateObstacles(timeScale) {
    obstacles.forEach(obs => obs.x -= gameSpeed * timeScale);

    if (obstacles.length > 0 && obstacles[0] && obstacles[0].x < -obstacles[0].width) {
        obstacles.shift();
        score++;
    }
}

function checkCollision() {
    for (let obs of obstacles) {
        if (
            dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y
        ) {
            // Consistency logic: Do not recreate the object if not needed, or use constants
            dino.dy = 0;
            // dino object will be reset in resetGame anyway
            isGameOver = true;
            gameStarted = false;
        }
    }
}

function updateDino(timeScale) {
    dino.y += dino.dy * timeScale;
    
    if (dino.y + dino.height >= canvas.height - 10) {
        dino.y = canvas.height - dino.height - 10;
        dino.dy = 0;
        dino.grounded = true;
    } else {
        dino.dy += dino.gravity * timeScale;
    }
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 20, 30);
}

function drawGround() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Normalize speed to 60 FPS (approx 16.67ms per frame)
    // If deltaTime is 16.67, timeScale is 1.
    // If deltaTime is 33.33 (30 FPS), timeScale is 2 (move twice as much per frame).
    const timeScale = deltaTime / (1000 / 60);

    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawDino();
    drawObstacles();
    drawScore();

    if (!isGameOver && gameStarted) {
        updateDino(timeScale);
        updateObstacles(timeScale);
        checkCollision();

        // Timer also needs to be time-scaled to keep spawn rate consistent
        obstacleTimer += timeScale;
        if (obstacleTimer > OBSTACLE_INTERVAL_FRAMES) {
            spawnObstacle();
            obstacleTimer = 0;
        }

        requestAnimationFrame(gameLoop);
    } else if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Press Space or tap the screen to start", canvas.width / 2, canvas.height / 2);
    } else {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Press Space or tap the screen to restart", canvas.width / 2, canvas.height / 2 + 40);
    }
}

function handleInput() {
    if (isGameOver) {
        resetGame();
    } else if (!gameStarted) {
        resetGame();
    } else {
        jump();
    }
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        handleInput();
    }
});

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent scrolling on mobile
    handleInput();
});

function jump() {
    if (!isGameOver && dino.grounded && gameStarted) {
        dino.dy = dino.jumpPower;
        dino.grounded = false;
    }
}

// Initialization of static state (waiting for start)
gameStarted = false;
drawGround();
ctx.fillStyle = "white";
ctx.font = "24px Arial";
ctx.textAlign = "center";
ctx.fillText("Press Space or tap the screen to start", canvas.width / 2, canvas.height / 2);

