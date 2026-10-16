import * as THREE from "three";
import { INK, PAPER, RED } from "../ink-200/geometry";
import { TRIPLE_GRID, tripleBlockBounds, tripleProjectionVolume } from "./triple-projection";

export function createTripleProjectionScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4.3, 4.3, 4.3, -4.3, .1, 40);
  camera.position.set(8, 7, 9);
  camera.lookAt(-.7, -.75, -.7);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb6b6b0, 2.6));

  const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
  const blockMaterial = new THREE.MeshStandardMaterial({ color: INK, roughness: .65, metalness: .08 });
  const volume = new THREE.InstancedMesh(blockGeometry, blockMaterial, TRIPLE_GRID ** 3);
  volume.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  volume.count = 0;
  volume.castShadow = true;
  scene.add(volume);

  const screenGeometry = new THREE.PlaneGeometry(2.9, 2.9);
  const paperMaterial = new THREE.MeshBasicMaterial({ color: PAPER, side: THREE.DoubleSide });
  const shadowMaterial = new THREE.ShadowMaterial({ color: INK, opacity: 1 });
  const secondsMaterial = new THREE.ShadowMaterial({ color: RED, opacity: 1 });
  for (const unit of ["hour", "minute", "second"]) {
    const screen = new THREE.Group();
    screen.name = `${unit}-projection`;
    if (unit === "hour") {
      screen.position.x = -4.1;
      screen.rotation.y = Math.PI / 2;
    } else if (unit === "minute") {
      screen.position.z = -4.1;
    } else {
      screen.position.y = -3.4;
      screen.rotation.x = -Math.PI / 2;
    }
    screen.add(new THREE.Mesh(screenGeometry, paperMaterial));
    const receiver = new THREE.Mesh(screenGeometry, unit === "second" ? secondsMaterial : shadowMaterial);
    receiver.position.z = .003;
    receiver.receiveShadow = true;
    screen.add(receiver);
    scene.add(screen);
  }

  const lights: THREE.DirectionalLight[] = [];
  for (const direction of [new THREE.Vector3(10, 0, 0), new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 10, 0)]) {
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.copy(direction);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    Object.assign(light.shadow.camera, { near: .5, far: 18, left: -1.38, right: 1.38, top: 1.38, bottom: -1.38 });
    if (direction.y > 0) light.shadow.camera.up.set(0, 0, -1);
    light.shadow.bias = -.00005;
    light.shadow.normalBias = 0;
    lights.push(light);
    scene.add(light);
  }

  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  let lastReading = "";
  let currentDate: Date | null = null;

  const update = (date: Date, force = false) => {
    currentDate = date;
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const reading = `${hour}:${minute}:${second}`;
    if (reading !== lastReading) {
      const blocks = tripleProjectionVolume(hour, minute, second);
      volume.count = blocks.length;
      blocks.forEach((block, index) => {
        const bounds = tripleBlockBounds(block);
        position.set(bounds.x, bounds.y, bounds.z);
        scale.set(bounds.width, bounds.height, bounds.depth);
        volume.setMatrixAt(index, matrix.compose(position, rotation, scale));
      });
      volume.instanceMatrix.needsUpdate = true;
      volume.computeBoundingBox();
      volume.computeBoundingSphere();
      renderer.shadowMap.needsUpdate = true;
      canvas.dataset.volumeBlocks = String(blocks.length);
      canvas.dataset.shadowHour = String(hour).padStart(2, "0");
      canvas.dataset.shadowMinute = String(minute).padStart(2, "0");
      canvas.dataset.shadowSecond = String(second).padStart(2, "0");
    } else if (!force) {
      return;
    }
    renderer.render(scene, camera);
    lastReading = reading;
    canvas.dataset.tripleProjectionReady = "true";
    canvas.dataset.sceneTime = String(date.getTime());
  };

  const resize = () => {
    const width = canvas.clientWidth || 384;
    const height = canvas.clientHeight || 384;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.left = -4.3 * aspect;
    camera.right = 4.3 * aspect;
    camera.updateProjectionMatrix();
    if (currentDate) update(currentDate, true);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return {
    update,
    dispose() {
      observer.disconnect();
      blockGeometry.dispose();
      blockMaterial.dispose();
      screenGeometry.dispose();
      paperMaterial.dispose();
      shadowMaterial.dispose();
      secondsMaterial.dispose();
      for (const light of lights) light.dispose();
      volume.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}