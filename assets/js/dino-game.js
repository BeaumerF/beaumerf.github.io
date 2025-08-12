const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let dino, obstacles, gameSpeed, score, isGameOver, obstacleTimer, gameStarted;

// 🔄 Fonction pour réinitialiser le jeu
function resetGame() {
    dino = { x: 50, y: 150, width: 40, height: 40, dy: 0, jumpPower: -8, gravity: 0.4, grounded: true };
    obstacles = [];
    gameSpeed = 4;
    score = 0;
    isGameOver = false;
    obstacleTimer = 0;
    gameStarted = true;  // On marque que le jeu est démarré
    gameLoop();
}

function drawDino() {
    ctx.fillStyle = "#555";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacles() {
    ctx.fillStyle = "hsl(175, 70%, 55%)";  // couleur demandée
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

function spawnObstacle() {
    let height = Math.random() * 30 + 20;
    obstacles.push({ x: canvas.width, y: canvas.height - height - 10, width: 20, height: height });
}

function updateObstacles() {
    obstacles.forEach(obs => obs.x -= gameSpeed);
    if (obstacles.length && obstacles[0].x < -obstacles[0].width) {
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
    ctx.fillStyle = "white";  // texte blanc
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 30);
}

function drawGround() {
    ctx.fillStyle = "white"; // sol blanc
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
}

function gameLoop() {
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
        // Affiche le message de démarrage
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Appuie sur Espace pour commencer", canvas.width / 2 - 140, canvas.height / 2);
    } else {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Appuie sur Espace ou touche l'écran pour rejouer", canvas.width / 2 - 180, canvas.height / 2 + 40);
    }
}

// 🎮 Contrôles clavier
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

// 📱 Contrôles tactiles
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

// 🚀 Pas de lancement automatique ici — attend l'appui sur espace
gameStarted = false;
gameLoop();
