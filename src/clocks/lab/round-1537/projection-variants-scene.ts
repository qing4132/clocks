import * as THREE from "three";
import { INK, RED } from "../ink-200/geometry";
import { TRIPLE_GRID, tripleBlockBounds, tripleProjectionVolume } from "./triple-projection";
import { projectionScreens, projectionStyles, type ProjectionVariant } from "./projection-variants";

export function createProjectionVariantModel(variant: ProjectionVariant) {
  const style = projectionStyles[variant];
  const scene = new THREE.Scene();
  const target = new THREE.Vector3(...style.target);
  const fieldOfView = style.fieldOfView ?? 24;
  const camera = style.perspective
    ? new THREE.PerspectiveCamera(fieldOfView, 1, .1, 60)
    : new THREE.OrthographicCamera(-style.viewSize, style.viewSize, style.viewSize, -style.viewSize, .1, 60);
  camera.position.set(...style.camera);
  if (style.perspective) {
    camera.position.sub(target).normalize().multiplyScalar(style.viewSize / Math.tan(THREE.MathUtils.degToRad(fieldOfView / 2))).add(target);
  }
  camera.lookAt(target);
  camera.updateMatrixWorld();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x626965, style.ambient));

  const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
  const blockMaterial = new THREE.MeshStandardMaterial({ color: style.core, roughness: style.roughness, metalness: style.metalness });
  const volume = new THREE.InstancedMesh(blockGeometry, blockMaterial, TRIPLE_GRID ** 3);
  volume.name = "time-volume";
  volume.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  volume.count = 0;
  volume.castShadow = true;
  volume.receiveShadow = true;
  scene.add(volume);

  const paper = new THREE.MeshStandardMaterial({ color: style.paper, roughness: .94, metalness: 0, side: THREE.DoubleSide });
  const backing = new THREE.MeshStandardMaterial({ color: style.side, roughness: .7, metalness: .05 });
  const blackShadow = new THREE.ShadowMaterial({ color: INK, opacity: 1 });
  const redShadow = new THREE.ShadowMaterial({ color: RED, opacity: 1 });
  const surfaces: THREE.Group[] = [];
  for (const description of projectionScreens(variant)) {
    const screen = new THREE.Group();
    screen.name = `${description.unit}-projection`;
    screen.position.set(...description.position);
    screen.rotation.set(...description.rotation);
    const thickness = style.plinth && description.unit === "second" ? .48 : style.thickness;
    const support = new THREE.Mesh(new THREE.BoxGeometry(description.width, description.height, thickness), backing);
    support.position.set(description.offsetX, description.offsetY, -thickness / 2);
    screen.add(support);
    const planeGeometry = new THREE.PlaneGeometry(description.width, description.height);
    const surface = new THREE.Mesh(planeGeometry, paper);
    surface.position.set(description.offsetX, description.offsetY, .001);
    screen.add(surface);
    const shadow = new THREE.Mesh(planeGeometry, description.unit === "second" ? redShadow : blackShadow);
    shadow.name = `${description.unit}-shadow`;
    shadow.position.set(description.offsetX, description.offsetY, .003);
    shadow.receiveShadow = true;
    screen.add(shadow);
    surfaces.push(screen);
    scene.add(screen);
  }

  const directions = [new THREE.Vector3(10, 0, 0), new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 10, 0)];
  const lights = directions.map((direction, index) => {
    const light = new THREE.DirectionalLight(0xffffff, style.lights[index]);
    light.position.copy(direction);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    Object.assign(light.shadow.camera, { near: .5, far: 20, left: -1.38, right: 1.38, top: 1.38, bottom: -1.38 });
    if (direction.y > 0) light.shadow.camera.up.set(0, 0, -1);
    light.shadow.bias = -.00002;
    light.shadow.normalBias = .002;
    scene.add(light);
    return light;
  });
  scene.updateMatrixWorld(true);

  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  let lastReading = "";

  return {
    scene, camera, volume, surfaces, lights,
    setTime(date: Date) {
      const reading = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      if (reading === lastReading) return false;
      const blocks = tripleProjectionVolume(date.getHours(), date.getMinutes(), date.getSeconds());
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
      lastReading = reading;
      return true;
    },
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        }
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      for (const light of lights) light.dispose();
      volume.dispose();
    },
  };
}

export function createProjectionVariantScene(canvas: HTMLCanvasElement, variant: ProjectionVariant) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const model = createProjectionVariantModel(variant);
  const style = projectionStyles[variant];
  let currentDate: Date | null = null;

  const update = (date: Date, force = false) => {
    currentDate = date;
    const changed = model.setTime(date);
    if (!changed && !force) return;
    if (changed) renderer.shadowMap.needsUpdate = true;
    renderer.render(model.scene, model.camera);
    canvas.dataset.projectionVariantReady = "true";
    canvas.dataset.volumeBlocks = String(model.volume.count);
    canvas.dataset.sceneTime = String(date.getTime());
    canvas.dataset.shadowHour = String(date.getHours()).padStart(2, "0");
    canvas.dataset.shadowMinute = String(date.getMinutes()).padStart(2, "0");
    canvas.dataset.shadowSecond = String(date.getSeconds()).padStart(2, "0");
  };

  const resize = () => {
    const width = canvas.clientWidth || 384;
    const height = canvas.clientHeight || 384;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    if (model.camera instanceof THREE.PerspectiveCamera) model.camera.aspect = aspect;
    else {
      model.camera.left = -style.viewSize * aspect;
      model.camera.right = style.viewSize * aspect;
    }
    model.camera.updateProjectionMatrix();
    if (currentDate) update(currentDate, true);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return {
    update,
    dispose() {
      observer.disconnect();
      model.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}