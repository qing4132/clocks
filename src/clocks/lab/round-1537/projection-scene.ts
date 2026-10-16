import * as THREE from "three";
import { blockBounds, projectionVolume } from "./projection";

export function createProjectionScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3.8, 3.8, 3.8, -3.8, .1, 40);
  camera.position.set(7, 5.2, 7.8);
  camera.lookAt(-.8, -.1, -.8);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb6b6b0, 3));

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: .6, metalness: .08 });
  const volume = new THREE.InstancedMesh(geometry, material, 847);
  volume.count = 0;
  volume.castShadow = true;
  scene.add(volume);

  const screenGeometry = new THREE.PlaneGeometry(2.85, 2.0);
  const paper = new THREE.MeshBasicMaterial({ color: "#fafaf7", side: THREE.DoubleSide });
  const shadow = new THREE.ShadowMaterial({ color: "#1a1a1a", opacity: 1 });
  const edgeGeometry = new THREE.EdgesGeometry(screenGeometry);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: "#1a1a1a", transparent: true, opacity: .15 });
  for (const side of ["hour", "minute"]) {
    const screen = new THREE.Group();
    if (side === "hour") {
      screen.position.x = -3.3;
      screen.rotation.y = Math.PI / 2;
    } else {
      screen.position.z = -3.3;
    }
    screen.add(new THREE.Mesh(screenGeometry, paper));
    const surface = new THREE.Mesh(screenGeometry, shadow);
    surface.position.z = .003;
    surface.receiveShadow = true;
    screen.add(surface);
    const edge = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edge.position.z = .006;
    screen.add(edge);
    scene.add(screen);
  }

  for (const direction of [new THREE.Vector3(10, 0, 0), new THREE.Vector3(0, 0, 10)]) {
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.copy(direction);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    Object.assign(light.shadow.camera, { near: .5, far: 18, left: -1.5, right: 1.5, top: 1.1, bottom: -1.1 });
    light.shadow.bias = -.00005;
    light.shadow.normalBias = 0;
    scene.add(light);
  }

  const railGeometry = new THREE.CylinderGeometry(.012, .012, 2.6, 8);
  const rail = new THREE.Mesh(railGeometry, new THREE.MeshBasicMaterial({ color: "#1a1a1a" }));
  rail.rotation.z = Math.PI / 2;
  rail.position.set(0, -1.1, 1.5);
  scene.add(rail);
  const beadGeometry = new THREE.SphereGeometry(.065, 16, 12);
  const bead = new THREE.Mesh(beadGeometry, new THREE.MeshBasicMaterial({ color: "#c1121f" }));
  bead.position.set(0, -1.1, 1.5);
  scene.add(bead);

  let lastMinute = "";
  let currentDate: Date | null = null;
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();

  const update = (date: Date) => {
    currentDate = date;
    const key = `${date.getHours()}:${date.getMinutes()}`;
    if (key !== lastMinute) {
      const blocks = projectionVolume(date.getHours(), date.getMinutes());
      volume.count = blocks.length;
      blocks.forEach((block, index) => {
        const bounds = blockBounds(block);
        position.set(bounds.x, bounds.y, bounds.z);
        scale.set(bounds.width, bounds.height, bounds.depth);
        volume.setMatrixAt(index, matrix.compose(position, rotation, scale));
      });
      volume.instanceMatrix.needsUpdate = true;
      volume.computeBoundingBox();
      volume.computeBoundingSphere();
      renderer.shadowMap.needsUpdate = true;
      canvas.dataset.volumeBlocks = String(blocks.length);
      canvas.dataset.shadowHour = String(date.getHours()).padStart(2, "0");
      canvas.dataset.shadowMinute = String(date.getMinutes()).padStart(2, "0");
      lastMinute = key;
    }
    bead.position.x = -1.3 + (date.getSeconds() + date.getMilliseconds() / 1000) / 60 * 2.6;
    renderer.render(scene, camera);
    canvas.dataset.projectionReady = "true";
    canvas.dataset.sceneTime = String(date.getTime());
  };

  const resize = () => {
    const width = canvas.clientWidth || 384;
    const height = canvas.clientHeight || 384;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.left = -3.8 * aspect;
    camera.right = 3.8 * aspect;
    camera.updateProjectionMatrix();
    if (currentDate) update(currentDate);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return {
    update,
    dispose() {
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      screenGeometry.dispose();
      paper.dispose();
      shadow.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      railGeometry.dispose();
      rail.material.dispose();
      beadGeometry.dispose();
      bead.material.dispose();
      scene.traverse(object => { if (object instanceof THREE.DirectionalLight) object.dispose(); });
      volume.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}