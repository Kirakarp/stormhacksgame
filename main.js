import * as THREE from '/node_modules/three/build/three.module.js';
import { setupEnvironment } from './js/assets/environment.js';
import { createRenderer, startAnimation, watchRendererResize } from './js/assets/renderer.js';
import { createPostProcessing, resizePostProcessing } from './js/assets/post-processing.js';
import { createSphere, SPHERE_RADIUS } from './js/assets/sphere.js';
import { createMinimap } from './js/minimap/minimap-renderer.js';
import { createView } from './js/assets/view.js';
import { createGame, restart, tick, turn } from './js/game/otter-game.js';
import { createFollowCamera, createOtterView } from './js/game/otter-renderer.js';
import { watchOtterInput } from './js/game/input.js';
import { createScoreHud } from './js/game/hud.js';
import { createSpeedControl, levelToStepMs } from './js/game/speed-control.js';

const DEFAULT_SPEED_LEVEL = 7;
let stepMs = levelToStepMs(DEFAULT_SPEED_LEVEL);

const canvas = document.querySelector('#webglcanvas');
const scene = new THREE.Scene();
const renderer = createRenderer(canvas);
const { camera, controls } = createView(renderer);
const minimap = createMinimap(renderer);
const composer = createPostProcessing(renderer, scene, camera);

setupEnvironment(scene);
createSphere(scene);
watchRendererResize(renderer, camera);
window.addEventListener('resize', () => resizePostProcessing(composer));

let game = createGame();
const otterView = createOtterView(scene, SPHERE_RADIUS, camera, stepMs);
controls.enabled = false;
const followCamera = createFollowCamera(camera, otterView);
const scoreHud = createScoreHud();
createSpeedControl(DEFAULT_SPEED_LEVEL, (ms) => {
  stepMs = ms;
  otterView.setSlideMs(ms);
});

let lastStep = performance.now();
let turnedThisStep = false;
let queuedTurn = null;

function requestTurn(side) {
  if (turnedThisStep) {
    queuedTurn = side;
    return;
  }
  turn(game, side);
  turnedThisStep = true;
}

function stepForward() {
  tick(game);
  lastStep = performance.now();
  turnedThisStep = false;
  if (queuedTurn) {
    requestTurn(queuedTurn);
    queuedTurn = null;
  }
}

watchOtterInput({
  onTurn: requestTurn,
  onRestart: () => {
    if (game.status === 'dead') {
      game = restart(game);
      lastStep = performance.now();
      turnedThisStep = false;
      queuedTurn = null;
    }
  },
});

/**
 * Renders the minimap overlays after the main scene.
 * @returns {void}
 */
function renderMinimap() {
  minimap.render(camera, followCamera.target);
}

function updateOtter() {
  if (game.status !== 'dead' && performance.now() - lastStep >= stepMs) {
    stepForward();
  }
  otterView.update(game);
  scoreHud.update(game);
  renderMinimap();
}

startAnimation(renderer, followCamera, scene, camera, updateOtter, composer);