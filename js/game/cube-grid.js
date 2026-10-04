export const GRID_N = 8;

export const FACES = {
  front: { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  right: { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
  back: { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
  left: { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  up: { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  down: { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
};

export const add = (a, b, scale = 1) => a.map((value, index) => value + b[index] * scale);
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const negate = (a) => a.map((value) => -value);
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export function tileToCube({ face, row, col }, n = GRID_N) {
  const { n: normal, u, v } = FACES[face];
  return add(add(normal, u, (2 * (col + 0.5)) / n - 1), v, (2 * (row + 0.5)) / n - 1);
}

export function cubeToTile(point, n = GRID_N) {
  const face = Object.keys(FACES).reduce((best, name) =>
    dot(point, FACES[name].n) > dot(point, FACES[best].n) ? name : best);
  const toIndex = (value) => Math.min(n - 1, Math.max(0, Math.floor(((value + 1) / 2) * n)));
  return {
    face,
    row: toIndex(dot(point, FACES[face].v)),
    col: toIndex(dot(point, FACES[face].u)),
  };
}

export const tileKey = ({ face, row, col }) => `${face}:${row}:${col}`;

export function step(tile, dir, n = GRID_N) {
  const half = 1 / n;
  const point = tileToCube(tile, n);
  const next = add(point, dir, 2 * half);
  if (dot(next, dir) <= 1) {
    return { tile: cubeToTile(next, n), dir };
  }
  const normal = FACES[tile.face].n;
  return {
    tile: cubeToTile(add(add(point, dir, half), normal, -half), n),
    dir: negate(normal),
  };
}

export function randomFreeTile(occupied, n = GRID_N, random = Math.random) {
  const free = [];
  for (const face of Object.keys(FACES)) {
    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        const tile = { face, row, col };
        if (!occupied.has(tileKey(tile))) {
          free.push(tile);
        }
      }
    }
  }
  return free.length ? free[Math.floor(random() * free.length)] : null;
}
