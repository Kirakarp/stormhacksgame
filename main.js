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

const STEP_MS = 160;

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
const otterView = createOtterView(scene, SPHERE_RADIUS, camera);
controls.enabled = false;
const followCamera = createFollowCamera(camera, otterView);
const scoreHud = createScoreHud();

let holdingForward = false;
let lastStep = 0;

function stepForward() {
  tick(game);
  lastStep = performance.now();
}

watchOtterInput({
  onForwardStart: () => {
    holdingForward = true;
    stepForward();
  },
  onForwardStop: () => {
    holdingForward = false;
  },
  onTurn: (side) => turn(game, side),
  onRestart: () => {
    if (game.status === 'dead') {
      game = restart(game);
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
  if (holdingForward && performance.now() - lastStep >= STEP_MS) {
    stepForward();
  }
  otterView.update(game);
  scoreHud.update(game);
  renderMinimap();
}

startAnimation(renderer, followCamera, scene, camera, updateOtter, composer);