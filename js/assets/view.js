import * as THREE from '/node_modules/three/build/three.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';

/**
 * Creates the main camera and its orbit controls.
 * @param {THREE.WebGLRenderer} renderer - Renderer receiving pointer input.
 * @returns {{camera: THREE.PerspectiveCamera, controls: OrbitControls}} Main view objects.
 */
export function createView(renderer) {
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 1.5, 5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 2.5;
  controls.maxDistance = 10;
  controls.target.set(0, 0, 0);

  return { camera, controls };
}