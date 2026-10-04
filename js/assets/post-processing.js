import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Creates the main scene post-processing pipeline.
 * @param {THREE.WebGLRenderer} renderer - Renderer used by the composer.
 * @param {THREE.Scene} scene - Main scene rendered into the composer.
 * @param {THREE.Camera} camera - Main camera rendered into the composer.
 * @returns {EffectComposer} Composer with a subtle bloom pass.
 */
export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
//   composer.addPass(new UnrealBloomPass(
//     { x: window.innerWidth, y: window.innerHeight },
//     0.02,
//     0.04,
//     0.1,
//   ));
  return composer;
}

/**
 * Resizes the post-processing render target.
 * @param {EffectComposer} composer - Composer being resized.
 * @returns {void}
 */
export function resizePostProcessing(composer) {
  composer.setSize(window.innerWidth, window.innerHeight);
}
