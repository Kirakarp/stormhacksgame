# Hyper Otter: code documentation

Hyper Otter is a snake-style game played on a small planet. The planet is a cube that has been inflated into a sphere, so the play area is six square grids (one per cube face) stitched together. The otter moves on its own, the player steers it left and right, and it grows by eating coffee cups and GitHub logos. Two pairs of tunnels let it jump across the planet.

The project uses plain JavaScript, Three.js and Vite. There is no framework.

## Running it

```
npm install
npx vite
```

Then open the URL Vite prints (usually http://localhost:5173/).

If `npx vite` fails with "Permission denied", the `node_modules/.bin/vite` launcher lost its execute bit (this happens because `node_modules` is checked into git from Windows). Run Vite through Node instead:

```
node node_modules/vite/bin/vite.js
```

Use Vite rather than a plain static server such as Live Server. `js/assets/sphere.js` imports its shaders with `?raw`, which only Vite understands.

## Controls

| Key | Action |
| --- | --- |
| A or Left arrow | Turn left |
| D or Right arrow | Turn right |
| R or Space | Restart after game over |

The speed slider in the bottom left corner sets how fast the otter moves. The score is shown in the top left.

## Project layout

```
index.html                 page with the canvas, loads main.js
main.js                    entry point, wires everything together
js/game/                   game rules and everything drawn for the game
  cube-grid.js             tiles, faces, movement and edge wrapping
  otter-game.js            game state: moving, eating, dead, score, food
  tunnels.js               tunnel pairs, teleport logic and tunnel visuals
  otter-renderer.js        draws the otter and food, follow camera
  input.js                 keyboard handling
  hud.js                   score display
  speed-control.js         speed slider
js/assets/                 scene setup (renderer, camera, planet, sky)
js/minimap/                compass and cube net overlays in the top right
js/shaders/                planet surface shaders
assets/                    images and the HDR sky
test.html, test.js         early 2D prototype of the wrapping, not used by the game
```

The game rules in `cube-grid.js` and `otter-game.js` do not import Three.js. They work on plain arrays and objects, which means they can be run and tested directly in Node without a browser. Three.js is only used for drawing.

## How the grid works

### Tiles

Every position on the planet is a tile:

```js
{ face: 'front', row: 3, col: 5 }
```

There are six faces (`front`, `right`, `back`, `left`, `up`, `down`), each with `GRID_N` by `GRID_N` tiles. `GRID_N` is 8, so there are 384 tiles in total. `col` counts from left to right across a face and `row` counts from bottom to top.

`tileKey(tile)` turns a tile into a string like `"front:3:5"`, which is used for set lookups and comparisons.

### Faces

Each face in `FACES` is described by three direction vectors:

- `n` is the direction the face points outward from the centre of the cube. It is also the centre of the face.
- `u` is the 3D direction of "right" on that face.
- `v` is the 3D direction of "up" on that face.

```js
front: { n: [0, 0, 1],  u: [1, 0, 0],  v: [0, 1, 0] },
right: { n: [1, 0, 0],  u: [0, 0, -1], v: [0, 1, 0] },
...
```

These match the orientation used by the minimap (`js/minimap/cube-face-mapping.js`) and the planet shader, so all three agree on which way each face is turned.

### Tile to 3D and back

The cube used for the maths runs from -1 to 1 on every axis.

`tileToCube(tile)` gives the centre of a tile as a point on the cube:

```
a = 2 * (col + 0.5) / N - 1
b = 2 * (row + 0.5) / N - 1
point = n + a * u + b * v
```

`a` and `b` go from -1 at one edge of the face to 1 at the other. The `+ 0.5` puts the point in the middle of the tile instead of on its corner, so it never sits exactly on a face edge.

`cubeToTile(point)` does the reverse. The face is whichever one the point leans towards the most (the largest `dot(point, n)`). Then `dot(point, u)` and `dot(point, v)` give back `a` and `b`, which are turned into `col` and `row`.

To put a tile on the sphere, normalise the cube point and multiply by the sphere radius. `tileToWorld` in `otter-renderer.js` does this.

### Moving and wrapping over edges

`step(tile, dir)` moves one tile in direction `dir`, which is always one of the current face's `u`, `-u`, `v` or `-v`.

1. Convert the tile to a cube point and move it forward by one tile width (`2 / N`).
2. If the point is still on the face (`dot(next, dir) <= 1`), convert it back to a tile and keep the same direction.
3. Otherwise the otter walked off the edge. Move half a tile forward to reach the edge, then half a tile down the side of the cube (`-n`). That point is the centre of the first tile on the neighbouring face. The new direction is `-n` of the face it just left, which is "down the side".

The same rule works for every edge of the cube, so there is no table of which edge connects to which. It also handles edges where the row or column order flips, because the face vectors take care of that.

Turning uses the cross product with the face normal. Left is `cross(n, dir)` and right is `cross(dir, n)`. This is in `turn()` in `otter-game.js`.

## Game state

`createGame()` in `otter-game.js` returns one object that holds the whole game:

| Field | Meaning |
| --- | --- |
| `status` | `'moving'`, `'eating'` or `'dead'` |
| `body` | list of tiles, head first |
| `dir` | current heading as a 3D direction |
| `foods` | one entry per food type, each `{ type, tile }` |
| `score` | current score |
| `eatTicksLeft` | how many more steps the eating look lasts |
| `growPending` | how many more tiles the otter still has to grow |
| `steps` | number of steps taken, used by the renderer to start animations |

The otter starts four tiles long in the middle of the front face, heading up.

### One step (`tick`)

1. If the otter is dead, do nothing.
2. Work out the next tile with `step()`.
3. If that tile is a tunnel entrance, `teleportMove()` replaces it with the other end of the tunnel and picks a new heading there.
4. Check for food on the new tile.
5. Check for a collision with the body. The last body tile is ignored unless the otter is growing (it just ate, or `growPending` is above zero), because otherwise the tail moves out of the way on the same step. A collision sets `status` to `'dead'`.
6. Add the new tile to the front of the body.
7. If food was eaten, add its points, add its growth amount to `growPending`, set `status` to `'eating'` for `EAT_TICKS` steps and move that food to a random free tile.
8. If `growPending` is above zero, keep the tail and count `growPending` down by one. Otherwise remove the tail tile. This is how the otter grows: one extra tile per step until the growth is used up.
9. If no food was eaten this step and the otter is in the eating state, count `eatTicksLeft` down and switch back to `'moving'` when it reaches zero.

### States

```
moving  --eat food-->  eating  --2 steps later-->  moving
moving or eating  --hit own body-->  dead  --R or Space-->  new game
```

The otter keeps moving while it is in the eating state. That state only changes how the head looks.

### Food

`FOOD_POINTS` sets the food types and their scores, and `FOOD_GROWTH` sets how many tiles each one adds to the otter:

```js
export const FOOD_POINTS = { coffee: 10, github: 25 };
export const FOOD_GROWTH = { coffee: 1, github: 3 };
```

The growth is spread over the next few steps rather than added all at once. After eating a GitHub logo the tail stays still for three steps while the head keeps moving, so for those steps the tail counts as solid and a very tight turn back into it ends the game.

There is always one of each type on the planet. When one is eaten, only that one moves. New food is placed with `randomFreeTile()`, which avoids the otter's body and the other food.

## Tunnels

`js/game/tunnels.js` defines two tunnel pairs in `TUNNEL_SYSTEMS`:

| Pair | Colour | Ends |
| --- | --- | --- |
| cyan | `0x35e0ff` | front (row 1, col 1) and right (row 1, col 1) |
| gold | `0xffc857` | back (row 6, col 6) and left (row 6, col 6) |

Stepping onto either end of a pair puts the head on the other end. `teleportMove()` then chooses the exit heading from the four directions on the exit face. It prefers the direction closest to the one the otter was travelling in, but only among directions that point away from the entrance, so the otter does not walk straight back into the tunnel.

`createTunnelSystems()` builds the visuals: a glowing ring and a wireframe funnel at each end, a tube arching over the planet between the two ends, and particles swirling into each funnel. `update(time)` animates the particles and is called every frame from `main.js`.

## Rendering the game

### Otter and food (`otter-renderer.js`)

`createOtterView(scene, radius, camera, slideMs)` returns an object with `update(game)`, which is called every frame.

Every part of the otter is a small cube textured with one of the sprites in `assets/`, turned to face the camera every frame. Each time `game.steps` changes, every part slides from where it currently is to its new tile over `slideMs` milliseconds, so the movement is continuous instead of jumping a tile at a time.

| Part | Image |
| --- | --- |
| Head while moving | `Head normal.png` |
| Head while eating | `Head Eating.png` |
| Head after dying | `Head dead.png` |
| Second body tile, and the tile just before the tail | `Body main.png` |
| Other body tiles | `Body Add.png` |
| Last tile | `Feet.png` |

A small dark cube in front of the head acts as a nose and points the way the otter is heading. There is also a small extra `Feet.png` cube placed just under the head.

`OTTER_VISUALS` still holds a colour and a scale per state. Only the scale is used now (the head is drawn 1.35 times larger while eating). The colours are left over from before the sprites were added.

The otter images are loaded straight with `THREE.TextureLoader` from `/assets/...`. Unlike the food, nothing removes their black backgrounds, so the head and feet currently show up with black squares around them.

Food images are listed in `FOOD_VISUALS`. Each food is a flat square lying on its tile, rotated every frame so the picture stays upright on screen even as the camera turns. Both PNGs have a solid black background instead of transparency, so `removeBlackBackground()` makes near black pixels transparent when the image loads. The GitHub logo is a black disc, so its entry has `keepDisc: [x, y, radius]` (in image pixels) and everything inside that circle is kept. If an image fails to load, a plain coloured square is shown instead.

### Camera

`createFollowCamera(camera, otterView)` replaces the orbit controls during play (`controls.enabled = false` in `main.js`). Each frame it eases the camera towards a point above the otter's head, five units from the centre of the planet, and eases the camera's up vector towards the otter's heading. The result is that the otter always travels towards the top of the screen.

### Planet (`js/assets/sphere.js` and `js/shaders/`)

The surface is a cube subdivided and pushed out into a sphere (`cube-sphere-geometry.js`), drawn with a custom shader. The fragment shader does banded toon lighting, a rim glow around the edge, and paints a few green land patches on some faces.

The grid lines are drawn separately by `createGridLines()` from `GRID_N`, using the same face vectors as the game, so the lines always line up with the tiles the otter moves on.

### Background and sky

- `environment.js` loads `assets/fade_gradient.hdr` as the background and the lighting environment.
- `hyperspace.js` adds pulsing coloured rings and moving star streaks behind the planet.
- `js/shaders/hyperspace.vert.glsl` and `hyperspace.frag.glsl` are a wormhole shader (MIT licensed, by Kirill Osipov) that has been added to the repository but is not loaded by any code yet.
- `post-processing.js` sets up an `EffectComposer`. A bloom pass is written but commented out.

### Minimap

The top right corner shows two small overlays rendered into their own viewports: a compass with X, Y and Z axes, and a cube net with the face currently facing the camera highlighted. They are built in `js/minimap/` and configured in `minimap-config.js`. The minimap uses the horizontal cross layout (left, front, right, back in a row with up and down above and below front).

## Frame loop (`main.js`)

`startAnimation()` in `js/assets/renderer.js` runs every frame. In order it:

1. updates the follow camera,
2. renders the scene through the composer,
3. calls `updateOtter()` from `main.js`.

`updateOtter()` animates the hyperspace and tunnel effects, steps the game if enough time has passed, updates the otter view and the score, and draws the minimap.

The otter steps once every `stepMs` milliseconds. Turns are applied straight away, but only one turn is allowed per step. A second turn pressed before the next step is held until then. Without that, tapping the same direction twice very quickly would turn the otter round into its own neck.

## Settings worth knowing

| What | Where | Default |
| --- | --- | --- |
| Tiles per face edge | `GRID_N` in `js/game/cube-grid.js` | 8 |
| Food scores | `FOOD_POINTS` in `js/game/otter-game.js` | coffee 10, github 25 |
| Tiles each food adds | `FOOD_GROWTH` in `js/game/otter-game.js` | coffee 1, github 3 |
| Steps the eating look lasts | `EAT_TICKS` in `js/game/otter-game.js` | 2 |
| Starting length | `START_LENGTH` in `js/game/otter-game.js` | 4 |
| Default speed level | `DEFAULT_SPEED_LEVEL` in `main.js` | 7 |
| Time per step for a speed level | `levelToStepMs` in `js/game/speed-control.js` | 360 ms at level 1, 90 ms at level 10 |
| Tunnel positions and colours | `TUNNEL_SYSTEMS` in `js/game/tunnels.js` | two pairs |
| Planet radius | `SPHERE_RADIUS` in `js/assets/sphere.js` | 1.5 |

The chosen speed level is saved in the browser's localStorage under `otterSpeedLevel`.

## Known issues and loose ends

- Food can spawn on a tunnel tile. `randomFreeTile()` only avoids the body and the other food. Because the head is teleported before the food check, walking onto that tile sends the otter to the other end instead of eating the food. The only way to get it is to go in through the other end of the same tunnel. Adding the tunnel tiles to `occupiedKeys()` in `otter-game.js` would fix it.
- When the otter goes through a tunnel, the renderer slides each body part in a straight line from the entrance to the exit, so the body briefly cuts across the planet instead of vanishing into the tunnel.
- `main.js` passes `8` to `createTunnelSystems()` instead of `GRID_N`, and the tunnel positions are written for an 8 by 8 grid. Changing `GRID_N` means updating both.
- The land patches in the planet shader are hard coded for 8 tiles per face (`* 4.0` in `landTile`), and the minimap cube net always draws a 4 by 4 grid. Both are visual only.
- The otter sprites keep their black backgrounds (see "Otter and food" above), and the body parts are separate cubes with gaps between them. The removal used for the food images, `removeBlackBackground()`, would erase the eyes and nose on the heads because they are black too, so the heads need a version that only removes black touching the image border.
- The extra feet cube is positioned at `headPosition * 0.96`, which puts it under the head rather than at the tail.
- `Tile1.png`, `Tile2.png`, `Asset 7.png` and `Asset 8.png` in `assets/` are not used by any code yet, and neither is the hyperspace shader.
- `createHyperspace(scene, camera)` is called with a camera argument that the function does not use.
- `node_modules` is committed to the repository. Removing it from git and adding it to `.gitignore` would avoid the permission problem described in "Running it".
