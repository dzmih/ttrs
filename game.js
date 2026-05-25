(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const overlayEl = document.getElementById("gameOverOverlay");
  const restartBtn = document.getElementById("restartBtn");

  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const downBtn = document.getElementById("downBtn");
  const rotateBtn = document.getElementById("rotateBtn");

  const COLS = 10;
  const ROWS = 20;
  const BASE_DROP_MS = 800;
  const MIN_DROP_MS = 120;
  const SOFT_DROP_MS = 200;
  const SOFT_DROP_DELAY_MS = 180;

  const COLORS = {
    I: "#56d5ff",
    J: "#6c8cff",
    L: "#ffb347",
    O: "#f7e65c",
    S: "#69e39b",
    T: "#c58cff",
    Z: "#ff7b7b",
  };

  const SHAPES = {
    I: [
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
      ],
    ],
    J: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [0, 2],
        [1, 2],
      ],
    ],
    L: [
      [
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [0, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
    ],
    O: [
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1],
      ],
    ],
    S: [
      [
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      [
        [1, 1],
        [2, 1],
        [0, 2],
        [1, 2],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    ],
    T: [
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    ],
    Z: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [2, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [0, 2],
      ],
    ],
  };

  const PIECE_TYPES = Object.keys(SHAPES);

  let board = createBoard();
  let bag = [];
  let currentPiece = null;
  let score = 0;
  let linesCleared = 0;
  let gameOver = false;
  let lastTime = 0;
  let dropAccumulator = 0;
  let softDrop = false;
  let softDropPieceId = null;
  let softDropStartedAt = 0;
  let pieceIdCounter = 0;
  let cellSize = 30;

  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function refillBag() {
    bag = PIECE_TYPES.slice();
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }

  function nextType() {
    if (bag.length === 0) {
      refillBag();
    }
    return bag.pop();
  }

  function createPiece(type = nextType()) {
    return {
      id: ++pieceIdCounter,
      type,
      rotation: 0,
      x: 3,
      y: 0,
      color: COLORS[type],
    };
  }

  function resizeCanvas() {
    const shell = canvas.parentElement;
    const width = shell.clientWidth - 24;
    const heightLimit = Math.min(window.innerHeight * 0.62, width * 2);
    cellSize = Math.floor(Math.min(width / COLS, heightLimit / ROWS));
    const boardWidth = cellSize * COLS;
    const boardHeight = cellSize * ROWS;

    canvas.width = boardWidth;
    canvas.height = boardHeight;
    canvas.style.width = `${boardWidth}px`;
    canvas.style.height = `${boardHeight}px`;
    canvas.parentElement.style.display = "flex";
    canvas.parentElement.style.justifyContent = "center";
  }

  function drawCell(x, y, color) {
    const px = x * cellSize;
    const py = y * cellSize;
    const radius = Math.max(3, cellSize * 0.18);

    ctx.fillStyle = color;
    roundRect(ctx, px + 1, py + 1, cellSize - 2, cellSize - 2, radius);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    roundRect(
      ctx,
      px + 2,
      py + 2,
      cellSize - 4,
      Math.max(4, cellSize * 0.18),
      radius,
    );
    ctx.fill();
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize + 0.5, 0);
      ctx.lineTo(x * cellSize + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize + 0.5);
      ctx.lineTo(canvas.width, y * cellSize + 0.5);
      ctx.stroke();
    }
  }

  function drawBoard() {
    drawGrid();

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if (board[y][x]) {
          drawCell(x, y, board[y][x]);
        }
      }
    }

    if (currentPiece) {
      drawPiece(currentPiece);
    }
  }

  function drawPiece(piece) {
    const blocks = SHAPES[piece.type][piece.rotation];
    for (const [dx, dy] of blocks) {
      const x = piece.x + dx;
      const y = piece.y + dy;
      if (y >= 0) {
        drawCell(x, y, piece.color);
      }
    }
  }

  function isValidPosition(
    piece,
    offsetX = 0,
    offsetY = 0,
    rotation = piece.rotation,
  ) {
    const blocks = SHAPES[piece.type][rotation];
    for (const [dx, dy] of blocks) {
      const x = piece.x + dx + offsetX;
      const y = piece.y + dy + offsetY;
      if (x < 0 || x >= COLS || y >= ROWS) {
        return false;
      }
      if (y >= 0 && board[y][x]) {
        return false;
      }
    }
    return true;
  }

  function mergePiece() {
    const blocks = SHAPES[currentPiece.type][currentPiece.rotation];
    for (const [dx, dy] of blocks) {
      const x = currentPiece.x + dx;
      const y = currentPiece.y + dy;
      if (y < 0) {
        gameOver = true;
        return;
      }
      board[y][x] = currentPiece.color;
    }
  }

  function clearLines() {
    let cleared = 0;
    const filtered = board.filter((row) => {
      const full = row.every(Boolean);
      if (full) {
        cleared += 1;
      }
      return !full;
    });

    while (filtered.length < ROWS) {
      filtered.unshift(Array(COLS).fill(null));
    }

    board = filtered;

    if (cleared > 0) {
      linesCleared += cleared;
      const lineScores = [0, 100, 300, 500, 800];
      score += lineScores[cleared] || cleared * 200;
      scoreEl.textContent = String(score);
    }
  }

  function spawnPiece() {
    currentPiece = createPiece();
    currentPiece.x = 3;
    currentPiece.y = -1;

    if (!isValidPosition(currentPiece, 0, 0, currentPiece.rotation)) {
      gameOver = true;
    }
  }

  function lockAndContinue() {
    mergePiece();
    if (gameOver) {
      showGameOver();
      return;
    }

    clearLines();
    spawnPiece();

    if (gameOver) {
      showGameOver();
    }
  }

  function movePiece(dx, dy) {
    if (!currentPiece || gameOver) {
      return false;
    }

    if (isValidPosition(currentPiece, dx, dy)) {
      currentPiece.x += dx;
      currentPiece.y += dy;
      return true;
    }
    return false;
  }

  function rotatePiece() {
    if (!currentPiece || gameOver || currentPiece.type === "O") {
      return;
    }

    const nextRotation = (currentPiece.rotation + 1) % 4;
    const kicks = [0, -1, 1, -2, 2];

    for (const kick of kicks) {
      if (isValidPosition(currentPiece, kick, 0, nextRotation)) {
        currentPiece.rotation = nextRotation;
        currentPiece.x += kick;
        return;
      }
    }
  }

  function getDropInterval() {
    // Speed increases both with cleared lines and with score.
    // linesCleared contributes a steady speedup; score adds gradual difficulty.
    const linesSpeed = Math.min(linesCleared * 12, 600);
    const scoreSpeed = Math.min(Math.floor(score / 500) * 15, 500);
    const totalSpeed = Math.min(linesSpeed + scoreSpeed, 800);
    return Math.max(MIN_DROP_MS, BASE_DROP_MS - totalSpeed);
  }

  function hardDropStep() {
    if (!movePiece(0, 1)) {
      lockAndContinue();
    }
  }

  function update(delta) {
    if (gameOver) {
      return;
    }

    dropAccumulator += delta;
    const softDropActive =
      softDrop &&
      currentPiece &&
      softDropPieceId === currentPiece.id &&
      performance.now() - softDropStartedAt >= SOFT_DROP_DELAY_MS;
    const interval = softDropActive ? SOFT_DROP_MS : getDropInterval();

    while (dropAccumulator >= interval && !gameOver) {
      dropAccumulator -= interval;
      if (!movePiece(0, 1)) {
        lockAndContinue();
        break;
      }
    }
  }

  function renderFrame(timestamp) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    update(delta);
    drawBoard();

    requestAnimationFrame(renderFrame);
  }

  function showGameOver() {
    overlayEl.classList.add("visible");
    overlayEl.setAttribute("aria-hidden", "false");
  }

  function hideGameOver() {
    overlayEl.classList.remove("visible");
    overlayEl.setAttribute("aria-hidden", "true");
  }

  function restartGame() {
    board = createBoard();
    score = 0;
    linesCleared = 0;
    gameOver = false;
    dropAccumulator = 0;
    softDrop = false;
    softDropPieceId = null;
    softDropStartedAt = 0;
    pieceIdCounter = 0;
    scoreEl.textContent = "0";
    hideGameOver();
    refillBag();
    spawnPiece();
  }

  function bindButtonPress(button, onTap, onHoldStart, onHoldEnd) {
    const start = (event) => {
      event.preventDefault();
      onTap();
      if (onHoldStart) {
        onHoldStart();
      }
    };

    const stop = (event) => {
      event.preventDefault();
      if (onHoldEnd) {
        onHoldEnd();
      }
    };

    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("pointerleave", stop);
  }

  function setupControls() {
    bindButtonPress(leftBtn, () => movePiece(-1, 0));
    bindButtonPress(rightBtn, () => movePiece(1, 0));
    bindButtonPress(rotateBtn, () => rotatePiece());
    bindButtonPress(
      downBtn,
      () => {},
      () => {
        softDrop = true;
        softDropPieceId = currentPiece ? currentPiece.id : null;
        softDropStartedAt = performance.now();
      },
      () => {
        softDrop = false;
        softDropPieceId = null;
        softDropStartedAt = 0;
      },
    );

    restartBtn.addEventListener("click", restartGame);

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        movePiece(-1, 0);
      } else if (event.key === "ArrowRight") {
        movePiece(1, 0);
      } else if (event.key === "ArrowDown") {
        softDrop = true;
        softDropPieceId = currentPiece ? currentPiece.id : null;
        softDropStartedAt = performance.now();
      } else if (event.key === "ArrowUp" || event.key === "x") {
        rotatePiece();
      } else if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        while (movePiece(0, 1)) {}
        lockAndContinue();
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "ArrowDown") {
        softDrop = false;
        softDropPieceId = null;
        softDropStartedAt = 0;
      }
    });
  }

  function setupSwipeControls() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    canvas.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      startY = event.clientY;
      startTime = performance.now();
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointerup", (event) => {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const elapsed = performance.now() - startTime;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const minDistance = 24;
      const maxTapTime = 180;

      if (elapsed <= maxTapTime && absX < minDistance && absY < minDistance) {
        rotatePiece();
        return;
      }

      if (absX > absY && absX >= minDistance) {
        if (dx > 0) {
          movePiece(1, 0);
        } else {
          movePiece(-1, 0);
        }
        return;
      }

      if (absY >= minDistance) {
        if (dy > 0) {
          softDrop = true;
          softDropPieceId = currentPiece ? currentPiece.id : null;
        } else {
          rotatePiece();
        }
      }
    });

    canvas.addEventListener("pointerleave", () => {
      softDrop = false;
      softDropPieceId = null;
      softDropStartedAt = 0;
    });
  }

  function setupTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();
    }
  }

  function init() {
    setupTelegram();
    resizeCanvas();
    setupControls();
    setupSwipeControls();
    refillBag();
    spawnPiece();
    drawBoard();
    requestAnimationFrame((timestamp) => {
      lastTime = timestamp;
      requestAnimationFrame(renderFrame);
    });
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawBoard();
  });

  init();
})();
