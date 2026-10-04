import {
  cross,
  FACES,
  GRID_N,
  randomFreeTile,
  step,
  tileKey,
} from './cube-grid.js';
import { teleportMove } from './tunnels.js';

export const FOOD_POINTS = { coffee: 10, github: 25 };
export const FOOD_TYPES = Object.keys(FOOD_POINTS);
export const EAT_TICKS = 2;
const START_LENGTH = 3;

function occupiedKeys(game, ignoreFood = null) {
  const keys = new Set(game.body.map(tileKey));
  game.foods.forEach((food) => {
    if (food !== ignoreFood && food.tile) {
      keys.add(tileKey(food.tile));
    }
  });
  return keys;
}

export function createGame(n = GRID_N, random = Math.random) {
  const middle = Math.floor(n / 2);
  const body = [];
  for (let index = 0; index < START_LENGTH; index += 1) {
    body.push({ face: 'front', row: middle - index, col: middle });
  }
  const game = {
    n,
    random,
    status: 'moving',
    body,
    dir: FACES.front.v,
    foods: [],
    score: 0,
    eatTicksLeft: 0,
    steps: 0,
  };
  FOOD_TYPES.forEach((type) => {
    game.foods.push({ type, tile: randomFreeTile(occupiedKeys(game), n, random) });
  });
  return game;
}

export function turn(game, side) {
  if (game.status === 'dead') {
    return game;
  }
  const normal = FACES[game.body[0].face].n;
  game.dir = side === 'left' ? cross(normal, game.dir) : cross(game.dir, normal);
  return game;
}

export function tick(game) {
  if (game.status === 'dead') {
    return game;
  }

  const head = game.body[0];
  let { tile, dir } = step(head, game.dir, game.n);
  ({ tile, dir } = teleportMove(tile, dir, game.n));
  const eaten = game.foods.find((food) => food.tile && tileKey(food.tile) === tileKey(tile));
  const blocking = eaten ? game.body : game.body.slice(0, -1);
  if (blocking.some((part) => tileKey(part) === tileKey(tile))) {
    game.status = 'dead';
    return game;
  }

  game.dir = dir;
  game.body.unshift(tile);
  game.steps += 1;

  if (eaten) {
    game.score += FOOD_POINTS[eaten.type];
    game.status = 'eating';
    game.eatTicksLeft = EAT_TICKS;
    eaten.tile = randomFreeTile(occupiedKeys(game, eaten), game.n, game.random);
    return game;
  }

  game.body.pop();
  if (game.status === 'eating') {
    game.eatTicksLeft -= 1;
    if (game.eatTicksLeft <= 0) {
      game.status = 'moving';
    }
  }
  return game;
}

export const restart = (game) => createGame(game.n, game.random);
