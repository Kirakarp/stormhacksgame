import * as THREE from '/node_modules/three/build/three.module.js';
import { createCubeSphereGeometry } from './cube-sphere-geometry.js';
import cubeSphereVertexShader from '../shaders/cube-sphere.vert.glsl?raw';
import cubeSphereFragmentShader from '../shaders/cube-sphere.frag.glsl?raw';
import { add, FACES, GRID_N } from '../game/cube-grid.js';

export const SPHERE_RADIUS = 1.5;

const GRID_LINE_SAMPLES = 24;

function createGridLines(radius, cells) {
  const points = [];
  const onSphere = (face, a, b) => {
    const { n, u, v } = FACES[face];
    return new THREE.Vector3(...add(add(n, u, a), v, b)).normalize().multiplyScalar(radius * 1.002);
  };
  Object.keys(FACES).forEach((face) => {
    for (let line = 0; line <= cells; line += 1) {
      const fixed = (2 * line) / cells - 1;
      for (let sample = 0; sample < GRID_LINE_SAMPLES; sample += 1) {
        const start = (2 * sample) / GRID_LINE_SAMPLES - 1;
        const end = (2 * (sample + 1)) / GRID_LINE_SAMPLES - 1;
        points.push(onSphere(face, fixed, start), onSphere(face, fixed, end));
        points.push(onSphere(face, start, fixed), onSphere(face, end, fixed));
      }
    }
  });
  return new THREE.BufferGeometry().setFromPoints(points);
}

/**
 * Adds the cube-sphere shader mesh to a scene.
 * @param {THREE.Scene} scene - Scene receiving the sphere.
 * @returns {THREE.Mesh} Configured sphere mesh.
 */
export function createSphere(scene) {
  const geometry = createCubeSphereGeometry(SPHERE_RADIUS, 4);
  const surface = new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(0x4da3ff) },
        rimColor: { value: new THREE.Color(0x8ad9ff) },
        rimPower: { value: 2.8 },
        lightPosition: { value: new THREE.Vector3(4, 3, 5) },
        bandCount: { value: 6.0 },
        landColor: { value: new THREE.Color(0x45c96b) },
      },
      vertexShader: cubeSphereVertexShader,
      fragmentShader: cubeSphereFragmentShader,
    }),
  );
  const edges = new THREE.LineSegments(
    createGridLines(SPHERE_RADIUS, GRID_N),
    new THREE.LineBasicMaterial({ color: 0x1f667f }),
  );
  scene.add(surface);
  scene.add(edges);

  return surface;
}
