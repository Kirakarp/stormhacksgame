import * as THREE from '/node_modules/three/build/three.module.js';

/**
 * Adds a pulsing wormhole and star-streak field behind the sphere.
 * @param {THREE.Scene} scene - Scene receiving the hyperspace visuals.
 * @returns {{update: Function}} Hyperspace animation controller.
 */
export function createHyperspace(scene) {
  const group = new THREE.Group();
  const rings = [];
  const ringColors = [0x42e8ff, 0x8b5cff, 0xff4fd8, 0x42e8ff];
  const ringGeometry = new THREE.TorusGeometry(2.5, 0.035, 12, 96);

  ringColors.forEach((color, index) => {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeometry, material);
    ring.position.set(0, 0, -2.8 - index * 0.45);
    ring.scale.setScalar(1 + index * 0.2);
    group.add(ring);
    rings.push(ring);
  });

  const streakPositions = new Float32Array(120 * 3);
  const streakDirections = [];
  for (let index = 0; index < 120; index += 1) {
    const angle = index * 2.39996;
    const radius = 3 + (index % 9) * 0.5;
    streakPositions[index * 3] = Math.cos(angle) * radius;
    streakPositions[index * 3 + 1] = Math.sin(angle) * radius;
    streakPositions[index * 3 + 2] = -1.5 - (index % 12) * 0.35;
    streakDirections.push((index % 5 + 1) * 0.001);
  }
  const streakGeometry = new THREE.BufferGeometry();
  streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
  const streaks = new THREE.Points(
    streakGeometry,
    new THREE.PointsMaterial({
      color: 0xb8f7ff,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(streaks);
  scene.add(group);

  /**
   * Animates rings and star streaks.
   * @param {number} time - Current animation time in milliseconds.
   * @returns {void}
   */
  function update(time) {
    const pulse = 1 + Math.sin(time * 0.0015) * 0.035;
    rings.forEach((ring, index) => {
      ring.rotation.z = time * 0.0001 * (index % 2 ? -1 : 1);
      ring.scale.setScalar((1 + index * 0.2) * pulse);
      ring.material.opacity = 0.2 + (Math.sin(time * 0.002 + index) + 1) * 0.1;
    });

    for (let index = 0; index < 120; index += 1) {
      streakPositions[index * 3 + 2] += streakDirections[index] * 16;
      if (streakPositions[index * 3 + 2] > 3) {
        streakPositions[index * 3 + 2] = -6;
      }
    }
    streakGeometry.attributes.position.needsUpdate = true;
  }

  return { update };
}
