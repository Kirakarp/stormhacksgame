import * as THREE from '/node_modules/three/build/three.module.js';
import { RGBELoader } from '/node_modules/three/examples/jsm/loaders/RGBELoader.js';

/**
 * Loads the HDRI and applies it as the scene background and environment.
 * @param {THREE.Scene} scene - Scene receiving the environment texture.
 * @returns {void}
 */
export function setupEnvironment(scene) {
  /**
   * Applies the loaded HDR texture to the scene.
   * @param {THREE.Texture} texture - Loaded equirectangular HDR texture.
   * @returns {void}
   */
  function handleEnvironmentLoad(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  }

  new RGBELoader().load('/assets/fade_gradient.hdr', handleEnvironmentLoad);
}
