import * as THREE from "three";

export type RelationModel = {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  viewSize: number;
  setTime: (date: Date) => void;
  dispose: () => void;
};

export function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  scene.traverse(object => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

export function mountRelationScene(canvas: HTMLCanvasElement, model: RelationModel) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  let latestDate: Date | null = null;
  const update = (date: Date) => {
    latestDate = date;
    model.setTime(date);
    renderer.render(model.scene, model.camera);
    canvas.dataset.relationReady = "true";
    canvas.dataset.sceneTime = String(date.getTime());
    canvas.dataset.reading = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };
  const resize = () => {
    const width = canvas.clientWidth || 384;
    const height = canvas.clientHeight || 384;
    renderer.setSize(width, height, false);
    model.camera.left = -model.viewSize * width / height;
    model.camera.right = model.viewSize * width / height;
    model.camera.updateProjectionMatrix();
    if (latestDate) update(latestDate);
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