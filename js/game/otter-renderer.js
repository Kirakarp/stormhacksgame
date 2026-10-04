import * as THREE from '/node_modules/three/build/three.module.js';
import { FACES, tileToCube } from './cube-grid.js';

export const OTTER_VISUALS = {
  moving: { color: 0x8b5a2b, scale: 1 },
  eating: { color: 0xc68642, scale: 1.35 },
  dead: { color: 0x777777, scale: 1 },
};

export const FOOD_VISUALS = {
  coffee: { sprite: './assets/Coffee Cup.png', color: 0xc62f2f },
  github: { sprite: './assets/Github Logo.png', color: 0x111111, keepDisc: [281, 203, 197] },
};

const BLACK_CUTOFF = 24;

const BODY_COLOR = 0x6b4423;

export function tileToWorld(tile, n, radius, lift = 1) {
  return new THREE.Vector3(...tileToCube(tile, n)).normalize().multiplyScalar(radius * lift);
}

function removeBlackBackground(image, keepDisc) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  for (let index = 0; index < data.length; index += 4) {
    if (keepDisc) {
      const x = (index / 4) % canvas.width;
      const y = Math.floor(index / 4 / canvas.width);
      if ((x - keepDisc[0]) ** 2 + (y - keepDisc[1]) ** 2 <= keepDisc[2] ** 2) {
        continue;
      }
    }
    if (data[index] < BLACK_CUTOFF && data[index + 1] < BLACK_CUTOFF && data[index + 2] < BLACK_CUTOFF) {
      data[index + 3] = 0;
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

function createFoodMaterial(type) {
  const visual = FOOD_VISUALS[type];
  const material = new THREE.MeshBasicMaterial({
    color: visual.color,
    transparent: true,
    alphaTest: 0.1,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  material.userData.aspect = 1;
  new THREE.ImageLoader().load(encodeURI(visual.sprite), (image) => {
    const texture = new THREE.CanvasTexture(removeBlackBackground(image, visual.keepDisc));
    texture.colorSpace = THREE.SRGBColorSpace;
    material.map = texture;
    material.color.set(0xffffff);
    material.userData.aspect = image.width / image.height;
    material.needsUpdate = true;
  }, undefined, () => {});
  return material;
}

const NOSE_COLOR = 0x1a1a1a;

function tileDirection(tile, n) {
  return new THREE.Vector3(...tileToCube(tile, n)).normalize();
}

export function createOtterView(scene, radius, camera, initialSlideMs) {
  let slideMs = initialSlideMs;
  const group = new THREE.Group();
  scene.add(group);

  const segmentGeometry = new THREE.SphereGeometry(1, 16, 12);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: BODY_COLOR });
  const headMaterial = new THREE.MeshStandardMaterial({ color: OTTER_VISUALS.moving.color });
  const head = new THREE.Mesh(segmentGeometry, headMaterial);
  const nose = new THREE.Mesh(segmentGeometry, new THREE.MeshStandardMaterial({ color: NOSE_COLOR }));
  group.add(head, nose);
  const segments = [];
  const foodSprites = {};
  const foodGeometry = new THREE.PlaneGeometry(1, 1);
  const foodNormal = new THREE.Vector3();
  const foodUp = new THREE.Vector3();
  const foodRight = new THREE.Vector3();
  const foodBasis = new THREE.Matrix4();

  let shownGame = null;
  let shownSteps = 0;
  let slideStart = 0;
  let from = [];
  let shown = [];
  const heading = new THREE.Vector3();
  const headPosition = new THREE.Vector3();
  const wantedHeading = new THREE.Vector3();

  function segmentAt(index) {
    while (segments.length <= index) {
      const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
      group.add(segment);
      segments.push(segment);
    }
    return segments[index];
  }

  function foodSprite(type) {
    if (!foodSprites[type]) {
      foodSprites[type] = new THREE.Mesh(foodGeometry, createFoodMaterial(type));
      group.add(foodSprites[type]);
    }
    return foodSprites[type];
  }

  function update(game, now = performance.now()) {
    const targets = game.body.map((tile) => tileDirection(tile, game.n));

    if (game !== shownGame) {
      shownGame = game;
      shownSteps = game.steps;
      from = targets.map((target) => target.clone());
      shown = targets.map((target) => target.clone());
      slideStart = -Infinity;
      heading.set(...game.dir);
    } else if (game.steps !== shownSteps) {
      shownSteps = game.steps;
      from = targets.map((_, index) => shown[Math.min(index, shown.length - 1)].clone());
      slideStart = now;
    }

    const progress = Math.min(1, (now - slideStart) / slideMs);
    shown = targets.map((target, index) => from[index].clone().lerp(target, progress).normalize());

    const cellSize = ((Math.PI / 2) / game.n) * radius;
    const visual = OTTER_VISUALS[game.status];

    headPosition.copy(shown[0]).multiplyScalar(radius * 1.02);
    head.position.copy(headPosition);
    head.scale.setScalar(cellSize * 0.45 * visual.scale);
    headMaterial.color.set(visual.color);

    wantedHeading.set(...game.dir);
    heading.lerp(wantedHeading, 0.25);
    heading.addScaledVector(shown[0], -heading.dot(shown[0])).normalize();
    nose.position.copy(headPosition).addScaledVector(heading, cellSize * 0.42 * visual.scale);
    nose.scale.setScalar(cellSize * 0.12);

    shown.slice(1).forEach((direction, index) => {
      const segment = segmentAt(index);
      segment.visible = true;
      segment.position.copy(direction).multiplyScalar(radius * 1.02);
      segment.scale.setScalar(cellSize * 0.38);
    });
    for (let index = shown.length - 1; index < segments.length; index += 1) {
      segments[index].visible = false;
    }

    game.foods.forEach((food) => {
      const sprite = foodSprite(food.type);
      sprite.visible = Boolean(food.tile);
      if (food.tile) {
        foodNormal.copy(tileDirection(food.tile, game.n));
        sprite.position.copy(foodNormal).multiplyScalar(radius * 1.004);
        foodUp.copy(camera.up).addScaledVector(foodNormal, -camera.up.dot(foodNormal));
        if (foodUp.lengthSq() < 1e-6) {
          foodUp.set(...FACES[food.tile.face].v);
        }
        foodUp.normalize();
        foodRight.crossVectors(foodUp, foodNormal);
        foodBasis.makeBasis(foodRight, foodUp, foodNormal);
        sprite.quaternion.setFromRotationMatrix(foodBasis);
        const size = cellSize * 0.9;
        const aspect = sprite.material.userData.aspect;
        sprite.scale.set(aspect >= 1 ? size : size * aspect, aspect >= 1 ? size / aspect : size, 1);
      }
    });
  }

  function setSlideMs(ms) {
    slideMs = ms;
  }

  return { update, setSlideMs, headPosition, heading };
}

export function createFollowCamera(camera, target, distance = 5) {
  const targetPosition = new THREE.Vector3();
  const origin = new THREE.Vector3();

  function update() {
    if (target.headPosition.lengthSq() === 0) {
      return;
    }
    targetPosition.copy(target.headPosition).normalize().multiplyScalar(distance);
    camera.position.lerp(targetPosition, 0.12);
    camera.up.lerp(target.heading, 0.12).normalize();
    camera.lookAt(origin);
  }

  return { update, target: origin };
}
