import * as THREE from '/node_modules/three/build/three.module.js';

const cubeVertices = [
  -1, -1, -1,
   1, -1, -1,
   1,  1, -1,
  -1,  1, -1,
  -1, -1,  1,
   1, -1,  1,
   1,  1,  1,
  -1,  1,  1,
];

const cubeIndices = [
  4, 5, 6, 4, 6, 7,
  0, 2, 1, 0, 3, 2,
  0, 4, 7, 0, 7, 3,
  1, 2, 6, 1, 6, 5,
  3, 7, 6, 3, 6, 2,
  0, 1, 5, 0, 5, 4,
];

/**
 * Creates a cube projected onto a sphere using Three.js polyhedron subdivision.
 * @param {number} radius - Radius of the resulting sphere.
 * @param {number} detail - Number of library subdivision passes.
 * @returns {THREE.PolyhedronGeometry} Subdivided cube-sphere geometry.
 */
export function createCubeSphereGeometry(radius, detail) {
  return new THREE.PolyhedronGeometry(
    cubeVertices,
    cubeIndices,
    radius,
    detail,
  );
}
