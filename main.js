import "./style.css";

// Inicializando Canvas

const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

const playButton = document.getElementById("play");
const gameOverModal = document.getElementById("game-over");

// Data

const score = document.getElementById("score");
const level = document.getElementById("level");
const restart = document.getElementById("restart");
let music = new Audio("./sound.mp3");
music.volume = 0.2;
music.loop = true;

// Reset game

restart.addEventListener("click", () => {
  location.reload();
})

score.textContent = 0;
level.textContent = 1;
let gameOver = false;
let gamePlay = false;

// Play game

playButton.addEventListener("click", () => {
  gamePlay = true;
  music.play()
  music.loop = true;
  play.style.visibility = "hidden";
})

// Board

const board = [];

for (let i = 0; i < 30; i++) {
  board.push(new Array(14).fill(0));
}

const COLORS = [
  "#7C00FE",
  "#F9E400",
  "#FFAF00",
  "#F5004F",
  "#48CFCB",
  "#7A1CAC"
]

const PIECES = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  [[1, 1, 1, 1]],
];

function getRandomShape() {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
}

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const piece = {
  position: { x: 5, y: 0 },
  shape: getRandomShape(),
  color: getRandomColor()
};
// Game loop
// Auto drop

let dropCounter = 0;
let lastTime = 0;
let dropSpeed = 1000;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;

  if ((dropCounter > dropSpeed - (Number(level.textContent) * 100)) && gamePlay) {
    piece.position.y++;
    dropCounter = 0;

    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }

  level.textContent = Math.floor((Number(score.textContent) / 100));

  if (!gameOver && gamePlay) draw();

  window.requestAnimationFrame(update);
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = "#555";
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = piece.color;
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });
}

update();

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    piece.position.y++;
    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }
  if (e.key === "ArrowRight") {
    piece.position.x++;
    if (checkCollision()) piece.position.x--;
  }
  if (e.key === "ArrowLeft") {
    piece.position.x--;
    if (checkCollision()) piece.position.x++;
  }
  if (e.key === "ArrowUp") {
    const rotated = [];

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = [];

      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i]);
      }

      rotated.push(row);
    }

    const previousShape = piece.shape;
    piece.shape = rotated;
    if (checkCollision()) {
      piece.shape = previousShape;
    }
  }
});

function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      );
    });
  });
}

function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    });
  });

  // Reset position
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2);
  piece.position.y = 0;

  // Get random shape
  piece.shape = getRandomShape();
  piece.color = getRandomColor();

  // Game Over
  if (checkCollision()) {
    gameOverModal.style.visibility = "visible";
    gameOver = true;
    music.pause();
    board.forEach((row) => row.fill(0));
  }
}

function removeRows() {
  const rowsToRemove = [];

  board.forEach((row, y) => {
    if (row.every((value) => value === 1)) {
      rowsToRemove.push(y);
    }
  });

  for (let i = rowsToRemove.length; i !== 0; i--) {
    let currentScore = Number(score.textContent);
    score.textContent = currentScore + (i * 10);
  }

  rowsToRemove.forEach((y) => {
    board.splice(y, 1);
    const newRow = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);
  });
}
