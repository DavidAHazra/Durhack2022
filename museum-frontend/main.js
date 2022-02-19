import './style.css'
import * as THREE from "three"

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg")
})
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00ffff)
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function init() {
  onWindowResize();
  window.addEventListener("resize", onWindowResize);
  renderer.render(scene, camera);
  animate();
}
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera)
}
init();