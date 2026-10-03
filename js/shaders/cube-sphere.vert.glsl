varying vec3 cubeSphereDirection;
varying vec3 sphereNormal;

void main() {
  cubeSphereDirection = normalize(position);
  sphereNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
