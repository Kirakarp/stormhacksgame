// The MIT License
// Created by Kirill Osipov --- zabidon
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

precision highp float;

uniform vec2 uResolution;
uniform float uTime;

// QUATERNION OPERATIONS
vec3 quat_rotate(vec4 quat, vec3 dir)
{
    return dir + 2.0 * cross(quat.xyz, cross(quat.xyz, dir) + quat.w * dir);
}

vec4 quat_decode(vec4 quat) {
    return normalize(quat * 2.0 - 1.0);
}

const float PI = 3.14159265359;
const float PI2 = 6.28318530718;

const float lightSpeed = 0.3;
const float INFINITY = 9000000.0;
const float ROOM_EDGE = 9000.0;
const float EPSILON = 0.0001;

const vec4 wormhole = vec4(0.0, 0.0, 3.0, 1.0);
const float wormholeGravityRatio = 0.5;
const float gravityWormhole = wormhole.w * lightSpeed * lightSpeed;

#define ID_ROOM1 2
#define ID_ROOM2 3

float sphereDistance(vec3 rayPosition, vec3 rayDirection, vec4 sphere) {
    vec3 v = rayPosition - sphere.xyz;
    float p = dot(rayDirection, v);
    float d = p * p + sphere.w * sphere.w - dot(v, v);
    return d < 0.0 ? -1.0 : -p - sqrt(d);
}

void testDistance(int i, float dist, inout float currentDistance, inout int currentObject) {
    if (dist >= EPSILON && dist < currentDistance) {
        currentDistance = dist;
        currentObject = i;
    }
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec3 position = vec3(0.0, 0.0, 5.0);
    vec4 rotation = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 velocity = vec4(0.0);
    vec4 room = vec4(0.0);

    rotation = quat_decode(rotation);

    vec3 ray = normalize(vec3(
        (fragCoord.xy - 0.5 * uResolution.xy) / uResolution.x,
        0.3 - 0.0 * length(velocity) / 666.0
    ));
    ray = quat_rotate(rotation, ray);

    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    float currentDistance = INFINITY;
    int currentObject = -1;
    float currentRoom = room.x;

    for (int i = 0; i < 100; i++) {
        currentDistance = INFINITY;
        vec3 gravity = wormhole.xyz - position;
        float wormholeDist = length(gravity);
        float stepSize = wormholeDist - wormhole.w * 0.90;
        if (stepSize <= 0.1) {
            break;
        }

        float amount = wormholeGravityRatio /
            (wormholeDist - wormhole.w * (1.0 - wormholeGravityRatio));
        vec3 rayAccel = normalize(gravity) * gravityWormhole * amount * amount;

        if (length(rayAccel) > lightSpeed) {
            rayAccel = normalize(rayAccel) * lightSpeed;
        }
        ray = normalize(ray * lightSpeed + rayAccel * stepSize);

        if (currentRoom < 0.5) {
            testDistance(ID_ROOM1, ROOM_EDGE, currentDistance, currentObject);
        } else {
            testDistance(ID_ROOM2, ROOM_EDGE, currentDistance, currentObject);
        }
        wormholeDist = lightSpeed * stepSize;

        float realWormholeDist = sphereDistance(position, ray, wormhole);
        if (realWormholeDist > 0.0 && realWormholeDist < wormholeDist) {
            currentRoom = 1.0 - currentRoom;
            vec3 intersection = position + ray * realWormholeDist;
            gravity = normalize(intersection - wormhole.xyz);
            position = 2.0 * wormhole.xyz - intersection;
            position += ray * realWormholeDist / 1.25;
        } else {
            position += ray * wormholeDist;
        }
    }

    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
    float tunnelRadius = length(uv);
    float spiral = sin(tunnelRadius * 38.0 - uTime * 8.0 + atan(uv.y, uv.x) * 12.0);
    float rings = 0.5 + 0.5 * sin((tunnelRadius * 32.0) - uTime * 6.0);
    float glow = 1.0 / (0.18 + abs(tunnelRadius - 0.5));
    float stars = pow(max(0.0, 1.0 - tunnelRadius * 1.8), 8.0);

    vec3 cyan = vec3(0.15, 0.9, 1.0);
    vec3 purple = vec3(0.7, 0.3, 1.0);
    vec3 base = vec3(0.02, 0.04, 0.10);
    vec3 tunnelColor = mix(cyan, purple, 0.5 + 0.5 * sin(uTime + tunnelRadius * 20.0));

    color.rgb = base;
    color.rgb += tunnelColor * (glow * 0.5 + rings * 0.35 + spiral * 0.15);
    color.rgb += vec3(0.6, 0.9, 1.0) * stars * 0.9;

    if (currentObject == ID_ROOM1 || currentObject == ID_ROOM2) {
        color.rgb = mix(color.rgb, vec3(0.8, 1.0, 1.0), 0.25);
    }

    gl_FragColor = color;
}
