import * as THREE from "three";
import { INK, PAPER, RED } from "../ink-200/geometry";
import { intersectTriangles, sectionRibbons } from "./section-geometry";
import { disposeScene, mountRelationScene } from "./spatial-scene";

export function createSectionModel() {
  const scene = new THREE.Scene();
  const viewSize = 3.1;
  const camera = new THREE.OrthographicCamera(-viewSize, viewSize, viewSize, -viewSize, .1, 40);
  camera.position.set(2.2, 1.4, 9);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x626966, 2.3));
  const light = new THREE.DirectionalLight(0xffffff, 2.5);
  light.position.set(-3, 5, 7);
  scene.add(light);

  const positions = new THREE.BufferAttribute(new Float32Array(28 * 8 * 9), 3).setUsage(THREE.DynamicDrawUsage);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", positions);
  geometry.setDrawRange(0, 0);
  const sheets = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#aab8b1", roughness: .66, metalness: .08, side: THREE.DoubleSide, transparent: true, opacity: .24, depthWrite: false, forceSinglePass: true }));
  sheets.name = "folded-sheets";
  sheets.renderOrder = 1;
  sheets.frustumCulled = false;
  scene.add(sheets);

  const edges = new THREE.BufferAttribute(new Float32Array(28 * 10 * 6), 3).setUsage(THREE.DynamicDrawUsage);
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute("position", edges);
  edgeGeometry.setDrawRange(0, 0);
  const edgeLines = new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: .24, depthWrite: false }));
  edgeLines.renderOrder = 2;
  edgeLines.frustumCulled = false;
  scene.add(edgeLines);

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(5.05, 1.95), new THREE.MeshBasicMaterial({ color: PAPER, side: THREE.DoubleSide, transparent: true, opacity: .68, depthWrite: false }));
  plane.name = "section-plane";
  plane.renderOrder = 3;
  scene.add(plane);
  const border = new THREE.LineSegments(new THREE.EdgesGeometry(plane.geometry), new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: .18, depthWrite: false }));
  border.renderOrder = 3;
  scene.add(border);

  const cutGeometry = new THREE.CylinderGeometry(1, 1, 1, 8);
  const cuts = new THREE.InstancedMesh(cutGeometry, new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 1, depthWrite: false }), 28);
  cuts.name = "computed-intersections";
  cuts.count = 0;
  cuts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  cuts.renderOrder = 4;
  cuts.frustumCulled = false;
  scene.add(cuts);
  const seconds = new THREE.Mesh(new THREE.SphereGeometry(.025, 12, 8), new THREE.MeshBasicMaterial({ color: RED }));
  seconds.position.set(0, -.975, .01);
  scene.add(seconds);

  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const scale = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const center = new THREE.Vector3();

  return {
    scene, camera, viewSize, sheets, cuts,
    setTime(date: Date) {
      const ribbons = sectionRibbons(date);
      let vertex = 0;
      let edge = 0;
      const intersections = [];
      for (const ribbon of ribbons) {
        for (const triangle of ribbon.triangles) {
          for (const point of triangle) positions.setXYZ(vertex++, point.x, point.y, point.z);
        }
        const addEdge = (first: THREE.Vector3, last: THREE.Vector3) => {
          edges.setXYZ(edge++, first.x, first.y, first.z);
          edges.setXYZ(edge++, last.x, last.y, last.z);
        };
        for (let index = 0; index < ribbon.sections.length - 1; index++) {
          addEdge(ribbon.sections[index][0], ribbon.sections[index + 1][0]);
          addEdge(ribbon.sections[index][1], ribbon.sections[index + 1][1]);
        }
        addEdge(ribbon.sections[0][0], ribbon.sections[0][1]);
        const end = ribbon.sections.at(-1)!;
        addEdge(end[0], end[1]);
        intersections.push(...intersectTriangles(ribbon.triangles));
      }
      positions.needsUpdate = true;
      geometry.setDrawRange(0, vertex);
      geometry.computeVertexNormals();
      edges.needsUpdate = true;
      edgeGeometry.setDrawRange(0, edge);
      cuts.count = intersections.length;
      intersections.forEach((segment, index) => {
        direction.subVectors(segment.end, segment.start);
        const length = direction.length();
        rotation.setFromUnitVectors(up, direction.normalize());
        center.copy(segment.start).add(segment.end).multiplyScalar(.5);
        scale.set(.026, length, .026);
        cuts.setMatrixAt(index, matrix.compose(center, rotation, scale));
      });
      cuts.instanceMatrix.needsUpdate = true;
      seconds.position.x = -2.525 + (date.getSeconds() + date.getMilliseconds() / 1000) / 60 * 5.05;
    },
    dispose() {
      disposeScene(scene);
      cuts.dispose();
    },
  };
}

export function createSectionScene(canvas: HTMLCanvasElement) {
  return mountRelationScene(canvas, createSectionModel());
}