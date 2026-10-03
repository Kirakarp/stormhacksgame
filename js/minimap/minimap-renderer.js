import * as THREE from '/node_modules/three/build/three.module.js';
import { createCompassIndicator } from './compass-indicator.js';
import { createCubeNetIndicator } from './cube-net-indicator.js';
import { minimapLayout } from './minimap-config.js';

/**
 * Creates and coordinates the minimap indicators.
 * @param {THREE.WebGLRenderer} renderer - Renderer used for inset viewports.
 * @returns {{render: Function}} Minimap render controller.
 */
export function createMinimap(renderer) {
  const compass = createCompassIndicator();
  const cubeNet = createCubeNetIndicator();
  const direction = new THREE.Vector3();
  const viewportSize = new THREE.Vector2();

  /**
   * Updates both indicators and renders their inset viewports.
   * @param {THREE.Camera} sourceCamera - Main camera to track.
   * @param {THREE.Vector3} target - Main orbit target.
   * @returns {void}
   */
  function render(sourceCamera, target) {
    direction.copy(sourceCamera.position).sub(target).normalize();
    compass.update(direction, sourceCamera);

    renderer.getSize(viewportSize);
    const size = Math.min(viewportSize.x, viewportSize.y) * minimapLayout.sizeRatio;
    const x = viewportSize.x - size - minimapLayout.margin;
    const y = viewportSize.y - size - minimapLayout.margin;
    const cubeNetY = Math.max(
      minimapLayout.margin,
      y - size - minimapLayout.margin,
    );

    renderViewport(renderer, compass, x, y, size, size);
    cubeNet.update(direction);
    renderViewport(renderer, cubeNet, x, cubeNetY, size, size);
  }

  return { render };
}

/**
 * Renders one indicator inside a clipped viewport.
 * @param {THREE.WebGLRenderer} renderer - Renderer used for the inset.
 * @param {{scene: THREE.Scene, camera: THREE.Camera}} indicator - Indicator to render.
 * @param {number} x - Viewport left coordinate.
 * @param {number} y - Viewport bottom coordinate.
 * @param {number} width - Viewport width.
 * @param {number} height - Viewport height.
 * @returns {void}
 */
function renderViewport(renderer, indicator, x, y, width, height) {
  renderer.clearDepth();
  renderer.setViewport(x, y, width, height);
  renderer.setScissor(x, y, width, height);
  renderer.setScissorTest(true);
  renderer.render(indicator.scene, indicator.camera);
}
