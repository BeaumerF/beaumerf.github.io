const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let currentYear = 2015;
let dino, obstacles, gameSpeed, score, isGameOver, obstacleTimer, gameStarted;

function resetGame() {
dino = { x: 50, y: 150, width: 40, height: 40, dy: 0, jumpPower: -8, gravity: 0.3, grounded: true };
    obstacles = [];
    gameSpeed = 3;
    score = 0;
    isGameOver = false;
    obstacleTimer = 0;
    gameStarted = true;
    currentYear = 2015; // Réinitialisation
    gameLoop();
}

function drawDino() {
    ctx.fillStyle = "#555";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.fillStyle = "hsl(175, 70%, 55%)";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        const textX = obs.x + obs.width / 2;
        const textY = obs.y - 5;

        // Dessin de l'image (si tu l'as ajoutée)
        // ctx.drawImage(...);

        // Déterminer le label
        let label = "";
        if (obs.year >= 2015 && obs.year <= 2019) {
            label = "Student";
        } else if (obs.year >= 2020 && obs.year <= 2022) {
            label = "Ubisoft";
        } else if (obs.year >= 2023 && obs.year <= 2024) {
            label = "Voodoo";
        } else if (obs.year === 2025) {
            label = "Kawak";
        }

        // Dessiner le label
        if (label) {
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(label, textX, textY - 20);
        }

        // Dessiner la date
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        if (obs.year <= new Date().getFullYear()) 
            ctx.fillText(obs.year, textX, textY);
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

    currentYear++; // Incrémente l'année pour le prochain obstacle
}

function updateObstacles() {
    obstacles.forEach(obs => obs.x -= gameSpeed);

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
            dino = { x: 50, y: 150, width: 40, height: 40, dy: 0, jumpPower: -8, gravity: 0.4, grounded: true };
            isGameOver = true;
            gameStarted = false;
        }
    }
}

function updateDino() {
    dino.y += dino.dy;
    if (dino.y + dino.height >= canvas.height - 10) {
        dino.y = canvas.height - dino.height - 10;
        dino.dy = 0;
        dino.grounded = true;
    } else {
        dino.dy += dino.gravity;
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

function gameLoop() {
    // Effacer l'écran, fond transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawDino();
    drawObstacles();
    drawScore();

    if (!isGameOver && gameStarted) {
        updateDino();
        updateObstacles();
        checkCollision();

        obstacleTimer++;
        if (obstacleTimer > 90) {
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

document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        if (isGameOver) {
            resetGame();
        } else if (!gameStarted) {
            resetGame();
        } else {
            jump();
        }
    }
});

canvas.addEventListener("touchstart", () => {
    if (isGameOver) {
        resetGame();
    } else if (!gameStarted) {
        resetGame();
    } else {
        jump();
    }
});

function jump() {
    if (!isGameOver && dino.grounded && gameStarted) {
        dino.dy = dino.jumpPower;
        dino.grounded = false;
    }
}

// On commence en attente d'appui
resetGame(); // Initialise tout
gameStarted = false; // On attend l'appui sur espace
