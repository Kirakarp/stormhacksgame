import * as THREE from '/node_modules/three/build/three.module.js';


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry(1);


const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

camera.position.z = 5;

function animate( time ) {
    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );


