var backgroundMusic = document.getElementById("backgroundMusic");
var eatSound = document.getElementById("eatSound");
var gameOverSound = document.getElementById("gameOverSound");

backgroundMusic.addEventListener('canplaythrough', function() {
    console.log("Music is fully loaded and ready to play.");
});

function startMusic() {
    backgroundMusic.play().catch(error => {
        console.error("Failed to play audio:", error);
    });
    document.removeEventListener("click", startMusic);
    document.removeEventListener("keydown", startMusic);
}

document.addEventListener("click", startMusic);
document.addEventListener("keydown", startMusic);

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;

const boxSize = 20;
let snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
let direction = null;
let food = {
    x: Math.floor(Math.random() * 20) * boxSize,
    y: Math.floor(Math.random() * 20) * boxSize
};
let score = 0;
let gameOver = false;

let goldenApple = null; // موقعیت سیب طلایی
let goldenAppleActive = false; // فعال بودن سیب طلایی
let goldenAppleTimer = 0; // تایمر برای سیب طلایی
let normalAppleCount = 0; // تعداد سیب‌های معمولی خورده شده
const goldenAppleDuration = 6000; // مدت زمان 6 ثانیه برای سیب طلایی
const goldenAppleBlinkTime = 3000; // زمان شروع چشمک زدن

// Load snake head image
const snakeHeadImg = new Image();
snakeHeadImg.src = './assets/headSnake.png';
let snakeHeadRotation = 0; // Variable to store the rotation angle

function drawSnake() {
    // Draw snake head with rotation
    ctx.save(); // Save the current state
    ctx.translate(snake[0].x + boxSize / 2, snake[0].y + boxSize / 2); // Move to the head center
    ctx.rotate(snakeHeadRotation * Math.PI / 180); // Rotate the canvas to the correct angle
    ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize); // Draw the head
    ctx.restore(); // Restore the state to prevent affecting other drawings

    // Draw the rest of the snake body
    for (let i = 1; i < snake.length; i++) {
        ctx.fillStyle = "lime";
        ctx.fillRect(snake[i].x, snake[i].y, boxSize, boxSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(snake[i].x, snake[i].y, boxSize, boxSize);
    }
}

function drawFood() {
    if (goldenAppleActive) {
        // Draw golden apple
        if (goldenAppleTimer >= goldenAppleBlinkTime && Math.floor(goldenAppleTimer / 200) % 2 === 0) {
            ctx.fillStyle = "transparent"; // چشمک زن
        } else {
            ctx.fillStyle = "gold";
        }
        ctx.fillRect(goldenApple.x, goldenApple.y, boxSize, boxSize);
    } else {
        // Draw normal apple
        ctx.fillStyle = "red";
        ctx.fillRect(food.x, food.y, boxSize, boxSize);
    }
}

function moveSnake() {
    if (!direction) return;

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case "LEFT":
            head.x -= boxSize;
            snakeHeadRotation = 180; // Rotate head left
            break;
        case "UP":
            head.y -= boxSize;
            snakeHeadRotation = 270; // Rotate head up
            break;
        case "RIGHT":
            head.x += boxSize;
            snakeHeadRotation = 0; // Rotate head right
            break;
        case "DOWN":
            head.y += boxSize;
            snakeHeadRotation = 90; // Rotate head down
            break;
    }

    snake.unshift(head);

    // Check if snake has eaten the food
    if (goldenAppleActive && head.x === goldenApple.x && head.y === goldenApple.y) {
        // If the snake eats the golden apple
        score += 3;
        document.getElementById("score").innerText = "Score: " + score;
        goldenAppleActive = false;
        normalAppleCount = 0;
        // Add 3 blocks to the snake
        for (let i = 0; i < 3; i++) {
            snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y });
        }
    } else if (!goldenAppleActive && head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("score").innerText = "Score: " + score;
        food.x = Math.floor(Math.random() * 20) * boxSize;
        food.y = Math.floor(Math.random() * 20) * boxSize;
        eatSound.play(); // Play eating sound
        normalAppleCount++;

        // Check if it's time to spawn a golden apple
        if (normalAppleCount === 4) {
            spawnGoldenApple();
        }
    } else {
        snake.pop();
    }
}

function spawnGoldenApple() {
    goldenApple = {
        x: Math.floor(Math.random() * 20) * boxSize,
        y: Math.floor(Math.random() * 20) * boxSize
    };
    goldenAppleActive = true;
    goldenAppleTimer = 0; // Reset timer
}

function checkCollision() {
    const head = snake[0];

    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver = true;
    }

    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
        }
    }

    if (gameOver) {
        gameOverSound.play(); // Play game over sound
        document.getElementById("restartBtn").style.visibility = "visible";

        // Update high score if needed
        updateHighScore();
    }
}

function drawTimerBar() {
    if (goldenAppleActive) {
        const remainingTime = goldenAppleDuration - goldenAppleTimer;
        const timerWidth = (remainingTime / goldenAppleDuration) * canvas.width;

        ctx.fillStyle = "yellow";
        ctx.fillRect(0, 0, timerWidth, 5); // Draw the timer bar at the top
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    moveSnake();
    checkCollision();
    drawTimerBar();

    // Handle golden apple timer
    if (goldenAppleActive) {
        goldenAppleTimer += 150;
        if (goldenAppleTimer >= goldenAppleDuration) {
            goldenAppleActive = false; // Hide golden apple after the duration
        }
    }

    if (!gameOver) {
        setTimeout(draw, 150); // کاهش سرعت مار
    }
}

function updateHighScore() {
    let highScore = localStorage.getItem('highScore') || 0;
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        highScore = score;
    }
    document.getElementById("highScore").innerText = "High Score: " + highScore;
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

function setDirection(newDirection) {
    if (newDirection === "LEFT" && direction !== "RIGHT") direction = "LEFT";
    if (newDirection === "UP" && direction !== "DOWN") direction = "UP";
    if (newDirection === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
    if (newDirection === "DOWN" && direction !== "UP") direction = "DOWN";
}

function restartGame() {
    snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
    direction = null;
    food = {
        x: Math.floor(Math.random() * 20) * boxSize,
        y: Math.floor(Math.random() * 20) * boxSize
    };
    score = 0;
    normalAppleCount = 0;
    goldenAppleActive = false;
    goldenAppleTimer = 0;
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("restartBtn").style.visibility = "hidden";
    gameOver = false;
    draw(); // Start the game
    updateHighScore(); // Update high score display
}

draw();
updateHighScore(); // Display high score on page load


// setting


// متغیرها برای کنترل وضعیت صداها
let backgroundMusicEnabled = true;
let soundEffectsEnabled = true;

document.getElementById('settingsIcon').addEventListener('click', function() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.style.display = settingsPanel.style.display === 'none' || settingsPanel.style.display === '' ? 'block' : 'none';
});

function toggleBackgroundMusic() {
    if (backgroundMusicEnabled) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play();
    }
    backgroundMusicEnabled = !backgroundMusicEnabled;
}

function toggleSoundEffects() {
    soundEffectsEnabled = !soundEffectsEnabled;

    // قطع و وصل کردن صدای خوردن سیب و گیم اور
    if (!soundEffectsEnabled) {
        eatSound.volume = 0; // صدا را قطع می‌کند
        gameOverSound.volume = 0; // صدا را قطع می‌کند
    } else {
        eatSound.volume = 1; // صدا را فعال می‌کند
        gameOverSound.volume = 1; // صدا را فعال می‌کند
    }
}

function playEatSound() {
    if (soundEffectsEnabled) {
        eatSound.currentTime = 0;
        eatSound.play().catch(error => {
            console.error("Failed to play eat sound:", error);
        });
    }
}

function playGameOverSound() {
    if (soundEffectsEnabled) {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(error => {
            console.error("Failed to play game over sound:", error);
        });
    }
}

// افزودن تابع خروج از بازی
function exitGame() {
    alert("Thanks for playing! Exiting the game...");
    window.location.reload();
}
 

// pause & resume

