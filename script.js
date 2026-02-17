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

let goldenApple = null;  
let goldenAppleActive = false;    
let goldenAppleTimer = 0; 
let normalAppleCount = 0;
const goldenAppleDuration = 6000;
const goldenAppleBlinkTime = 3000;


const snakeHeadImg = new Image();
snakeHeadImg.src = './assets/headSnake.png';
let snakeHeadRotation = 0;

function drawSnake() {
   
    ctx.save(); 
    ctx.translate(snake[0].x + boxSize / 2, snake[0].y + boxSize / 2); 
    ctx.rotate(snakeHeadRotation * Math.PI / 180); 
    ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize); 
    ctx.restore(); 

 
    for (let i = 1; i < snake.length; i++) {
        ctx.fillStyle = "lime";
        ctx.fillRect(snake[i].x, snake[i].y, boxSize, boxSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(snake[i].x, snake[i].y, boxSize, boxSize);
    }
}

function drawFood() {
    if (goldenAppleActive) {
        
        if (goldenAppleTimer >= goldenAppleBlinkTime && Math.floor(goldenAppleTimer / 200) % 2 === 0) {
            ctx.fillStyle = "transparent";
        } else {
            ctx.fillStyle = "gold";
        }
        ctx.fillRect(goldenApple.x, goldenApple.y, boxSize, boxSize);
    } else {
        
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
            snakeHeadRotation = 180; 
            break;
        case "UP":
            head.y -= boxSize;
            snakeHeadRotation = 270; 
            break;
        case "RIGHT":
            head.x += boxSize;
            snakeHeadRotation = 0; 
            break;
        case "DOWN":
            head.y += boxSize;
            snakeHeadRotation = 90;
            break;
    }

    snake.unshift(head);

 
    if (goldenAppleActive && head.x === goldenApple.x && head.y === goldenApple.y) {
        
        score += 3;
        document.getElementById("score").innerText = "Score: " + score;
        goldenAppleActive = false;
        normalAppleCount = 0;
       
        for (let i = 0; i < 3; i++) {
            snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y });
        }
    } else if (!goldenAppleActive && head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("score").innerText = "Score: " + score;
        food.x = Math.floor(Math.random() * 20) * boxSize;
        food.y = Math.floor(Math.random() * 20) * boxSize;
        eatSound.play(); 
        normalAppleCount++;

        
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
    goldenAppleTimer = 0; 
}

function checkCollision() {
    const head = snake[0];

    
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver = true;
    }


    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
        }
    }

    if (gameOver) {
        gameOverSound.play(); 
        document.getElementById("restartBtn").style.visibility = "visible";

        
        updateHighScore();
    }
}

function drawTimerBar() {
    if (goldenAppleActive) {
        const remainingTime = goldenAppleDuration - goldenAppleTimer;
        const timerWidth = (remainingTime / goldenAppleDuration) * canvas.width;

        ctx.fillStyle = "yellow";
        ctx.fillRect(0, 0, timerWidth, 5); 
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    moveSnake();
    checkCollision();
    drawTimerBar();

   
    if (goldenAppleActive) {
        goldenAppleTimer += 150;
        if (goldenAppleTimer >= goldenAppleDuration) {
            goldenAppleActive = false; 
        }
    }

    if (!gameOver) {
        setTimeout(draw, 150); 
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
    draw();
    updateHighScore();
}

draw();
updateHighScore(); 






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

    if (!soundEffectsEnabled) {
        eatSound.volume = 0; 
        gameOverSound.volume = 0; 
    } else {
        eatSound.volume = 1;
        gameOverSound.volume = 1; 
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

function exitGame() {
    alert("Thanks for playing! Exiting the game...");
    window.location.reload();
}
 

