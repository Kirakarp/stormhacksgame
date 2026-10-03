const N = 8;
const S = 15;
// right left   |   up down    | toward  away | n   dA   dB
const FACES = {
    top: { pos: [1, 0], n: [0, 1, 0], dA: [1, 0, 0], dB: [0, 0, 1] },
    left: { pos: [0, 1], n: [-1, 0, 0], dA: [0, 0, 1], dB: [0, -1, 0] },
    front: { pos: [1, 1], n: [0, 0, 1], dA: [1, 0, 0], dB: [0, -1, 0] },
    right: { pos: [2, 1], n: [1, 0, 0], dA: [0, 0, -1], dB: [0, -1, 0] },
    bottom: { pos: [1, 2], n: [0, -1, 0], dA: [1, 0, 0], dB: [0, 0, -1] },
    back: { pos: [1, 3], n: [0, 0, -1], dA: [1, 0, 0], dB: [0, 1, 0] },
}
const add = (u, v, s = 1) => u.map((x, k) => x + v[k] * s);
const negate = (v) => v.map((x) => -x);
const vector3dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];

//map pointon cell - > 3d point of the cube
function to_cube(face, i, j) {
    const { n, dA, dB } = FACES[face];
    return add(add(n, dA, 2 * (i + 0.5) / N - 1), dB, 2 * (j + 0.5) / N - 1);
}
function to_cell(p) {
    const face = Object.keys(FACES).reduce((a, b) => vector3dot(p, FACES[a].n) > vector3dot(p, FACES[b].n) ? a : b);
    const i = (x) => Math.min(N - 1, Math.max(0, Math.floor((x + 1) / 2 * N)));
    return { face, i: i(vector3dot(p, FACES[face].dA)), j: i(vector3dot(p, FACES[face].dB)) };
}
function move({ face, i, j, dir }) {
    const h = 1 / N;
    const p = to_cube(face, i, j);
    const next = add(p, dir, 2 * h);
    if (vector3dot(next, dir) <= 1) return { ...to_cell(next), dir };
    const n = FACES[face].n;
    return { ...to_cell(add(add(p, dir, h), n, -h)), dir: negate(n) };
}
let dot = { face: 'front', i: 4, j: 4, dir: negate(FACES.front.dB) };
const C = document.getElementById('c').getContext('2d');

function draw() {
    C.fillStyle = '#111';
    C.fillRect(0, 0, 360, 480);
    C.strokeStyle = '#555';
    for (const f in FACES) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++)
        C.strokeRect((FACES[f].pos[0] * N + i) * S, (FACES[f].pos[1] * N + j) * S, S, S);
    const P = FACES[dot.face].pos;
    C.fillStyle = '#ffd23f';
    C.fillRect((P[0] * N + dot.i) * S, (P[1] * N + dot.j) * S, S, S);
}

addEventListener('keydown', (e) => {
    const { dA, dB } = FACES[dot.face];
    const right = dA, left = negate(dA), down = dB, up = negate(dB);
    const d = {
        ArrowRight: right, d: right, D: right,
        ArrowLeft: left, a: left, A: left,
        ArrowDown: down, s: down, S: down,
        ArrowUp: up, w: up, W: up,
    }[e.key];
    if (!d) return;
    e.preventDefault();
    dot.dir = d;
    dot = move(dot);   // one step per key press
    draw();
});

draw();
