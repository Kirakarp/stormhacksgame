import * as THREE from '/node_modules/three/build/three.module.js';
import cubeSphereVertexShader from '../shaders/cube-sphere.vert.glsl?raw';
import cubeSphereFragmentShader from '../shaders/cube-sphere.frag.glsl?raw';

/**
 * Adds the cube-sphere shader mesh to a scene.
 * @param {THREE.Scene} scene - Scene receiving the sphere.
 * @returns {THREE.Mesh} Configured sphere mesh.
 */
export function createSphere(scene) {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(0x4da3ff) },
        gridColor: { value: new THREE.Color(0x1f667f) },
        gridWidth: { value: 0.035 },
        pixelSize: { value: 5.0 },
        colorSteps: { value: 7.0 },
      },
      vertexShader: cubeSphereVertexShader,
      fragmentShader: cubeSphereFragmentShader,
    }),
  );
  scene.add(sphere);

  return sphere;
}
