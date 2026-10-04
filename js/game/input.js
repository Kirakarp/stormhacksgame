const KEY_TURNS = {
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
};

export function watchOtterInput({ onTurn, onRestart }) {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'r' || key === ' ') {
      event.preventDefault();
      onRestart();
      return;
    }
    const side = KEY_TURNS[key];
    if (!side) {
      return;
    }
    event.preventDefault();
    if (!event.repeat) {
      onTurn(side);
    }
  });
}
