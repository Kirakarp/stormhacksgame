import * as THREE from '/node_modules/three/build/three.module.js';
import { getCubeFacePoint } from './cube-face-mapping.js';
import { addCubeNetFace } from './cube-net-geometry.js';
import { cubeNetConfig } from './minimap-config.js';

/**
 * Creates the cube-net minimap indicator.
 * @returns {{scene: THREE.Scene, camera: THREE.OrthographicCamera, update: Function}}
 */
export function createCubeNetIndicator() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(...cubeNetConfig.camera);
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);

  const faceMaterials = {};
  Object.entries(cubeNetConfig.facePositions).forEach(([face, position]) => {
    faceMaterials[face] = new THREE.MeshBasicMaterial({
      color: cubeNetConfig.faceColor,
      transparent: true,
      opacity: cubeNetConfig.faceOpacity,
    });
    addCubeNetFace(scene, faceMaterials[face], position);
  });

  const marker = new THREE.Mesh(
    new THREE.CircleGeometry(cubeNetConfig.markerRadius, 16),
    new THREE.MeshBasicMaterial({
      color: cubeNetConfig.markerColor,
      depthTest: false,
    }),
  );
  marker.renderOrder = 10;
  scene.add(marker);

  /**
   * Updates the active face and marker position.
   * @param {{x: number, y: number, z: number}} direction - Current normalized sphere direction.
   * @returns {void}
   */
  function update(direction) {
    const point = getCubeFacePoint(direction);
    Object.values(faceMaterials).forEach((material) => {
      material.color.set(cubeNetConfig.faceColor);
    });
    faceMaterials[point.face].color.set(cubeNetConfig.activeFaceColor);
    const [faceX, faceY] = cubeNetConfig.facePositions[point.face];
    marker.position.set(
      faceX + point.u * cubeNetConfig.faceSize / 2,
      faceY + point.v * cubeNetConfig.faceSize / 2,
      0.05,
    );
  }

  return {
    scene,
    camera,
    update,
  };
}
