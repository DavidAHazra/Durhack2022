import './style.css'
import * as THREE from "three"
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"

const renderer = new THREE.WebGLRenderer({
})
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 10;
const controls = new PointerLockControls(camera, document.body)
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function init() {
  onWindowResize();
  window.addEventListener("resize", onWindowResize);
  scene.fog = new THREE.Fog(0xffffff, 0, 750)
  const testfloorgeometry = new THREE.PlaneGeometry(100, 100);
  testfloorgeometry.rotateX(-Math.PI/2)
  const floormaterial = new THREE.MeshBasicMaterial({color: 0x222222, side: THREE.DoubleSide})
  const testfloor = new THREE.Mesh(testfloorgeometry, floormaterial)
  scene.add(testfloor)
  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");
  instructions.addEventListener("click", function () {
    controls.lock();
  })
  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  })
  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  })
  scene.add(controls.getObject())
  
  const onKeyDown = function ( event ) {
    switch ( event.code ) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;
      case 'Space':
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break;
    }
  };
  const onKeyUp = function ( event ) {
    switch ( event.code ) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;
    }
  }
  document.addEventListener( 'keydown', onKeyDown );
  document.addEventListener( 'keyup', onKeyUp );
  document.body.appendChild(renderer.domElement)
  animate();
}
function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();
  if (controls.isLocked == true){
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    direction.z = Number(moveForward) - Number(moveBackward)
    direction.x = Number(moveRight) - Number(moveLeft)
    direction.normalize();
    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
  }
  renderer.render(scene, camera)
}
init();