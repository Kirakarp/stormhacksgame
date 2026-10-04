export function createScoreHud() {
  const hud = document.createElement('div');
  Object.assign(hud.style, {
    position: 'fixed',
    top: '16px',
    left: '16px',
    padding: '8px 14px',
    borderRadius: '8px',
    background: 'rgba(0, 0, 0, 0.55)',
    color: '#ffffff',
    font: '600 18px system-ui, sans-serif',
    pointerEvents: 'none',
    whiteSpace: 'pre',
  });
  document.body.appendChild(hud);

  let lastText = '';

  function update(game) {
    const text = game.status === 'dead'
      ? `Score: ${game.score}\nGame over - press R to restart`
      : `Score: ${game.score}`;
    if (text !== lastText) {
      hud.textContent = text;
      lastText = text;
    }
  }

  return { update };
}
