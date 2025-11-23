const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const statusMessage = document.getElementById("statusMessage");

const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

const rightPressed = false;
const leftPressed = false;

const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: r + 1 };
    }
}

let score = 0;
let gameOver = false;
let gameWin = false;


// Paddle controls
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let rightPressedFlag = false;
let leftPressedFlag = false;

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressedFlag = true;
    }
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressedFlag = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressedFlag = false;
    }
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressedFlag = false;
    }
}

//collision helper
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}


// Collision detection
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status !== 0) {

                // Circle-rectangle collision
                const closestX = clamp(x, b.x, b.x + brickWidth);
                const closestY = clamp(y, b.y, b.y + brickHeight);

                const distanceX = x - closestX;
                const distanceY = y - closestY;
                const distanceSquared = distanceX * distanceX + distanceY * distanceY;

                if (distanceSquared < ballRadius * ballRadius) {
                    // Reflect ball
                    // Check which side we hit
                    if (closestX === b.x || closestX === b.x + brickWidth) {
                        dx = -dx;  // hit vertical side
                    } else {
                        dy = -dy;  // hit top/bottom
                    }
                    b.status--;
                    score++;
                    scoreDisplay.textContent = `Score: ${score}`;

                    if (score === (1 + 2 + 3) * brickColumnCount) {
                        gameWin = true;
                        statusMessage.textContent = "You Win!";
                    }
                }
            }
        }
    }
}


// Draw bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status !== 0) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                switch (bricks[c][r].status) {
                    case 3:
                        ctx.fillStyle = "#FF5733"; // Strongest
                        break;
                    case 2:
                        ctx.fillStyle = "#FFC300"; // Medium
                        break;
                    case 1:
                        ctx.fillStyle = "#DAF7A6"; // Weakest
                        break;
                }
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#DD0000";
    ctx.fill();
    ctx.closePath();
}

// Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Draw everything
function draw() {
    console.log("Drawing frame");
    if (gameOver || gameWin) {
        fetch("/submit_score/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: window.username, score: score })
        })
            .then(res => res.json())
            .then(data => {
                console.log("Score submitted:", data);
                // Redirect after submission
                setTimeout(() => { window.location.href = "/leaderboard/"; }, 2000);
            })
            .catch(err => console.error("Error submitting score:", err));

        return; // stop the game loop
    }


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Ball collision with walls
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        const paddle = {
            x: paddleX,
            y: canvas.height - paddleHeight,
            width: paddleWidth,
            height: paddleHeight
        };

        const closestX = clamp(x, paddle.x, paddle.x + paddle.width);
        const closestY = clamp(y, paddle.y, paddle.y + paddle.height);

        const distanceX = x - closestX;
        const distanceY = y - closestY;

        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        if (distanceSquared < ballRadius * ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            gameOver = true;
            dy = -dy;
            statusMessage.textContent = "Game Over!";
        }
    }
    // Paddle movement
    if (rightPressedFlag && paddleX < canvas.width - paddleWidth) {
        paddleX += 5;
    } else if (leftPressedFlag && paddleX > 0) {
        paddleX -= 5;
    }
    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// API to detect game status
window.gameStatus = {
    getFlags: function () {
        return { win: gameWin, lose: gameOver };
    }
};
