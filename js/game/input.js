const KEY_MOVES = {
  w: 'forward',
  arrowup: 'forward',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
};

export function watchOtterInput({ onForwardStart, onForwardStop, onTurn, onRestart }) {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'r' || key === ' ') {
      event.preventDefault();
      onRestart();
      return;
    }
    const move = KEY_MOVES[key];
    if (!move) {
      return;
    }
    event.preventDefault();
    if (event.repeat) {
      return;
    }
    if (move === 'forward') {
      onForwardStart();
    } else {
      onTurn(move);
    }
  });

  window.addEventListener('keyup', (event) => {
    if (KEY_MOVES[event.key.toLowerCase()] === 'forward') {
      onForwardStop();
    }
  });

  window.addEventListener('blur', onForwardStop);
}
