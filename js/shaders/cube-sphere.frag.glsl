uniform vec3 baseColor;
uniform vec3 rimColor;
uniform float rimPower;
uniform vec3 lightPosition;
uniform float bandCount;
uniform vec3 landColor;

varying vec3 worldPosition;
varying vec3 worldNormal;

vec2 cubeFaceCoordinates(vec3 direction) {
  vec3 absoluteDirection = abs(direction);
  if (absoluteDirection.x >= absoluteDirection.y && absoluteDirection.x >= absoluteDirection.z) {
    if (direction.x > 0.0) {
      return vec2(-direction.z, direction.y) / absoluteDirection.x;
    }
    return vec2(direction.z, direction.y) / absoluteDirection.x;
  }
  if (absoluteDirection.y >= absoluteDirection.z) {
    if (direction.y > 0.0) {
      return vec2(direction.x, -direction.z) / absoluteDirection.y;
    }
    return vec2(direction.x, direction.z) / absoluteDirection.y;
  }
  if (direction.z > 0.0) {
    return vec2(direction.x, direction.y) / absoluteDirection.z;
  }
  return vec2(-direction.x, direction.y) / absoluteDirection.z;
}

float landTile(vec2 coordinates, vec3 direction) {
  vec2 tile = floor((coordinates + 1.0) * 4.0);
  float land = 0.0;
  if (direction.z > 0.0 && abs(direction.z) >= abs(direction.x) && abs(direction.z) >= abs(direction.y)) {
    land = step(tile.x, 3.0) * step(2.0, tile.x) * step(tile.y, 3.0) * step(2.0, tile.y);
  } else if (direction.x > 0.0 && abs(direction.x) >= abs(direction.y) && abs(direction.x) >= abs(direction.z)) {
    land = step(tile.x, 2.0) * step(1.0, tile.x) * step(4.0, tile.y) * step(tile.y, 5.0);
  } else if (direction.y > 0.0 && abs(direction.y) >= abs(direction.x) && abs(direction.y) >= abs(direction.z)) {
    land = step(tile.x, 3.0) * step(2.0, tile.x) * step(tile.y, 2.0) * step(1.0, tile.y);
  }
  return land;
}

void main() {
  vec3 lightDirection = normalize(lightPosition - worldPosition);
  float diffuse = max(dot(worldNormal, lightDirection), 0.0);
  float lightBand = floor(diffuse * bandCount) / bandCount;
  vec3 color = baseColor * (0.25 + lightBand * 0.75);
  vec3 direction = normalize(worldPosition);
  float land = landTile(cubeFaceCoordinates(direction), direction);
  color = mix(color, landColor * (0.35 + lightBand * 0.65), land);
  vec3 viewDirection = normalize(cameraPosition - worldPosition);
  float rim = pow(1.0 - max(dot(worldNormal, viewDirection), 0.0), rimPower);
  color += rimColor * rim * 0.65;

  gl_FragColor = vec4(color, 1.0);
}