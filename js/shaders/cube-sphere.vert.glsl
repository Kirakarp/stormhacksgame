uniform vec3 lightPosition;

varying vec3 worldPosition;
varying vec3 worldNormal;

void main() {
  vec4 cameraPosition = modelViewMatrix * vec4(position, 1.0);
  worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  worldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * cameraPosition;
}
