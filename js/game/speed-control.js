const MIN_LEVEL = 1;
const MAX_LEVEL = 10;
const STORAGE_KEY = 'otterSpeedLevel';

export const levelToStepMs = (level) => 360 - (level - 1) * 30;

function loadLevel(fallback) {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved >= MIN_LEVEL && saved <= MAX_LEVEL ? saved : fallback;
  } catch {
    return fallback;
  }
}

function saveLevel(level) {
  try {
    localStorage.setItem(STORAGE_KEY, String(level));
  } catch {
    return;
  }
}

export function createSpeedControl(defaultLevel, onChange) {
  const panel = document.createElement('label');
  Object.assign(panel.style, {
    position: 'fixed',
    left: '16px',
    bottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    borderRadius: '8px',
    background: 'rgba(0, 0, 0, 0.55)',
    color: '#ffffff',
    font: '600 15px system-ui, sans-serif',
    userSelect: 'none',
  });

  const title = document.createElement('span');
  title.textContent = 'Speed';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = String(MIN_LEVEL);
  slider.max = String(MAX_LEVEL);
  slider.step = '1';
  slider.style.width = '140px';
  slider.style.cursor = 'pointer';

  const value = document.createElement('span');
  value.style.minWidth = '20px';
  value.style.textAlign = 'right';

  panel.append(title, slider, value);
  document.body.appendChild(panel);

  function apply(level) {
    slider.value = String(level);
    value.textContent = String(level);
    saveLevel(level);
    onChange(levelToStepMs(level));
  }

  slider.addEventListener('input', () => apply(Number(slider.value)));
  slider.addEventListener('change', () => slider.blur());
  slider.addEventListener('pointerup', () => slider.blur());

  apply(loadLevel(defaultLevel));
}
