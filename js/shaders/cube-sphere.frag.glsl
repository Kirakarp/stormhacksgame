uniform vec3 baseColor;
uniform vec3 gridColor;
uniform float gridWidth;
uniform float pixelSize;
uniform float colorSteps;

varying vec3 cubeSphereDirection;
varying vec3 sphereNormal;

float cubeGridLine(float coordinate) {
  float scaled = (coordinate + 1.0) * 2.0;
  return min(fract(scaled), 1.0 - fract(scaled));
}

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

void main() {
  vec3 direction = normalize(cubeSphereDirection);
  vec2 faceCoordinates = cubeFaceCoordinates(direction);
  float gridDistance = min(
    cubeGridLine(faceCoordinates.x),
    cubeGridLine(faceCoordinates.y)
  );
  float grid = 1.0 - smoothstep(gridWidth * 0.4, gridWidth, gridDistance);

  vec3 lightDirection = normalize(vec3(0.5, 0.8, 1.0));
  float diffuse = max(dot(normalize(sphereNormal), lightDirection), 0.0);
  vec3 color = baseColor * (0.35 + diffuse * 0.65);
  color = mix(color, gridColor, grid);

  vec2 screenPixel = floor(gl_FragCoord.xy / pixelSize);
  float pixelTone = mod(screenPixel.x + screenPixel.y, 2.0);
  color = floor(color * colorSteps) / colorSteps;
  color *= mix(0.96, 1.0, pixelTone);

  gl_FragColor = vec4(color, 1.0);
}
