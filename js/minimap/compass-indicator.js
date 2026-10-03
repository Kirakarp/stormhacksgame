import * as THREE from '/node_modules/three/build/three.module.js';
import { compassConfig } from './minimap-config.js';

/**
 * Creates the spherical orientation indicator.
 * @returns {{scene: THREE.Scene, camera: THREE.OrthographicCamera, update: Function}} Indicator controller.
 */
export function createCompassIndicator() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(...compassConfig.camera);
  const origin = new THREE.Vector3();

  compassConfig.axes.forEach((axis) => addAxis(scene, axis, origin));

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(
      compassConfig.sphereRadius,
      compassConfig.sphereSegments,
      compassConfig.sphereRings,
    ),
    new THREE.MeshBasicMaterial({
      color: compassConfig.sphereColor,
      wireframe: true,
      transparent: true,
      opacity: compassConfig.sphereOpacity,
    }),
  );
  scene.add(sphere);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(compassConfig.markerRadius, 16, 12),
    new THREE.MeshBasicMaterial({
      color: compassConfig.markerColor,
      depthTest: false,
    }),
  );
  marker.renderOrder = 10;
  scene.add(marker);

  const arrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    origin,
    compassConfig.arrowLength,
    compassConfig.markerColor,
    compassConfig.arrowHeadLength,
    compassConfig.arrowHeadWidth,
  );
  arrow.line.material.depthTest = false;
  arrow.cone.material.depthTest = false;
  arrow.renderOrder = 9;
  scene.add(arrow);

  /**
   * Updates the compass viewpoint, marker, and orientation arrow.
   * @param {THREE.Vector3} direction - Normalized direction from target to camera.
   * @param {THREE.Camera} sourceCamera - Main camera whose up direction is followed.
   * @returns {void}
   */
  function update(direction, sourceCamera) {
    camera.position.copy(direction).multiplyScalar(6);
    camera.up.copy(sourceCamera.up);
    camera.lookAt(0, 0, 0);
    marker.position.copy(direction).multiplyScalar(1.5);
    arrow.setDirection(direction);
  }

  return { scene, camera, update };
}

/**
 * Adds one colored axis arrow and label to the compass scene.
 * @param {THREE.Scene} scene - Compass scene receiving the axis.
 * @param {Object} axis - Axis label, direction, and color configuration.
 * @param {THREE.Vector3} origin - Shared axis origin.
 * @returns {void}
 */
function addAxis(scene, axis, origin) {
  const arrow = new THREE.ArrowHelper(
    new THREE.Vector3(...axis.direction),
    origin,
    compassConfig.axisLength,
    axis.color,
    compassConfig.axisHeadLength,
    compassConfig.axisHeadWidth,
  );
  scene.add(arrow);
  const labelPosition = new THREE.Vector3(...axis.direction)
    .multiplyScalar(compassConfig.axisLength)
    .add(new THREE.Vector3(...axis.labelOffset));
  addAxisLabel(scene, axis.label, labelPosition, axis.labelColor);
}

/**
 * Creates a canvas-backed text sprite for an axis label.
 * @param {THREE.Scene} scene - Compass scene receiving the label.
 * @param {string} text - Label text to draw.
 * @param {THREE.Vector3} position - Label world position.
 * @param {string} color - CSS color used for the text.
 * @returns {void}
 */
function addAxisLabel(scene, text, position, color) {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 64;
  labelCanvas.height = 64;
  const context = labelCanvas.getContext('2d');
  context.fillStyle = color;
  context.font = 'bold 42px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 32, 32);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(labelCanvas),
    transparent: true,
  }));
  label.position.copy(position);
  label.scale.set(0.65, 0.65, 1);
  scene.add(label);
}
