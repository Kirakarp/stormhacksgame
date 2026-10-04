uniform vec3 baseColor;
uniform vec3 rimColor;
uniform float rimPower;
uniform vec3 lightPosition;
uniform float bandCount;

varying vec3 worldPosition;
varying vec3 worldNormal;

void main() {
  vec3 lightDirection = normalize(lightPosition - worldPosition);
  float diffuse = max(dot(worldNormal, lightDirection), 0.0);
  float lightBand = floor(diffuse * bandCount) / bandCount;
  vec3 color = baseColor * (0.25 + lightBand * 0.75);
  vec3 viewDirection = normalize(cameraPosition - worldPosition);
  float rim = pow(1.0 - max(dot(worldNormal, viewDirection), 0.0), rimPower);
  color += rimColor * rim * 0.65;

  gl_FragColor = vec4(color, 1.0);
}