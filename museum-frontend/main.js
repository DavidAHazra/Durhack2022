import './style.css'
import * as THREE from "three"
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
let cat_map
let metadata = new Map()
const infoElement = document.getElementById("info")
const descElement = document.getElementById("description")
let prev_url = "";
function updateInfo(newInfoText, newDescText){
  if (newInfoText != infoElement.innerText){
    infoElement.innerText = newInfoText
    descElement.innerText = newDescText
  }
}
function load_painting(i, depth, j, is_left) {
  let paining_loader = new THREE.TextureLoader();
  let names = ["Buildings", "Children", "Events", "Portraits", "Scenery", "Society"]; 
  let url
  if (is_left) {
  url = cat_map[names[i]][depth*16+(j*2)]

  } else {
  url = cat_map[names[i]][depth*16+(j*2)+1]
  }

  paining_loader.load("resources/categories/" + names[i]+'/'+url, (texture) => {
    // do something with the texture
    var material = new THREE.MeshBasicMaterial( {
        map: texture
    });
    var frame_mat = new THREE.MeshStandardMaterial({color:0xd4af37})

    var aspect = texture.image.width/texture.image.height
    var geo = new THREE.BoxGeometry(0.1,texture.image.height*0.005,texture.image.width*0.005)
    var frame = new THREE.BoxGeometry(0.1,texture.image.height*0.005+0.1,texture.image.width*0.005+0.1)

    let paint1 = new THREE.Mesh(geo, material);
    let frame1 = new THREE.Mesh(frame, frame_mat);

    paint1.rotateY(Math.PI/2 + i * Math.PI/3)
    paint1.translateZ(-20.16026 - 3.1 * j + (-34.87165*depth))

    if (is_left) {
      paint1.translateX(-10.435823)
      paint1.translateX(0.02)

    } else {
      paint1.translateX(10.435823)
      paint1.translateX(-0.02)

    }

    paint1.position.y = 2
    scene.add(paint1);

    frame1.rotateY(Math.PI/2 + i * Math.PI/3)
    frame1.translateZ(-20.16026 - 3.1 * j + (-34.87165*depth))

    if (is_left) {
      frame1.translateX(-10.435823)

    } else {
      frame1.translateX(10.435823)
    }

    frame1.position.y = 2
    scene.add(frame1);
  });
}


const renderer = new THREE.WebGLRenderer({
})
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 120);
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
const playerLight = new THREE.PointLight(0xffffff, 0.5)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
const cameraRaycaster = new THREE.Raycaster(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), 0, 5);
function init() {
  onWindowResize();

  let roomsDeep = [69, 38, 58, 91, 56, 94];
  let names = ["Buildings", "Children", "Events", "Portraits", "Scenery", "Society"];

  window.addEventListener("resize", onWindowResize);
  scene.fog = new THREE.Fog(0xffffff, 0, 100)
  const skyboxGeometry = new THREE.SphereGeometry( 119, 60, 40 );
  skyboxGeometry.scale( - 1, 0.5, 1 );
  var skyboxMaterial = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("resources/SkyHDR.jpg", function (hdr){
    scene.environment = hdr
  })})
  skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
  scene.add(skybox)
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.PointLight(0xffffff, 0.5)
  sun.position.y = 4
  playerLight.position.y = 2;
  scene.add(playerLight)
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
        //corridorObjects[corridorLights.length - 1].add(corridorLights[corridorLights.length - 1])
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
    for(var depth = 0; depth < roomsDeep[i];depth++){
      for (var j = 0; j < 8; j++){
        load_painting(i, depth, j, true);
        
        load_painting(i, depth, j, false);
      }
    }
  }
  console.log(scene)
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
    var cameraPosition = new THREE.Vector3()
    var cameraDirection = new THREE.Vector3()
    camera.getWorldPosition(cameraPosition)
    camera.getWorldDirection(cameraDirection)
    cameraRaycaster.set(cameraPosition, cameraDirection)
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    direction.z = Number(moveForward) - Number(moveBackward)
    direction.x = Number(moveRight) - Number(moveLeft)
    direction.normalize();
    if ( moveForward || moveBackward ) velocity.z -= direction.z * 100.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 100.0 * delta;
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    var cameraIntersects = cameraRaycaster.intersectObjects(scene.children)
    if (cameraIntersects.length > 0){
      if(cameraIntersects[0]["object"]["material"]["map"]["image"]["src"]){
        var url_str = cameraIntersects[0]["object"]["material"]["map"]["image"]["src"];

        if (url_str != prev_url) {
          
          prev_url = url_str;
  
          url_str = url_str.split('/')
          url_str = url_str[url_str.length-1]
          url_str = '/images/'+url_str
          let meta_image = metadata.get(url_str)
  
          let title = meta_image['title'] + '\n'+ meta_image['startdate'] 
          let description = meta_image['description']
          updateInfo(title, description)
        }
      }
      else
        updateInfo('','')

    }
    else{
      updateInfo('','')

    }
  }
  skybox.position.x = camera.position.x;
  skybox.position.z = camera.position.z;
  playerLight.position.x = camera.position.x;
  playerLight.position.z = camera.position.z;
  skybox.rotateY(0.02 * delta)
  renderer.render(scene, camera)
}

fetch("resources/categories/cat_maps.json")
.then(data => data.json())
.then(json_data => {
  console.log(json_data);
  fetch("resources/categories/data_desc.json")
  .then(data => data.json())
  .then(json_data_2 => {
      console.log(json_data_2)
      cat_map=json_data
      for(var x = 0; x<json_data_2.length; x++){
        metadata.set(json_data_2[x]['mediaurl'],json_data_2[x])
      }
      console.log(metadata)

    init();
  });
});
