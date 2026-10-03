/**
 * UBC CPSC 314
 * Assignment 1 Template setup
 */

/**
 * Creates a basic scene and returns necessary objects
 * to manipulate the scene, camera and render context.
 */
function setup() {
    // Check WebGL Version
    if (!WEBGL.isWebGL2Available()) {
        document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    }

    // Get the canvas element and its drawing context from the HTML document.
    const canvas = document.getElementById('webglcanvas');
    const context = canvas.getContext('webgl2');

    // Construct a THREEjs renderer from the canvas and context.
    const renderer = new THREE.WebGLRenderer({ canvas, context });
    renderer.setClearColor(0X80CEE1); // blue background colour
    const scene = new THREE.Scene();

    // Set up the camera.
    const camera = new THREE.PerspectiveCamera(30.0, 1.0, 0.1, 1000.0); // view angle, aspect ratio, near, far
    camera.position.set(0.0, 30.0, 55.0);
    camera.lookAt(scene.position);
    scene.add(camera);

    // Setup orbit controls for the camera.
    const controls = new THREE.OrbitControls(camera, canvas);
    controls.damping = 0.2;
    controls.autoRotate = false;

    // Update projection matrix based on the windows size.
    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    // World Coordinate Frame: other objects are defined with respect to it.
    const worldFrame = new THREE.AxesHelper(1);
    scene.add(worldFrame);

    // Diffuse texture map (this defines the main colors of the floor)
    const floorDiff = new THREE.TextureLoader().load('images/cobblestone_floor_diff.jpg');
    // Ambient occlusion map
    const floorAo = new THREE.TextureLoader().load('images/cobblestone_floor_ao.jpg');
    // Displacement map
    const floorDisp = new THREE.TextureLoader().load('images/cobblestone_floor_disp.jpg');
    // Normal map
    const floorNorm = new THREE.TextureLoader().load('images/cobblestone_floor_nor.jpg');
    // Roughness map
    const floorRoughness = new THREE.TextureLoader().load('images/cobblestone_floor_rough.jpg');

    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorDiff,
        aoMap: floorAo,
        displacementMap: floorDisp,
        normalMap: floorNorm,
        roughnessMap: floorRoughness,
        side: THREE.DoubleSide
    });
    const floorGeometry = new THREE.PlaneBufferGeometry(30.0, 30.0);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2.0;
    floor.position.y = -0.3;
    scene.add(floor);
    floor.parent = worldFrame;

    // Cast a weak ambient light to make the floor visible.
    const light = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(light);

    return {
        renderer,
        scene,
        camera,
        worldFrame,
    };
}

/**
 * Utility function that loads obj files using THREE.OBJLoader
 * and places them in the scene using the given callback `place`.
 * 
 * The variable passed into the place callback is a THREE.Object3D.
 */
function loadAndPlaceOBJ(file, material, place) {
    const manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    const onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = xhr.loaded / xhr.total * 100.0;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    const loader = new THREE.OBJLoader(manager);
    loader.load(file, function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });
        place(object);
    }, onProgress);
}