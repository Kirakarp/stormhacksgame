export const compassConfig = {
  camera: [-3.4, 3.4, 3.4, -3.4, 0.1, 20],
  axisLength: 3,
  axisHeadLength: 0.42,
  axisHeadWidth: 0.2,
  axes: [
    {
      label: 'X',
      direction: [1, 0, 0],
      color: 0xd94b68,
      labelColor: '#d94b68',
      labelOffset: [0.25, 0, 0],
    },
    {
      label: 'Y',
      direction: [0, 1, 0],
      color: 0x3b9b68,
      labelColor: '#3b9b68',
      labelOffset: [0, 0.25, 0],
    },
    {
      label: 'Z',
      direction: [0, 0, 1],
      color: 0x397bc4,
      labelColor: '#397bc4',
      labelOffset: [0, 0, 0.25],
    },
  ],
  sphereRadius: 1.35,
  sphereSegments: 24,
  sphereRings: 16,
  sphereColor: 0x38657f,
  sphereOpacity: 0.75,
  markerRadius: 0.18,
  markerColor: 0xff315d,
  arrowLength: 2.2,
  arrowHeadLength: 0.45,
  arrowHeadWidth: 0.24,
};

export const cubeNetConfig = {
  camera: [-2.2, 2.2, 1.7, -1.7, 0.1, 20],
  faceSize: 0.82,
  facePositions: {
    left: [-1.23, 0],
    front: [-0.41, 0],
    right: [0.41, 0],
    back: [1.23, 0],
    up: [-0.41, 0.82],
    down: [-0.41, -0.82],
  },
  faceColor: 0xd8eaf2,
  activeFaceColor: 0x9bcde0,
  faceOpacity: 0.85,
  gridColor: 0x38657f,
  gridDivisions: 4,
  markerRadius: 0.1,
  markerColor: 0xff315d,
};

export const minimapLayout = {
  sizeRatio: 0.22,
  margin: 20,
};
