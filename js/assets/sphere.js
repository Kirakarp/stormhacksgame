import * as THREE from '/node_modules/three/build/three.module.js';
import { createCubeSphereGeometry } from './cube-sphere-geometry.js';
import cubeSphereVertexShader from '../shaders/cube-sphere.vert.glsl?raw';
import cubeSphereFragmentShader from '../shaders/cube-sphere.frag.glsl?raw';

/**
 * Adds the cube-sphere shader mesh to a scene.
 * @param {THREE.Scene} scene - Scene receiving the sphere.
 * @returns {THREE.Mesh} Configured sphere mesh.
 */
export function createSphere(scene) {
  const geometry = createCubeSphereGeometry(1.5, 4);
  const surface = new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(0x4da3ff) },
        rimColor: { value: new THREE.Color(0x8ad9ff) },
        rimPower: { value: 2.8 },
        lightPosition: { value: new THREE.Vector3(4, 3, 5) },
        bandCount: { value: 6.0 },
      },
      vertexShader: cubeSphereVertexShader,
      fragmentShader: cubeSphereFragmentShader,
    }),
  );
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 10),
    new THREE.LineBasicMaterial({ color: 0x1f667f }),
  );
  scene.add(surface);
  scene.add(edges);

  return surface;
}
