import * as THREE from '/node_modules/three/build/three.module.js';
import { FACES, dot, tileKey, tileToCube } from './cube-grid.js';

export const TUNNEL_SYSTEMS = [
  {
    id: 'cyan',
    color: 0x35e0ff,
    ends: [
      { face: 'front', row: 1, col: 1 },
      { face: 'right', row: 1, col: 1 },
    ],
  },
  {
    id: 'gold',
    color: 0xffc857,
    ends: [
      { face: 'back', row: 6, col: 6 },
      { face: 'left', row: 6, col: 6 },
    ],
  },
];

const tunnelExits = new Map();
TUNNEL_SYSTEMS.forEach(({ ends }) => {
  tunnelExits.set(tileKey(ends[0]), ends[1]);
  tunnelExits.set(tileKey(ends[1]), ends[0]);
});

/**
 * Returns the paired exit for a portal tile, if one exists.
 * @param {{face: string, row: number, col: number}} tile - Candidate portal tile.
 * @returns {{face: string, row: number, col: number}|null} Paired exit tile.
 */
export function getTunnelExit(tile) {
  return tunnelExits.get(tileKey(tile)) || null;
}

/**
 * Teleports a newly entered head tile through a tunnel.
 * @param {{face: string, row: number, col: number}} tile - Newly stepped tile.
 * @returns {{face: string, row: number, col: number}} Exit tile or original tile.
 */
export function teleportTile(tile) {
  return getTunnelExit(tile) || tile;
}

/**
 * Teleports a tile and remaps its direction to avoid re-entering the exit.
 * @param {{face: string, row: number, col: number}} tile - Entered portal tile.
 * @param {number[]} direction - Current tangent travel direction.
 * @param {number} gridSize - Number of tiles across each face.
 * @returns {{tile: Object, dir: number[]}} Exit tile and safe tangent direction.
 */
export function teleportMove(tile, direction, gridSize) {
  const exit = getTunnelExit(tile);
  if (!exit) {
    return { tile, dir: direction };
  }

  const entryPoint = new THREE.Vector3(...tileToCube(tile, gridSize));
  const exitPoint = new THREE.Vector3(...tileToCube(exit, gridSize));
  const away = exitPoint.sub(entryPoint).normalize();
  const exitFace = FACES[exit.face];
  const candidates = [exitFace.u, exitFace.u.map((value) => -value), exitFace.v, exitFace.v.map((value) => -value)];
  let best = candidates[0];
  let bestScore = -Infinity;
  candidates.forEach((candidate) => {
    const alignment = dot(candidate, direction);
    const outward = dot(candidate, away.toArray());
    if (outward > 0 && alignment + outward * 0.5 > bestScore) {
      best = candidate;
      bestScore = alignment + outward * 0.5;
    }
  });
  return { tile: exit, dir: best };
}

/**
 * Adds visible portal mouths and raised tunnel tubes to the scene.
 * @param {THREE.Scene} scene - Scene receiving tunnel visuals.
 * @param {number} radius - Sphere radius.
 * @param {number} gridSize - Number of tiles across each face.
 * @returns {THREE.Group} Group containing all tunnel visuals.
 */
export function createTunnelSystems(scene, radius, gridSize) {
  const group = new THREE.Group();
  const portalGeometry = new THREE.TorusGeometry(radius * 0.07, radius * 0.018, 12, 32);
  const portalStart = new THREE.Vector3();
  const portalEnd = new THREE.Vector3();
  const particleSystems = [];

  TUNNEL_SYSTEMS.forEach((system) => {
    const material = new THREE.MeshBasicMaterial({
      color: system.color,
      transparent: true,
      opacity: 0.95,
    });
    const [startTile, endTile] = system.ends;
    portalStart.copy(tileToWorld(startTile, gridSize, radius));
    portalEnd.copy(tileToWorld(endTile, gridSize, radius));
    addPortal(group, portalGeometry, material, portalStart, radius);
    addPortal(group, portalGeometry, material, portalEnd, radius);
    particleSystems.push(addFunnelParticles(group, material, portalStart, radius));
    particleSystems.push(addFunnelParticles(group, material, portalEnd, radius));

    const midpoint = portalStart.clone().add(portalEnd).multiplyScalar(0.5).normalize();
    midpoint.multiplyScalar(radius * 1.16);
    const curve = new THREE.CatmullRomCurve3([
      portalStart,
      portalStart.clone().normalize().multiplyScalar(radius * 1.1),
      midpoint,
      portalEnd.clone().normalize().multiplyScalar(radius * 1.1),
      portalEnd,
    ]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 32, radius * 0.025, 8, false),
      material,
    );
    group.add(tube);
  });

  scene.add(group);
  return {
    group,
    update(time) {
      particleSystems.forEach((particles) => updateFunnelParticles(particles, time));
    },
  };
}

/**
 * Places a glowing portal ring tangent to the sphere surface.
 * @param {THREE.Group} group - Tunnel visual group.
 * @param {THREE.TorusGeometry} geometry - Shared ring geometry.
 * @param {THREE.Material} material - System color material.
 * @param {THREE.Vector3} position - Portal position on the sphere.
 * @param {number} radius - Sphere radius.
 * @returns {void}
 */
function addPortal(group, geometry, material, position, radius) {
  const portal = new THREE.Mesh(geometry, material);
  portal.position.copy(position);
  portal.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    position.clone().normalize(),
  );
  group.add(portal);
  const funnel = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.13, radius * 0.24, 24, 1, true),
    material,
  );
  funnel.position.copy(position).add(position.clone().normalize().multiplyScalar(radius * 0.1));
  funnel.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    position.clone().normalize(),
  );
  funnel.material = material.clone();
  funnel.material.wireframe = true;
  funnel.material.opacity = 0.55;
  group.add(funnel);
}

function addFunnelParticles(group, material, position, radius) {
  const normal = position.clone().normalize();
  const tangent = new THREE.Vector3().crossVectors(normal, new THREE.Vector3(0, 1, 0));
  if (tangent.lengthSq() < 0.01) {
    tangent.crossVectors(normal, new THREE.Vector3(1, 0, 0));
  }
  tangent.normalize();
  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
  const positions = new Float32Array(18 * 3);
  const points = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({
      color: material.color,
      size: radius * 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  points.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  group.add(points);
  return { points, positions, normal, tangent, bitangent, radius };
}

function updateFunnelParticles(system, time) {
  const particleCount = system.positions.length / 3;
  for (let index = 0; index < particleCount; index += 1) {
    const progress = ((time * 0.00035 + index / particleCount) % 1);
    const angle = progress * Math.PI * 5 + index;
    const spread = system.radius * (0.02 + progress * 0.11);
    const distance = system.radius * (0.03 + progress * 0.22);
    const point = system.normal.clone().multiplyScalar(distance)
      .addScaledVector(system.tangent, Math.cos(angle) * spread)
      .addScaledVector(system.bitangent, Math.sin(angle) * spread);
    const base = system.normal.clone().multiplyScalar(system.radius * 1.01).add(point);
    system.positions[index * 3] = base.x;
    system.positions[index * 3 + 1] = base.y;
    system.positions[index * 3 + 2] = base.z;
  }
  system.points.geometry.attributes.position.needsUpdate = true;
}

/**
 * Converts a grid tile to a point just above the sphere surface.
 * @param {{face: string, row: number, col: number}} tile - Grid tile.
 * @param {number} gridSize - Number of tiles across each face.
 * @param {number} radius - Sphere radius.
 * @returns {THREE.Vector3} World-space tile position.
 */
function tileToWorld(tile, gridSize, radius) {
  return new THREE.Vector3(...tileToCube(tile, gridSize))
    .normalize()
    .multiplyScalar(radius * 1.012);
}
