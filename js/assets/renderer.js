import * as THREE from '/node_modules/three/build/three.module.js';

/**
 * Creates and configures the main WebGL renderer.
 * @param {HTMLCanvasElement} canvas - Canvas used for rendering.
 * @returns {THREE.WebGLRenderer} Configured renderer.
 */
export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  return renderer;
}

/**
 * Updates renderer and camera dimensions after a window resize.
 * @param {THREE.WebGLRenderer} renderer - Main renderer.
 * @param {THREE.Camera} camera - Main perspective camera.
 * @returns {void}
 */
export function resizeRenderer(renderer, camera) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/**
 * Registers responsive renderer sizing.
 * @param {THREE.WebGLRenderer} renderer - Main renderer.
 * @param {THREE.Camera} camera - Main perspective camera.
 * @returns {void}
 */
export function watchRendererResize(renderer, camera) {
  /**
   * Recalculates the view after the browser window changes size.
   * @returns {void}
   */
  function handleResize() {
    resizeRenderer(renderer, camera);
  }

  window.addEventListener('resize', handleResize);
}

/**
 * Starts the main render loop and optional overlay pass.
 * @param {THREE.WebGLRenderer} renderer - Main renderer.
 * @param {{update: Function}} controls - Orbit controls updated each frame.
 * @param {THREE.Scene} scene - Main scene.
 * @param {THREE.Camera} camera - Main camera.
 * @param {Function} afterRender - Optional callback for overlay rendering.
 * @returns {void}
 */
export function startAnimation(renderer, controls, scene, camera, afterRender) {
  /**
   * Renders one main-scene frame and then the optional overlay pass.
   * @returns {void}
   */
  function animate() {
    controls.update();
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(scene, camera);
    if (afterRender) {
      afterRender();
    }
  }

  renderer.setAnimationLoop(animate);
}
