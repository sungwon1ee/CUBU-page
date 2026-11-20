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
 * `host`의 크기에 맞춰 그리고, 포인터나 손가락이 닿은 곳을 눈으로 따라가며, 누르면 좋아한다.
 * 손이 닿지 않는 동안에는 둘이서 알아서 논다(마주 보기, 폴짝, 숨었다 나오기, 갸웃).
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
  let width = 1, height = 1, dotPx = 1;
  const layout = () => {
    width = host.clientWidth; height = host.clientHeight;
    renderer.setSize(width, height, false);
    const wide = width >= 900;
    const span = 19; // 두 친구가 나란히 차지하는 폭(도트)
    dotPx = wide ? Math.min((width * 0.56) / span, (height * 0.7) / 15) : Math.min((width * 1.02) / span, (height * 0.5) / 15);
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

  // 포인터. 손가락은 마우스처럼 떠다니지 않으므로, 닿는 순간(`pointerdown`)에도 그 자리를 본다
  const pointer = { x: 0, y: 0, at: -1e9, hold: 3500 };
  const point = (e: PointerEvent | MouseEvent) => {
    const r = host.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onMove = (e: PointerEvent) => {
    Object.assign(pointer, point(e), { at: performance.now(), hold: e.pointerType === "mouse" ? 3500 : 2400 });
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  host.addEventListener("pointerdown", onMove, { passive: true });

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
  // 머리가 화면에서 있는 자리(매 프레임 `aim`이 적어 둔다)
  const heads = rigs.map(() => ({ x: 0, y: 0 }));
  // 조금 뒤에 할 일(무대의 시계로 잰다: 화면이 가려져 있는 동안은 흐르지 않는다)
  const later: { at: number; run: () => void }[] = [];
  const after = (seconds: number, run: () => void) => later.push({ at: elapsed + seconds, run });

  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    const p = point(e);
    const near = heads.map((h, i) => ({ i, d: Math.hypot(h.x - p.x, h.y - p.y) })).sort((a, b) => a.d - b.d)[0];
    // 손가락은 굵다: 머리 둘레를 넉넉히 잡아 그 안이면 쓰다듬은 것으로 친다
    const touched = hit(p.x, p.y) ?? (near.d < dotPx * 8 ? rigs[near.i] : null);
    Object.assign(pointer, p, { at: performance.now(), hold: 2400 });
    if (!touched) {
      // 빈 곳을 눌러도 가까운 쪽이 알아채고 폴짝한다
      rigs[near.i].perk(1.6);
      return;
    }
    touched.pet(3);
    // 옆 친구가 쳐다보다가 나도 해 달라고 폴짝 뛴다
    const other = rigs.indexOf(touched) === 0 ? 1 : 0;
    gaze[other] = { until: elapsed + 2.2, yaw: side(other) * 0.6, roll: side(other) * -0.12 };
    after(0.55, () => rigs[other].perk(2.2));
  };
  host.addEventListener("click", onClick);

  // 혼자 하는 짓: 손이 닿지 않는 동안 몇 초마다 하나씩 한다(휴대폰에서는 거의 늘 이 상태다)
  interface Gaze { until: number; at?: { x: number; y: number }; yaw?: number; pitch?: number; roll?: number }
  const gaze: (Gaze | null)[] = [null, null];
  const ducked = [-1, -1]; // 숨기 시작한 시각
  const side = (i: number) => (i === 0 ? 1 : -1); // 옆 친구가 있는 쪽
  let nextAct = 2.2, lastAct = -1;
  const act = (forced?: number) => {
    let kind = forced ?? Math.floor(Math.random() * 5);
    if (forced === undefined && kind === lastAct) kind = (kind + 1) % 5;
    lastAct = kind;
    const who = Math.random() < 0.5 ? 0 : 1, other = 1 - who;
    let length = 1.6;
    if (kind === 0) {
      // 서로 마주 보다가 한쪽이 폴짝
      rigs.forEach((_, i) => (gaze[i] = { until: elapsed + 1.9, yaw: side(i) * 0.6, roll: side(i) * -0.1 }));
      after(0.7, () => rigs[who].perk(1.8));
      length = 1.9;
    } else if (kind === 1) {
      // 둘이 같이 받기 단추 쪽을 본다
      const badge = host.querySelector(".badge")?.getBoundingClientRect(), box = host.getBoundingClientRect();
      if (badge) {
        const at = { x: badge.left + badge.width / 2 - box.left, y: badge.top + badge.height / 2 - box.top };
        rigs.forEach((_, i) => (gaze[i] = { until: elapsed + 1.8 + i * 0.25, at }));
      }
      length = 2;
    } else if (kind === 2) {
      // 차례로 폴짝폴짝
      rigs[who].perk(2.2);
      after(0.3, () => rigs[other].perk(2.6));
      after(0.75, () => rigs[who].perk(1.6));
      length = 1.4;
    } else if (kind === 3) {
      // 한쪽이 쏙 숨었다 튀어나오고, 옆 친구는 어디 갔나 내려다본다
      ducked[who] = elapsed;
      gaze[other] = { until: elapsed + 1.5, yaw: side(other) * 0.6, pitch: 0.28, roll: side(other) * -0.14 };
      after(1.5, () => rigs[other].perk(1.4));
      length = 2.2;
    } else {
      // 둘 다 이쪽을 보며 고개를 갸웃
      rigs.forEach((_, i) => (gaze[i] = { until: elapsed + 1.5, yaw: 0, pitch: -0.14, roll: side(i) * 0.2 }));
      after(0.9, () => rigs[other].perk(1.2));
    }
    nextAct = elapsed + length + 1.2 + Math.random() * 1.8;
  };
  /** 숨었다 나오기: 쑥 내려가 잠깐 있다가 튀어나온다(유닛). */
  const duck = (since: number) => {
    if (since < 0 || since > 1.5) return 0;
    if (since < 0.26) return -0.66 * (since / 0.26) ** 2;
    if (since < 0.95) return -0.66;
    return -0.66 * (1 - easeOutBack(Math.min(1, (since - 0.95) / 0.5)));
  };

  const head = new THREE.Vector3();
  const aim = (rig: Rig, i: number, now: number, t: number) => {
    rig.neck.getWorldPosition(head);
    const toCamera = Math.atan2(camera.position.x - head.x, camera.position.z - head.z);
    let yaw = toCamera, pitch = -0.1, roll = 0;
    const s = head.clone().project(camera);
    const sx = (s.x * 0.5 + 0.5) * width, sy = (-s.y * 0.5 + 0.5) * height;
    heads[i].x = sx; heads[i].y = sy;
    // 화면의 한 점이 화면 앞 일정 거리에 떠 있다고 보고 그쪽을 본다
    const towards = (p: { x: number; y: number }) => {
      const depth = Math.max(width, height) * 0.55;
      yaw += Math.atan2(p.x - sx, depth) * 1.15;
      pitch += Math.atan2(p.y - (sy - height * 0.08), depth) * 0.6;
    };
    const mine = gaze[i];
    if (now - pointer.at < pointer.hold) {
      towards(pointer);
    } else if (mine && t < mine.until) {
      if (mine.at) towards(mine.at);
      else { yaw += mine.yaw ?? 0; pitch += mine.pitch ?? 0; roll = mine.roll ?? 0; }
    } else {
      // 볼 것이 없으면 두리번거리다 서로를 본다
      const other = side(i);
      const wave = Math.sin(t * 0.45 + (i === 0 ? 0 : 1.7));
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

    if (!still) {
      for (let n = later.length - 1; n >= 0; n--) if (elapsed >= later[n].at) later.splice(n, 1)[0].run();
      if (elapsed > nextAct && now - pointer.at > pointer.hold) act();
    }
    rigs.forEach((rig, i) => {
      // 처음에는 아래에서 쑥 올라온다
      // (실제 시각으로 잰다: 탭이 뒤에 있어 프레임이 드물어도 제자리에 와 있다)
      const k = still ? 1 : THREE.MathUtils.clamp(((now - born) / 1000 - 0.25 - i * 0.16) / 0.7, 0, 1);
      rig.root.position.y = (easeOutBack(k) - 1) * 0.95 + duck(ducked[i] < 0 ? -1 : elapsed - ducked[i]);
      if (!still) aim(rig, i, now, elapsed);
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
  // `__heroAct(n)`은 혼자 하는 짓 가운데 n번째를 바로 시킨다
  if (import.meta.env.DEV) Object.assign(window, { __heroStep: step, __heroAct: act });

  return () => {
    cancelAnimationFrame(raf);
    resize.disconnect();
    seen.disconnect();
    window.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerdown", onMove);
    host.removeEventListener("click", onClick);
    renderer.dispose();
  };
}
