import * as THREE from '/node_modules/three/build/three.module.js';
import { cubeNetConfig } from './minimap-config.js';

/**
 * Adds a cube-net face and its subdivision grid to a scene.
 * @param {THREE.Scene} scene - Scene that receives the face geometry.
 * @param {THREE.Material} material - Material used to fill the face.
 * @param {number[]} position - Face center as [x, y] coordinates.
 * @returns {void}
 */
export function addCubeNetFace(scene, material, position) {
  const [x, y] = position;
  const faceSize = cubeNetConfig.faceSize;
  const tile = new THREE.Mesh(
    new THREE.PlaneGeometry(faceSize, faceSize),
    material,
  );
  tile.position.set(x, y, 0);
  scene.add(tile);

  const points = [];
  const divisions = cubeNetConfig.gridDivisions;
  for (let line = 0; line <= divisions; line += 1) {
    const offset = -faceSize / 2 + (faceSize / divisions) * line;
    points.push(
      new THREE.Vector3(-faceSize / 2, offset, 0.02),
      new THREE.Vector3(faceSize / 2, offset, 0.02),
      new THREE.Vector3(offset, -faceSize / 2, 0.02),
      new THREE.Vector3(offset, faceSize / 2, 0.02),
    );
  }

  const grid = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: cubeNetConfig.gridColor }),
  );
  grid.position.set(x, y, 0.03);
  scene.add(grid);
}
