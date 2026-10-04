import * as THREE from '/node_modules/three/build/three.module.js';
import { setupEnvironment } from './js/assets/environment.js';
import { createRenderer, startAnimation, watchRendererResize } from './js/assets/renderer.js';
import { createPostProcessing, resizePostProcessing } from './js/assets/post-processing.js';
import { createSphere } from './js/assets/sphere.js';
import { createMinimap } from './js/minimap/minimap-renderer.js';
import { createView } from './js/assets/view.js';

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
/**
 * Renders the minimap overlays after the main scene.
 * @returns {void}
 */
function renderMinimap() {
  minimap.render(camera, controls.target);
}

startAnimation(renderer, controls, scene, camera, renderMinimap, composer);