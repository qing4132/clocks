import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { INK, PAPER, RED } from "../ink-200/geometry";
import { mirrorTime } from "./mirror-geometry";
import { disposeScene, mountRelationScene } from "./spatial-scene";

export function createMirrorModel() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  const viewSize = 3.1;
  const camera = new THREE.OrthographicCamera(-viewSize, viewSize, viewSize, -viewSize, .1, 40);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x626966, 2.6));
  const light = new THREE.DirectionalLight(0xffffff, 2.1);
  light.position.set(-3, 5, 8);
  scene.add(light);

  const reflectionGeometry = new THREE.PlaneGeometry(5.1, Math.SQRT2 * 1.1);
  const mirror = new Reflector(reflectionGeometry, { color: 0x808080, textureWidth: 768, textureHeight: 768, clipBias: 0, multisample: 4 });
  mirror.name = "fold-mirror";
  mirror.rotation.x = -Math.PI / 4;
  mirror.position.set(0, .55, -.55);
  scene.add(mirror);

  const backing = new THREE.Mesh(new THREE.BoxGeometry(5.13, Math.SQRT2 * 1.1 + .03, .05), new THREE.MeshStandardMaterial({ color: "#a7b2ac", roughness: .35, metalness: .45 }));
  backing.rotation.copy(mirror.rotation);
  backing.position.copy(mirror.position).addScaledVector(new THREE.Vector3(0, Math.SQRT1_2, Math.SQRT1_2), -.028);
  scene.add(backing);
  const board = new THREE.Mesh(new THREE.BoxGeometry(5.13, 1.03, .07), new THREE.MeshBasicMaterial({ color: PAPER }));
  board.position.set(0, -.515, -.04);
  scene.add(board);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(5.35, .9, .08), new THREE.MeshBasicMaterial({ color: PAPER }));
  hood.name = "source-hood";
  hood.position.set(0, 1.62, .18);
  scene.add(hood);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(5.13, .045, .08), new THREE.MeshStandardMaterial({ color: "#a7b2ac", roughness: .4, metalness: .4 }));
  lip.name = "mirror-rim";
  lip.position.set(0, 1.125, -1.16);
  scene.add(lip);

  const rods = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 12), new THREE.MeshStandardMaterial({ color: INK, roughness: .55, metalness: .1 }), 28);
  rods.name = "physical-strokes";
  rods.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rods.count = 0;
  scene.add(rods);

  const pinGeometry = new THREE.SphereGeometry(.035, 12, 8);
  const red = new THREE.MeshBasicMaterial({ color: RED });
  for (const horizontal of [-2.48, 2.48]) {
    const hinge = new THREE.Mesh(pinGeometry, red);
    hinge.position.set(horizontal, 0, .035);
    scene.add(hinge);
  }
  const second = new THREE.Mesh(pinGeometry, red);
  second.position.set(0, -.91, .035);
  scene.add(second);
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  const center = new THREE.Vector3();
  const scale = new THREE.Vector3();
  let lastMinute = "";

  return {
    scene, camera, viewSize, rods, mirror, hood,
    setTime(date: Date) {
      const key = `${date.getHours()}:${date.getMinutes()}`;
      if (key !== lastMinute) {
        const strokes = mirrorTime(date);
        rods.count = strokes.length;
        strokes.forEach((stroke, index) => {
          direction.subVectors(stroke.end, stroke.start);
          const length = direction.length();
          rotation.setFromUnitVectors(up, direction.normalize());
          center.copy(stroke.start).add(stroke.end).multiplyScalar(.5);
          scale.set(.039, length, .039);
          rods.setMatrixAt(index, matrix.compose(center, rotation, scale));
        });
        rods.instanceMatrix.needsUpdate = true;
        rods.computeBoundingBox();
        rods.computeBoundingSphere();
        lastMinute = key;
      }
      second.position.x = -2.4 + (date.getSeconds() + date.getMilliseconds() / 1000) / 60 * 4.8;
    },
    dispose() {
      mirror.getRenderTarget().dispose();
      disposeScene(scene);
      rods.dispose();
    },
  };
}

export function createMirrorScene(canvas: HTMLCanvasElement) {
  return mountRelationScene(canvas, createMirrorModel());
}