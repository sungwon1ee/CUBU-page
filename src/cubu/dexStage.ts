import * as THREE from "three";
import { DOT, Rig, type CreatureSpec } from "./rig";
import { voxelGeometry, type VoxelList } from "./objectStage";
import { reducedMotion } from "./heroStage";

export type DexModel = { rig: CreatureSpec } | { voxels: VoxelList };

/**
 * 도감 카드마다 천천히 도는 블록을 그린다.
 * WebGL 화면은 하나만 두고, 카드 하나씩 그려서 그 카드의 2D 캔버스로 옮긴다(카드 수만큼 WebGL을 띄우지 않는다).
 */
export function mountDex(host: HTMLElement, cards: HTMLCanvasElement[], models: DexModel[]): () => void {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffe6c8, 1.9));
  const key = new THREE.DirectionalLight(0xfff2de, 2.3);
  key.position.set(-2.2, 4.2, 3.6);
  scene.add(key);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });

  const entries = models.map((model) => {
    const spin = new THREE.Group();
    let rig: Rig | null = null;
    if ("rig" in model) {
      rig = new Rig(model.rig);
      spin.add(rig.root);
    } else {
      const xs = model.voxels.map((v) => v[0]), zs = model.voxels.map((v) => v[2]);
      const mesh = new THREE.Mesh(voxelGeometry(model.voxels), material);
      mesh.position.set(-(Math.min(...xs) + Math.max(...xs) + 1) / 2, 0, -(Math.min(...zs) + Math.max(...zs) + 1) / 2);
      const scaled = new THREE.Group();
      scaled.scale.setScalar(DOT);
      scaled.add(mesh);
      spin.add(scaled);
    }
    spin.visible = false;
    scene.add(spin);
    // 어느 쪽으로 돌아도 카드 안에 들어오는 거리
    const box = new THREE.Box3().setFromObject(spin), size = box.getSize(new THREE.Vector3());
    const across = Math.hypot(size.x, size.z);
    return { spin, rig, height: size.y, across };
  });
  entries.forEach((e, i) => (e.spin.rotation.y = -0.5 + i * 0.4));

  let width = 0, height = 0;
  const layout = () => {
    const r = cards[0].getBoundingClientRect();
    width = Math.round(r.width * ratio); height = Math.round(r.height * ratio);
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    for (const c of cards) { c.width = width; c.height = height; }
    draw();
  };

  const draw = () => {
    if (!width) return;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    entries.forEach((e, i) => {
      e.spin.visible = true;
      const need = Math.max(e.height * 1.25, (e.across * 1.12) / camera.aspect);
      const distance = need / (2 * tan);
      const target = new THREE.Vector3(0, e.height * 0.48, 0);
      camera.position.set(0, target.y + distance * 0.22, distance);
      camera.lookAt(target);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      const ctx = cards[i].getContext("2d")!;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(renderer.domElement, 0, 0);
      e.spin.visible = false;
    });
  };

  layout();
  const resize = new ResizeObserver(layout);
  resize.observe(cards[0]);

  let visible = false;
  const seen = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  seen.observe(host);

  const still = reducedMotion();
  const clock = new THREE.Clock();
  let raf = 0, due = 0;
  const step = (dt: number) => {
    if (!still) for (const e of entries) { e.spin.rotation.y += dt * 0.5; e.rig?.update(dt); }
    draw();
  };
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = clock.getDelta();
    // 카드 여러 장을 차례로 그리므로 초당 30번이면 넉넉하다
    due += dt;
    if (due < 1 / 30) return;
    if (visible && !document.hidden && !still) step(Math.min(due, 0.05));
    due = 0;
  };
  frame();
  if (import.meta.env.DEV) Object.assign(window, { __dexStep: step });

  return () => {
    cancelAnimationFrame(raf);
    resize.disconnect();
    seen.disconnect();
    renderer.dispose();
  };
}
