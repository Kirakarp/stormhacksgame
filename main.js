import * as THREE from '/node_modules/three/build/three.module.js';
import { setupEnvironment } from './js/assets/environment.js';
import { createRenderer, startAnimation, watchRendererResize } from './js/assets/renderer.js';
import { createSphere } from './js/assets/sphere.js';
import { createMinimap } from './js/minimap/minimap-renderer.js';
import { createView } from './js/assets/view.js';

const canvas = document.querySelector('#webglcanvas');
const scene = new THREE.Scene();
const renderer = createRenderer(canvas);
const { camera, controls } = createView(renderer);
const minimap = createMinimap(renderer);

setupEnvironment(scene);
createSphere(scene);
watchRendererResize(renderer, camera);

startAnimation(renderer, controls, scene, camera, minimap.render(camera, controls.target));