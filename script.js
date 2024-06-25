const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 15;
const INITIAL_COOKIES = 5;
const INITIAL_MOVABLES = 40;

let gameOver = false;
let board = [];
let urchin = { x: 0, y: 0 };
let cats = [];
let score = 0;
let dinoInterval;
const exit = { x: BOARD_WIDTH - 1, y: BOARD_HEIGHT - 1 };

const SVG_URCHIN = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <!-- Body -->
    <rect x="16" y="24" width="32" height="24" fill="#C0C0C0"/>
    <!-- Ears -->
    <rect x="12" y="16" width="8" height="8" fill="#C0C0C0"/>
    <rect x="44" y="16" width="8" height="8" fill="#C0C0C0"/>
    <!-- Eyes -->
    <rect x="24" y="28" width="4" height="4" fill="#000000"/>
    <rect x="36" y="28" width="4" height="4" fill="#000000"/>
    <!-- Nose -->
    <rect x="30" y="36" width="4" height="4" fill="#000000"/>
    <!-- Whiskers -->
    <rect x="18" y="36" width="8" height="2" fill="#000000"/>
    <rect x="38" y="36" width="8" height="2" fill="#000000"/>
    <rect x="18" y="38" width="8" height="2" fill="#000000"/>
    <rect x="38" y="38" width="8" height="2" fill="#000000"/>
    <!-- Tail -->
    <rect x="44" y="48" width="16" height="2" fill="#C0C0C0"/>
  </svg>`;

const SVG_DINO = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <!-- Body -->
    <rect x="5" y="10" width="10" height="5" fill="#FFD700" />
    <!-- Head -->
    <rect x="7" y="5" width="6" height="6" fill="#FFD700" />
    <!-- Eyes -->
    <rect x="8" y="6" width="1" height="1" fill="black" />
    <rect x="11" y="6" width="1" height="1" fill="black" />
    <!-- Mouth -->
    <rect x="9" y="8" width="2" height="1" fill="black" />
    <!-- Legs -->
    <rect x="5" y="15" width="2" height="3" fill="black" />
    <rect x="8" y="15" width="2" height="3" fill="black" />
    <rect x="10" y="15" width="2" height="3" fill="black" />
    <rect x="13" y="15" width="2" height="3" fill="black" />
    <!-- Tail -->
    <rect x="14" y="9" width="1" height="4" fill="black" />
    <rect x="13" y="9" width="1" height="1" fill="black" />
  </svg>`;

const SVG_CROWN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <path d="M2 18 L6 14 L10 18 L14 14 L18 18 L14 10 L18 6 L10 8 L6 2 L4 8 L2 6 L6 10 Z" fill="#FFD700" />
</svg>`;

const SVG_COOKIE = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <!-- Wedge -->
    <polygon points="4,2 4,18 18,10" fill="#FFD700" />
    <!-- Holes -->
    <circle cx="7" cy="10" r="1" fill="#FFA500" />
    <circle cx="11" cy="8" r="1" fill="#FFA500" />
    <circle cx="9" cy="14" r="1" fill="#FFA500" />
  </svg>`;

const SVG_EXIT = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <!-- Door Shape -->
    <path d="M5,15 Q10,5 15,15 Z" fill="#8B4513"/>
    <!-- Door Frame -->
    <path d="M5,15 Q10,5 15,15" stroke="#5D3A1A" stroke-width="1" fill="none"/>
  </svg>`;

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('start-button').addEventListener('click', initializeGame);
});

function initializeGame() {
  document.getElementById('game-container').style.display = 'block';
  document.getElementById('start-button').style.display = 'none';
  clearInterval(dinoInterval);

  gameOver = false; // Reset the gameOver flag

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    board[y] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      board[y][x] = 'empty';
    }
  }

  urchin = {
    x: Math.floor(BOARD_WIDTH / 2),
    y: Math.floor(BOARD_HEIGHT / 2)
  };
  board[urchin.y][urchin.x] = 'urchin';

  for (let i = 0; i < INITIAL_COOKIES; i++) {
    placeRandomly('cookie');
  }

  for (let i = 0; i < INITIAL_MOVABLES; i++) {
    placeRandomly('movable');
  }

  cats = [];
  const corners = [{
      x: 0,
      y: 0
    }, {
      x: BOARD_WIDTH - 1,
      y: 0
    },
    {
      x: 0,
      y: BOARD_HEIGHT - 1
    }, {
      x: BOARD_WIDTH - 1,
      y: BOARD_HEIGHT - 1
    }
  ];
      for (let i = 0; i < 3; i++) {
        let corner = corners[Math.floor(Math.random() * corners.length)];
        let dino;
        do {
          dino = {
            x: corner.x + Math.floor(Math.random() * 3),
            y: corner.y + Math.floor(Math.random() * 3)
          };
        } while (
          dino.x < 0 || dino.x >= BOARD_WIDTH || dino.y < 0 || dino.y >= BOARD_HEIGHT ||
          board[dino.y][dino.x] !== 'empty'
        );
        board[dino.y][dino.x] = 'dino';
        cats.push(dino);
      }

      score = 0;
      updateDisplay();
    }

    function showExitAnimation() {
      const gameBoard = document.getElementById('game-board');
      const exitCell = gameBoard.children[exit.y * BOARD_WIDTH + exit.x];

      // Add animation to the exit cell
      exitCell.classList.add('exit-animation');

      setTimeout(() => {
        alert(`You reached the exit! Your score: ${score}`);
        document.getElementById('start-button').style.display = 'block'; // Show the start button
        document.getElementById('game-container').style.display = 'none'; // Hide the game container
      }, 500);
    }

    function placeRandomly(item) {
      let x, y;
      do {
        x = Math.floor(Math.random() * BOARD_WIDTH);
        y = Math.floor(Math.random() * BOARD_HEIGHT);
      } while (board[y][x] !== 'empty');
      board[y][x] = item;
      return { x, y };
    }

    function moveUrchin(dx, dy) {
      let newX = urchin.x + dx;
      let newY = urchin.y + dy;

      if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) {
        return;
      }

      if (board[newY][newX] === 'empty') {
        board[urchin.y][urchin.x] = 'empty';
        urchin.x = newX;
        urchin.y = newY;
        board[urchin.y][urchin.x] = 'urchin';
      } else if (board[newY][newX] === 'cookie') {
        eatCookie(newX, newY);
      } else if (board[newY][newX] === 'movable') {
        pushBlock(urchin.x, urchin.y, dx, dy);
        board[urchin.y][urchin.x] = 'empty';
        urchin.x = newX;
        urchin.y = newY;
        board[urchin.y][urchin.x] = 'urchin';
      } else if (board[newY][newX] === 'exit') { // Check if urchin reaches the exit
        board[urchin.y][urchin.x] = 'empty';
        urchin.x = newX;
        urchin.y = newY;
        board[urchin.y][urchin.x] = 'urchin';
        showExitAnimation();
        return;
      }

      movecats();
      updateDisplay();
      checkGameOver();
    }

    function eatCookie(x, y) {
      board[urchin.y][urchin.x] = 'empty';
      urchin.x = x;
      urchin.y = y;
      board[y][x] = 'urchin';
      score += 10;
      document.getElementById('score').textContent = `Score: ${score}`;

      // Check if there are any cookies left
      let cookiesLeft = board.flat().includes('cookie');
      if (!cookiesLeft) {
        board[exit.y][exit.x] = 'exit';
      }
    }

    function pushBlock(x, y, dx, dy) {
      let nextX = x + dx;
      let nextY = y + dy;

      if (nextX < 0 || nextX >= BOARD_WIDTH || nextY < 0 || nextY >= BOARD_HEIGHT) {
        return;
      }

      let blocksToMove = [];
      let currentX = nextX;
      let currentY = nextY;

      while (board[currentY] && board[currentY][currentX] === 'movable') {
        blocksToMove.push({ x: currentX, y: currentY });
        currentX += dx;
        currentY += dy;
      }

      if (board[currentY] && (board[currentY][currentX] === 'empty' || board[currentY][currentX] === 'cookie')) {
        for (let i = blocksToMove.length - 1; i >= 0; i--) {
          let block = blocksToMove[i];
          board[block.y][block.x] = 'empty';
          block.x += dx;
          block.y += dy;
          board[block.y][block.x] = 'movable';
        }

        if (board[currentY][currentX] === 'cookie') {
          board[currentY][currentX] = 'empty'; // Remove the cookie
          score += 10; // Add points for the cookie
          document.getElementById('score').textContent = `Score: ${score}`;
          // Check if there are any cookies left
          let cookiesLeft = board.flat().includes('cookie');
          if (!cookiesLeft) {
            board[exit.y][exit.x] = 'exit';
          }
        }

        board[urchin.y][urchin.x] = 'empty';
        urchin.x = x;
        urchin.y = y;
        board[urchin.y][urchin.x] = 'urchin';
      }
    }

    function movecats() {
      for (let dino of cats) {
        let dx = Math.sign(urchin.x - dino.x);
        let dy = Math.sign(urchin.y - dino.y);

        if (Math.random() < 0.5) dx = 0;
        else dy = 0;

        let newX = dino.x + dx;
        let newY = dino.y + dy;

        if (newX >= 0 && newX < BOARD_WIDTH && newY >= 0 && newY < BOARD_HEIGHT) {
          if (board[newY][newX] === 'empty' || board[newY][newX] === 'urchin') {
            board[dino.y][dino.x] = 'empty';
            dino.x = newX;
            dino.y = newY;
            board[dino.y][dino.x] = 'dino';
          }
        }

        if (isSurroundedByBlocks(dino.x, dino.y)) {
          board[dino.y][dino.x] = 'crown';
        }

        if (checkGameOver()) return;
      }
      checkWinCondition();
    }

    function isSurroundedByBlocks(x, y) {
      const directions = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
      ];
      for (let dir of directions) {
        let newX = x + dir.dx;
        let newY = y + dir.dy;
        if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) {
          return false;
        }
        if (board[newY][newX] !== 'movable') {
          return false;
        }
      }
      return true;
    }

    function checkWinCondition() {
      if (cats.every(dino => board[dino.y][dino.x] === 'crown')) {
        setTimeout(() => {
          alert(`You win! Your score: ${score}`);
          document.getElementById('start-button').style.display = 'block'; // Show the start button
          document.getElementById('game-container').style.display = 'none'; // Hide the game container
        }, 500);
      }
    }

    function checkGameOver() {
      if (!gameOver && cats.some(dino => Math.abs(dino.x - urchin.x) <= 1 && Math.abs(dino.y - urchin.y) <= 1)) {
        gameOver = true;
        showDinoEatUrchinAnimation();
        return true;
      }
      return false;
    }

    function showDinoEatUrchinAnimation() {
      const gameBoard = document.getElementById('game-board');
      const urchinCell = gameBoard.children[urchin.y * BOARD_WIDTH + urchin.x];

      urchinCell.classList.add('flash');

      setTimeout(() => {
        if (!gameOver) return; // Ensure the alert only happens once
        alert(`Game Over! Your score: ${score}`);
        document.getElementById('start-button').style.display = 'block'; // Show the start button
        document.getElementById('game-container').style.display = 'none'; // Hide the game container
      }, 500);
    }

    function updateDisplay() {
      const gameBoard = document.getElementById('game-board');
      gameBoard.innerHTML = '';
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          switch (board[y][x]) {
            case 'urchin':
              cell.innerHTML = SVG_URCHIN;
              break;
            case 'cookie':
              cell.innerHTML = SVG_COOKIE;
              break;
            case 'movable':
              cell.style.backgroundColor = '#c0c0c0';
              break;
            case 'dino':
              cell.innerHTML = SVG_DINO;
              break;
            case 'crown':
              cell.innerHTML = SVG_CROWN;
              break;
            case 'exit':
              cell.innerHTML = SVG_EXIT;
              break;
          }
          gameBoard.appendChild(cell);
        }
      }
    }

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          moveUrchin(0, -1);
          break;
        case 'ArrowDown':
          moveUrchin(0, 1);
          break;
        case 'ArrowLeft':
          moveUrchin(-1, 0);
          break;
        case 'ArrowRight':
          moveUrchin(1, 0);
          break;
      }
    });

    initializeGame();
    document.getElementById('start-button').addEventListener('click', initializeGame);
