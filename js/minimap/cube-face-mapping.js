/**
 * Finds the cube face and local coordinates for a unit direction.
 * @param {{x: number, y: number, z: number}} direction - Normalized sphere direction.
 * @returns {{face: string, u: number, v: number}} Face name and local coordinates from -1 to 1.
 */
export function getCubeFacePoint(direction) {
  const x = direction.x;
  const y = direction.y;
  const z = direction.z;
  const absoluteX = Math.abs(x);
  const absoluteY = Math.abs(y);
  const absoluteZ = Math.abs(z);

  // The largest component identifies the cube face touched by the direction.
  if (absoluteX >= absoluteY && absoluteX >= absoluteZ) {
    if (x >= 0) {
      return { face: 'right', u: -z / absoluteX, v: y / absoluteX };
    }
    return { face: 'left', u: z / absoluteX, v: y / absoluteX };
  }
  if (absoluteY >= absoluteZ) {
    if (y >= 0) {
      return { face: 'up', u: x / absoluteY, v: -z / absoluteY };
    }
    return { face: 'down', u: x / absoluteY, v: z / absoluteY };
  }
  if (z >= 0) {
    return { face: 'front', u: x / absoluteZ, v: y / absoluteZ };
  }
  return { face: 'back', u: -x / absoluteZ, v: y / absoluteZ };
}
