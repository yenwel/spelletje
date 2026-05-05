const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const timeEl = document.getElementById('time');
const messageEl = document.getElementById('message');
const startButton = document.getElementById('startButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

const state = {
  running: false,
  score: 0,
  lives: 3,
  timeLeft: 30,
  playerX: 0,
  playerWidth: 92,
  playerHeight: 44,
  playerBottom: 16,
  starSize: 26,
  pressed: new Set(),
  stars: [],
  spawnTimer: 0,
  countdownId: null,
  lastFrame: 0,
};

function updateHud() {
  scoreEl.textContent = state.score;
  livesEl.textContent = state.lives;
  timeEl.textContent = state.timeLeft;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setPlayerPosition(x) {
  const gameWidth = game.clientWidth;
  state.playerX = clamp(x, 0, gameWidth - state.playerWidth);
  player.style.transform = `translateX(${state.playerX}px)`;
}

function clearStars() {
  state.stars.forEach((star) => star.element.remove());
  state.stars = [];
}

function endGame(reason) {
  state.running = false;
  startButton.disabled = false;
  clearInterval(state.countdownId);
  state.countdownId = null;
  setMessage(reason);
}

function spawnStar() {
  const star = document.createElement('div');
  star.className = 'star';
  const x = Math.random() * (game.clientWidth - state.starSize);
  star.style.transform = `translate(${x}px, -30px)`;
  game.appendChild(star);
  state.stars.push({ element: star, x, y: -30, speed: 140 + Math.random() * 120 });
}

function step(timestamp) {
  if (!state.running) {
    return;
  }

  if (!state.lastFrame) {
    state.lastFrame = timestamp;
  }

  const delta = (timestamp - state.lastFrame) / 1000;
  state.lastFrame = timestamp;

  const direction = (state.pressed.has('ArrowRight') || state.pressed.has('d') ? 1 : 0)
    - (state.pressed.has('ArrowLeft') || state.pressed.has('a') ? 1 : 0);

  if (direction !== 0) {
    setPlayerPosition(state.playerX + direction * 360 * delta);
  }

  state.spawnTimer += delta;
  if (state.spawnTimer > 0.7) {
    spawnStar();
    state.spawnTimer = 0;
  }

  const playerTop = game.clientHeight - state.playerBottom - state.playerHeight;
  const playerBottom = playerTop + state.playerHeight;
  const caught = [];
  const missed = [];

  state.stars.forEach((star, index) => {
    star.y += star.speed * delta;
    star.element.style.transform = `translate(${star.x}px, ${star.y}px)`;

    const starRight = star.x + state.starSize;
    const starBottom = star.y + state.starSize;
    const playerRight = state.playerX + state.playerWidth;

    const overlapsX = starRight >= state.playerX && star.x <= playerRight;
    const overlapsY = starBottom >= playerTop && star.y <= playerBottom;

    if (overlapsX && overlapsY) {
      caught.push(index);
      state.score += 1;
      updateHud();
      setMessage('Lekker bezig! Blijf sterren vangen.');
    } else if (star.y > game.clientHeight) {
      missed.push(index);
      state.lives -= 1;
      updateHud();
      setMessage('Oei, je miste een ster.');
    }
  });

  [...caught, ...missed]
    .sort((a, b) => b - a)
    .forEach((index) => {
      state.stars[index].element.remove();
      state.stars.splice(index, 1);
    });

  if (state.lives <= 0) {
    endGame(`Game over! Je eindscore is ${state.score}.`);
    return;
  }

  requestAnimationFrame(step);
}

function startGame() {
  state.running = true;
  state.score = 0;
  state.lives = 3;
  state.timeLeft = 30;
  state.spawnTimer = 0;
  state.lastFrame = 0;
  clearStars();
  updateHud();
  setPlayerPosition((game.clientWidth - state.playerWidth) / 2);
  startButton.disabled = true;
  setMessage('Succes!');

  clearInterval(state.countdownId);
  state.countdownId = setInterval(() => {
    state.timeLeft -= 1;
    updateHud();

    if (state.timeLeft <= 0) {
      endGame(`Tijd om! Je eindscore is ${state.score}.`);
    }
  }, 1000);

  requestAnimationFrame(step);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'd') {
    state.pressed.add(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'd') {
    state.pressed.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  }
});

window.addEventListener('resize', () => {
  setPlayerPosition(state.playerX);
});

startButton.addEventListener('click', startGame);

updateHud();
setPlayerPosition((game.clientWidth - state.playerWidth) / 2);

function bindTouchControl(button, key) {
  const press = (event) => {
    state.pressed.add(key);
    event.preventDefault();
  };
  const release = (event) => {
    state.pressed.delete(key);
    event.preventDefault();
  };

  button.addEventListener('touchstart', press, { passive: false });
  button.addEventListener('touchend', release);
  button.addEventListener('touchcancel', release);
  button.addEventListener('mousedown', press);
  button.addEventListener('mouseup', release);
  button.addEventListener('mouseleave', release);
}

bindTouchControl(leftButton, 'ArrowLeft');
bindTouchControl(rightButton, 'ArrowRight');
