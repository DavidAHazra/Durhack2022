import './style.css'
import * as THREE from "three"
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

const renderer = new THREE.WebGLRenderer({
})
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.y = 1.6;
const controls = new PointerLockControls(camera, document.body)
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();
const loader = new GLTFLoader();
const fontLoader = new FontLoader();
let skybox;
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function init() {
  onWindowResize();

  let roomsDeep = [69, 38, 58, 91, 56, 94];

  window.addEventListener("resize", onWindowResize);
  scene.fog = new THREE.Fog(0xffffff, 0, 60)
  const skyboxGeometry = new THREE.SphereGeometry( 79, 60, 40 );
  skyboxGeometry.scale( - 1, 0.5, 1 );
  var skyboxMaterial = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("resources/SkyHDR.jpg", function (hdr){
    scene.environment = hdr
  })})
  skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
  scene.add(skybox)
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.PointLight(0xffffff, 0.5)
  sun.position.y = 4
  console.log(sun.rotation)
  scene.add(sun)
  loader.load("resources/models/EntranceHall.glb", function (gltf) {
    const entranceHallObject = gltf.scene;
    scene.add(entranceHallObject)
  })
  loader.load("resources/models/Corridor.glb", function (gltf) {
    var corridorObjects = []
    var corridorLights = []
    for(var i = 0; i < 6; i++){
      for (let j = 0; j < roomsDeep[i]; ++j) {
        corridorObjects.push(gltf.scene.clone())
        corridorLights.push(new THREE.PointLight(0xffffff, 0.1))
        corridorLights[corridorLights.length - 1].translateZ(-5)
        corridorLights[corridorLights.length - 1].position.y = 3
        corridorObjects[corridorLights.length - 1].add(corridorLights[corridorLights.length - 1])
        corridorObjects[corridorLights.length - 1].scale.x = 1.01
        corridorObjects[corridorLights.length - 1].scale.y = 1.01
        corridorObjects[corridorLights.length - 1].rotateY(Math.PI/2 + i * Math.PI/3)
        corridorObjects[corridorLights.length - 1].translateZ(-8.66026)
        corridorObjects[corridorLights.length - 1].translateZ((-24.87165-10) * j)
        scene.add(corridorObjects[corridorLights.length - 1])  
      }
    }
    // const corridorObject = gltf.scene;
    // corridorObject.rotateY(Math.PI/2)
    // corridorObject.translateZ(-8.66026)
    // scene.add(corridorObject)
  })
  fontLoader.load("resources/Roboto Condensed_Bold.json", function (font) {
    let fontSignGeometries = []
    let fontSigns = []
    let signTexts = ["Buildings", "Children", "Events", "Portraits", "Scenery", "Society"];
    const fontMaterial = new THREE.MeshBasicMaterial({color: 0xDDDDDD})
    for(var i = 0; i < 6; i++){
      fontSignGeometries.push(new TextGeometry(signTexts[i], {
        font: font,
        size: 0.5,
        height: 0.1
      }))
      fontSigns.push(new THREE.Mesh(fontSignGeometries[i], fontMaterial))
      fontSigns[i].rotateY(Math.PI/2 + i * Math.PI/3)
      fontSigns[i].translateZ(-8.66026)
      fontSigns[i].translateX(-1)
      fontSigns[i].position.y = 5
      scene.add(fontSigns[i])
    }
  })
  loader.load("resources/models/Room.glb", function (gltf) {
    var rooms = []
    for(var i = 0; i < 6; i++){
      for (let j = 0; j < roomsDeep[i]; ++j) {
        rooms.push(gltf.scene.clone());
        rooms[rooms.length - 1].rotateY(Math.PI/2 + i * Math.PI/3)
        rooms[rooms.length - 1].translateZ(-8.66026-10)
        rooms[rooms.length - 1].translateZ((-24.87165-10) * j);
        scene.add(rooms[rooms.length - 1])  
      }
    }
  })
  let paintings = []
  for (var i = 0; i < 6; i++){
    paintings.push([])
    for (var j = 0; j < 8; j++){
      paintings[i].push(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()))
      paintings[i][2*j].rotateY(Math.PI/2 + i * Math.PI/3)
      paintings[i][2*j].translateZ(-20.16026 - 3.1 * j)
      paintings[i][2*j].translateX(-10.435823)
      paintings[i][2*j].position.y = 2
      scene.add(paintings[i][2*j])
      paintings[i].push(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()))
      paintings[i][2*j+1].rotateY(Math.PI/2 + i * Math.PI/3)
      paintings[i][2*j+1].translateZ(-20.16026 - 3.1 * j)
      paintings[i][2*j+1].translateX(10.435823)
      paintings[i][2*j+1].position.y = 2
      scene.add(paintings[i][2*j+1])
    }
  }
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
      case "Enter":
        controls.getObject().position.x = 0;
        controls.getObject().position.z = 0;
        break
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
    if ( moveForward || moveBackward ) velocity.z -= direction.z * 100.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 100.0 * delta;
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
  }
  skybox.position.x = camera.position.x;
  skybox.position.z = camera.position.z;
  skybox.rotateY(0.02 * delta)
  renderer.render(scene, camera)
}
init();