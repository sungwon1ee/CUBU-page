import * as THREE from "three";
import { DOT, Rig, kong, nabi } from "./rig";

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function makeRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

/** 해질녘 방 안: 따뜻한 주변광 + 왼쪽 위 창에서 드는 빛. */
export function addLights(scene: THREE.Scene, shadowSpan = 1.6): THREE.DirectionalLight {
  scene.add(new THREE.AmbientLight(0xffe6c8, 1.9));
  const key = new THREE.DirectionalLight(0xfff2de, 2.3);
  key.position.set(-2.2, 4.2, 3.6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const cam = key.shadow.camera;
  cam.left = -shadowSpan; cam.right = shadowSpan; cam.top = shadowSpan; cam.bottom = -shadowSpan;
  cam.near = 0.5; cam.far = 12;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.012;
  key.shadow.radius = 5;
  scene.add(key);
  return key;
}

const easeOutBack = (k: number) => 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2);

/**
 * 첫 화면: 콩이와 나비가 화면 아래에서 고개를 내민다.
 * `host`의 크기에 맞춰 그리고, 포인터를 눈으로 따라가며, 누르면 좋아한다.
 */
export function mountHero(canvas: HTMLCanvasElement, host: HTMLElement): () => void {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  addLights(scene);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);

  const dog = new Rig(kong()), cat = new Rig(nabi());
  dog.root.position.set(-0.3, 0, 0.1);
  dog.root.rotation.y = 0.2;
  cat.root.position.set(0.31, 0, -0.1);
  cat.root.rotation.y = -0.24;
  const rigs = [dog, cat];
  rigs.forEach((r) => scene.add(r.root));

  const still = reducedMotion();
  if (still) rigs.forEach((r) => { r.alive = false; r.rest(); });

  // 화면에서 한 도트가 차지할 픽셀 수와 친구들이 설 자리를 창 크기에서 정한다
  const target = new THREE.Vector3(0.02, 0.2, 0.2);
  let width = 1, height = 1;
  const layout = () => {
    width = host.clientWidth; height = host.clientHeight;
    renderer.setSize(width, height, false);
    const wide = width >= 900;
    const span = 19; // 두 친구가 나란히 차지하는 폭(도트)
    const dotPx = wide ? Math.min((width * 0.56) / span, (height * 0.7) / 15) : Math.min((width * 1.02) / span, (height * 0.5) / 15);
    const worldHeight = height / (dotPx / DOT);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = worldHeight / (2 * Math.tan(fov / 2));
    const pitch = 0.2;
    camera.position.set(target.x, target.y + Math.sin(pitch) * distance, target.z + Math.cos(pitch) * distance);
    camera.lookAt(target);
    camera.aspect = width / height;
    // 바라보는 점(가슴 높이)을 화면 아래 가장자리에 두어 상반신만 보이게 한다
    const ax = wide ? 0.685 : 0.5, ay = 0.99;
    camera.setViewOffset(width, height, width / 2 - ax * width, height / 2 - ay * height, width, height);
    camera.updateProjectionMatrix();
    // 크기를 바꾸면 그림이 지워지므로 바로 한 번 그린다
    renderer.render(scene, camera);
  };
  layout();
  const resize = new ResizeObserver(layout);
  resize.observe(host);

  // 포인터
  const pointer = { x: 0, y: 0, at: -1e9 };
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.at = performance.now();
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const ray = new THREE.Raycaster();
  const hit = (x: number, y: number): Rig | null => {
    ray.setFromCamera(new THREE.Vector2((x / width) * 2 - 1, -(y / height) * 2 + 1), camera);
    let best: Rig | null = null, bestD = Infinity;
    for (const r of rigs) {
      const h = ray.intersectObject(r.root, true)[0];
      if (h && h.distance < bestD) { best = r; bestD = h.distance; }
    }
    return best;
  };
  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    const r = host.getBoundingClientRect();
    hit(e.clientX - r.left, e.clientY - r.top)?.pet(3);
  };
  host.addEventListener("click", onClick);

  const head = new THREE.Vector3();
  const aim = (rig: Rig, now: number, t: number) => {
    rig.neck.getWorldPosition(head);
    const toCamera = Math.atan2(camera.position.x - head.x, camera.position.z - head.z);
    let yaw = toCamera, pitch = -0.1, roll = 0;
    const s = head.clone().project(camera);
    const sx = (s.x * 0.5 + 0.5) * width, sy = (-s.y * 0.5 + 0.5) * height;
    if (now - pointer.at < 3500) {
      // 포인터가 화면 앞 일정 거리에 떠 있다고 보고 그쪽을 본다
      const depth = Math.max(width, height) * 0.55;
      yaw += Math.atan2(pointer.x - sx, depth) * 1.15;
      pitch += Math.atan2(pointer.y - (sy - height * 0.08), depth) * 0.6;
    } else {
      // 볼 것이 없으면 두리번거리다 서로를 본다
      const other = rig === dog ? 1 : -1;
      const wave = Math.sin(t * 0.45 + (rig === dog ? 0 : 1.7));
      yaw += wave > 0.55 ? other * 0.55 : wave * 0.3;
      pitch += 0.06 * Math.sin(t * 0.8 + other);
      roll = wave > 0.55 ? other * -0.1 : 0;
    }
    rig.look.yaw = yaw - rig.root.rotation.y;
    rig.look.pitch = pitch;
    rig.look.roll = roll;
  };

  let visible = true;
  const seen = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  seen.observe(host);

  const clock = new THREE.Clock();
  const born = performance.now();
  let raf = 0, elapsed = 0, hoverAt = 0;
  const step = (dt: number) => {
    elapsed += dt;
    const now = performance.now();

    rigs.forEach((rig, i) => {
      // 처음에는 아래에서 쑥 올라온다
      // (실제 시각으로 잰다: 탭이 뒤에 있어 프레임이 드물어도 제자리에 와 있다)
      const k = still ? 1 : THREE.MathUtils.clamp(((now - born) / 1000 - 0.25 - i * 0.16) / 0.7, 0, 1);
      rig.root.position.y = (easeOutBack(k) - 1) * 0.95;
      if (!still) aim(rig, now, elapsed);
      rig.update(dt);
    });

    // 친구 위에 포인터가 있으면 손 모양으로
    if (now - hoverAt > 120 && now - pointer.at < 200) {
      hoverAt = now;
      host.style.cursor = hit(pointer.x, pointer.y) ? "pointer" : "";
    }
    renderer.render(scene, camera);
  };
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (visible && !document.hidden) step(dt);
  };
  frame();
  // 개발 중에는 프레임을 손으로 넘겨 볼 수 있게 한다(뒤에 있는 탭에서는 프레임이 돌지 않는다)
  if (import.meta.env.DEV) Object.assign(window, { __heroStep: step });

  return () => {
    cancelAnimationFrame(raf);
    resize.disconnect();
    seen.disconnect();
    window.removeEventListener("pointermove", onMove);
    host.removeEventListener("click", onClick);
    renderer.dispose();
  };
}
