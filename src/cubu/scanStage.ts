import * as THREE from "three";
import { DOT, Rig, scanned, type ScannedCreature } from "./rig";
import olli from "./creatures/olli.json";
import { addLights, makeRenderer, reducedMotion } from "./heroStage";

// 앱의 스캔 연출을 그대로 따른다(ScanView.BlockBuild → BirthStage.startWaiting → BirthStage.assemble):
// 사진 위에 칸이 생긴다 → 칸마다 톡 튀어 블록이 된다 → 윗줄부터 하나씩 격자를 떠나 맴돈다
// → 맴돌던 블록이 발부터 차례로 내려앉아 한 몸이 된다 → 깨어난다. 끝나면 잠시 뒤 처음부터 다시 한다.

const ORBITS = 150;
const T = {
  reveal: 0.35, revealSpan: 0.55, // 사진 위로 칸이 위에서 아래로 나타난다
  pop: 1.05, popWindow: 0.5, popOne: 0.24, // 아랫줄부터 블록으로 튀어 오른다
  depart: 1.75, departWindow: 1.4, flight: 0.62, // 윗줄부터 격자를 떠나 궤도에 오른다
  assemble: 3.7, assembleSpan: 2.4, land: 0.36, // 궤도에서 제자리로 내려앉는다
  wake: 0.35, greet: 0.6, live: 4.2, vanish: 0.3, rest: 0.6,
};

const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

interface Cell { gx: number; gy: number; color: THREE.Color }
interface Subject {
  cells: Cell[]; cols: number; rows: number;
  /** 사진 안에서 대상이 차지하는 자리(사진 폭·높이에 대한 비율). 없으면 사진 가운데에 놓는다 */
  box?: { u: number; v: number; w: number };
  /** 점점 굵어지는 모자이크(가는 것부터). 사진이 있을 때만 */
  mosaics: HTMLCanvasElement[];
}
const MOSAIC_STEPS = [6, 4, 3, 2]; // 블록 한 칸을 몇 칸으로 나눠 그리나

/** 배경을 지운 사진에서 칸을 만든다: 대상의 자리를 찾고, 블록 크기의 칸마다 그 자리의 색을 담는다. */
function photoSubject(cutout: HTMLImageElement, cols = 26): Subject {
  const W = cutout.naturalWidth, H = cutout.naturalHeight;
  const probe = document.createElement("canvas");
  probe.width = 96; probe.height = Math.round((96 * H) / W);
  const pc = probe.getContext("2d", { willReadFrequently: true })!;
  pc.drawImage(cutout, 0, 0, probe.width, probe.height);
  const alpha = pc.getImageData(0, 0, probe.width, probe.height).data;
  let x0 = probe.width, x1 = 0, y0 = probe.height, y1 = 0;
  for (let y = 0; y < probe.height; y++)
    for (let x = 0; x < probe.width; x++)
      if (alpha[(y * probe.width + x) * 4 + 3] > 60) { x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); y0 = Math.min(y0, y); y1 = Math.max(y1, y + 1); }
  const box = { u: x0 / probe.width, v: y0 / probe.height, w: (x1 - x0) / probe.width };
  const cell = (box.w * W) / cols;
  const rows = Math.max(1, Math.round((((y1 - y0) / probe.height) * H) / cell));
  const level = (k: number) => {
    const c = document.createElement("canvas");
    c.width = cols * k; c.height = rows * k;
    c.getContext("2d", { willReadFrequently: true })!.drawImage(cutout, box.u * W, box.v * H, cols * cell, rows * cell, 0, 0, c.width, c.height);
    return c;
  };
  const px = level(1).getContext("2d")!.getImageData(0, 0, cols, rows).data;
  const cells: Cell[] = [];
  for (let gy = 0; gy < rows; gy++)
    for (let gx = 0; gx < cols; gx++) {
      const i = (gy * cols + gx) * 4;
      if (px[i + 3] >= 128) cells.push({ gx, gy, color: new THREE.Color().setRGB(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255, THREE.SRGBColorSpace) });
    }
  return { cells, cols, rows, box, mosaics: MOSAIC_STEPS.map(level) };
}

/** 사진 속 대상의 칸: 카메라가 보는 방향에서 본 친구를 칸에 옮겨 담는다(실제 사진이 오면 그 사진의 색으로 바꾼다). */
function subjectCells(rig: Rig, elevation: number): Subject {
  const size = DOT * 0.62;
  const up = new THREE.Vector3(0, Math.cos(elevation), -Math.sin(elevation));
  const toward = new THREE.Vector3(0, Math.sin(elevation), Math.cos(elevation));
  const best = new Map<string, { gx: number; gy: number; depth: number; color: THREE.Color }>();
  for (const dot of rig.surfaceDots()) {
    const p = dot.position.clone().applyEuler(rig.root.rotation);
    const a = p.x, b = p.dot(up), depth = p.dot(toward);
    const reach = DOT * 0.5;
    for (let gx = Math.ceil((a - reach) / size - 0.5); gx <= Math.floor((a + reach) / size - 0.5); gx++) {
      for (let gy = Math.ceil((b - reach) / size - 0.5); gy <= Math.floor((b + reach) / size - 0.5); gy++) {
        const key = `${gx},${gy}`, old = best.get(key);
        if (!old || depth > old.depth) best.set(key, { gx, gy, depth, color: dot.color });
      }
    }
  }
  const all = [...best.values()];
  const minX = Math.min(...all.map((c) => c.gx)), maxY = Math.max(...all.map((c) => c.gy));
  const cells = all.map((c) => ({ gx: c.gx - minX, gy: maxY - c.gy, color: c.color }));
  return { cells, cols: Math.max(...cells.map((c) => c.gx)) + 1, rows: Math.max(...cells.map((c) => c.gy)) + 1, mosaics: [] };
}

/**
 * `host` 전체를 덮는 캔버스에 그린다. `photo`는 사진이 놓인 네모, `stand`는 친구가 설 자리,
 * `mosaic`은 사진 위에 겹쳐 모자이크를 그릴 캔버스다. 자리는 화면 배치에서 읽어 오므로 배치가 바뀌어도 따라간다.
 * `cutoutUrl`은 사진에서 배경을 지운 그림(`tools/cutout.swift`로 만든다).
 */
export function mountScan(
  canvas: HTMLCanvasElement, host: HTMLElement, photo: HTMLElement, stand: HTMLElement, mosaic: HTMLCanvasElement, cutoutUrl: string,
): () => void {
  let dispose = () => {};
  let gone = false;
  const cutout = new Image();
  // `decode()`는 화면이 가려져 있는 동안 끝나지 않을 수 있어 load를 기다린다
  cutout.onload = () => { if (!gone) dispose = run(canvas, host, photo, stand, mosaic, photoSubject(cutout)); };
  cutout.onerror = () => { if (!gone) dispose = run(canvas, host, photo, stand, mosaic, null); }; // 그림이 없으면 친구 모습으로 대신한다
  cutout.src = cutoutUrl;
  return () => { gone = true; dispose(); };
}

function run(
  canvas: HTMLCanvasElement, host: HTMLElement, photo: HTMLElement, stand: HTMLElement, mosaic: HTMLCanvasElement, fromPhoto: Subject | null,
): () => void {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  addLights(scene, 1.5);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 60);
  const elevation = 0.24;
  const target = new THREE.Vector3(0, 0.44, 0);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ color: 0x4a2f22, opacity: 0.24 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const rig = new Rig(scanned(olli as ScannedCreature));
  rig.root.rotation.y = -0.42;
  scene.add(rig.root);
  // 블록이 쌓이는 자세와 다 쌓인 뒤 나타나는 몸의 자세가 같아야 바뀌는 순간이 보이지 않는다
  const POSE = { yaw: 0.3, pitch: -0.06 };
  const stand0 = () => {
    rig.alive = false;
    rig.look.yaw = POSE.yaw;
    rig.look.pitch = POSE.pitch;
    rig.rest();
  };
  stand0();
  const unit = rig.grow.scale.x; // 이 친구의 도트 한 칸(어린 친구는 한 칸이 더 작다). 블록도 이 크기여야 몸과 딱 겹친다
  const fleck = unit * 0.72; // 날아다니는 동안의 크기. 한 칸 그대로면 덩어리가 커서 움직임이 둔해 보인다

  const rand = seeded(11);
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const lit = () => new THREE.MeshLambertMaterial();

  // 1. 사진 위의 칸
  const subject = fromPhoto ?? subjectCells(rig, elevation);
  const blocksAt = T.reveal + T.revealSpan; // 모자이크가 블록 크기에 이르는 때
  const grid = new THREE.InstancedMesh(cube, lit(), subject.cells.length);
  grid.frustumCulled = false;
  scene.add(grid);
  const order = subject.cells.map((_, i) => i).sort(() => rand() - 0.5);
  const slot = new Array<number>(subject.cells.length), keeps = new Array<boolean>(subject.cells.length).fill(false);
  order.forEach((cell, n) => { slot[cell] = n % ORBITS; keeps[cell] = n < ORBITS; });
  const cellPlan = subject.cells.map((c, i) => {
    grid.setColorAt(i, c.color);
    const row = (subject.rows - 1 - c.gy) / Math.max(1, subject.rows - 1); // 0 = 맨 아랫줄
    const leave = (1 - row) * 0.75 + (((c.gx * 5 + c.gy * 3) % 7) / 7) * 0.25;
    return {
      // 사진이 있으면 모자이크가 다 굵어진 뒤 한꺼번에, 없으면 위에서 아래로 차례로 나타난다
      revealAt: fromPhoto ? blocksAt : T.reveal + (1 - row) * T.revealSpan,
      popAt: T.pop + row * (T.popWindow - T.popOne - 0.08) + (((c.gx * 7 + c.gy * 13) % 10) / 10) * 0.08,
      departAt: T.depart + leave * T.departWindow,
      home: new THREE.Vector3(),
    };
  });
  const scanLine = new THREE.Mesh(cube, new THREE.MeshBasicMaterial({ color: 0xf49e4a }));
  scanLine.visible = false;
  scene.add(scanLine);

  // 2. 받침 자리를 맴도는 블록
  const orbits = Array.from({ length: ORBITS }, () => {
    const radius = 0.28 + rand() * 0.5;
    return {
      radius, height: 0.1 + rand() * 0.82, angle: rand() * Math.PI * 2, period: 2.0 + radius * 3.4 + (rand() - 0.5) * 0.6,
      bob: 0.03 + rand() * 0.06, bobTime: 0.7 + rand() * 0.6,
      spin: new THREE.Vector3(rand() * 6 - 3, 1 + rand() * 2, rand() * 4 - 2),
      arriveAt: Infinity,
    };
  });
  subject.cells.forEach((_, i) => { if (keeps[i]) orbits[slot[i]].arriveAt = cellPlan[i].departAt + T.flight; });
  let reach = 1; // 맴도는 자리의 크기(설 자리에 들어가도록 배치에서 정한다)
  const orbitAt = (o: (typeof orbits)[number], t: number, out: THREE.Vector3) => {
    const a = o.angle + (Math.PI * 2 * t) / o.period;
    return out.set(Math.cos(a) * o.radius, o.height + o.bob * Math.sin((t / o.bobTime) * Math.PI), Math.sin(a) * o.radius).multiplyScalar(reach);
  };
  const tumbleAt = (o: (typeof orbits)[number], t: number, out: THREE.Quaternion) =>
    out.setFromEuler(new THREE.Euler(o.spin.x * t * 0.5, o.spin.y * t * 0.5, o.spin.z * t * 0.5));
  const swirl = new THREE.InstancedMesh(cube, lit(), ORBITS);
  swirl.frustumCulled = false;
  swirl.castShadow = true;
  scene.add(swirl);
  subject.cells.forEach((c, i) => { if (keeps[i]) swirl.setColorAt(slot[i], c.color); });

  // 3. 제자리로 내려앉는 블록(겉면 도트 하나가 블록 하나). 발부터 위로
  const dots = rig.surfaceDots().sort((a, b) => a.position.y - b.position.y);
  const build = new THREE.InstancedMesh(cube, lit(), dots.length);
  build.frustumCulled = false;
  build.castShadow = true;
  const body = new THREE.Group(); // 친구와 같은 방향
  body.rotation.copy(rig.root.rotation);
  body.add(build);
  scene.add(body);
  const toBody = new THREE.Matrix4().makeRotationFromEuler(rig.root.rotation).invert();
  const partLanding = new Map<number, number>();
  let born = 0;
  const dotPlan = dots.map((d, k) => {
    build.setColorAt(k, d.color);
    const launchAt = T.assemble + 0.1 + (k / dots.length) * T.assembleSpan + rand() * 0.12;
    const lift = 0.12 + rand() * 0.18;
    const landed = launchAt + T.land;
    partLanding.set(d.part, Math.max(partLanding.get(d.part) ?? 0, landed));
    born = Math.max(born, landed);
    return { launchAt, lift, from: new THREE.Vector3(), control: new THREE.Vector3(), to: d.position, rest: d.turn, part: d.part, turn: new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 4 - 2, rand() * 4 - 2, 0)) };
  });
  born += 0.08;
  /** 내려앉는 길: 맴돌던 자리에서 떠올랐다가 제자리로. 맴도는 자리의 크기가 바뀌면 다시 잡는다 */
  const aim = () => dotPlan.forEach((d, k) => {
    orbitAt(orbits[k % ORBITS], d.launchAt, d.from).applyMatrix4(toBody);
    d.control.copy(d.from).add(d.to).multiplyScalar(0.5);
    d.control.y = Math.max(d.from.y, d.to.y) + d.lift * reach;
  });
  // 선 모습의 테두리(화면에서 사진과 같은 키로 맞추는 데 쓴다)
  const outline = dots.map((d) => d.position.clone().applyEuler(rig.root.rotation));
  const END = born + T.live + T.vanish + T.rest;

  // 배치: 사진 네모와 설 자리를 화면에서 읽어 카메라와 칸의 자리를 정한다
  let cellSize = DOT;
  const facing = new THREE.Quaternion();
  const layout = () => {
    // 캔버스는 무대보다 위로 조금 더 길다(뛰어오른 머리와 하트가 잘리지 않게)
    const box = canvas.getBoundingClientRect(), at = stand.getBoundingClientRect(), pic = photo.getBoundingClientRect();
    const w = box.width, h = box.height;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    // 친구의 키를 사진의 키에 맞추고, 발은 사진 아랫변과 같은 높이에 둔다(나란히 놓인 것처럼).
    // 좁은 화면에서는 사진 아래에 서므로 설 자리 안에 들어가는 만큼만 키운다.
    const stacked = at.top >= pic.bottom - 1;
    const tall = stacked ? Math.min(pic.height, at.height * 0.62) : pic.height;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    camera.aspect = w / h;
    const probe = new THREE.Vector3();
    const frame = (scale: number) => {
      const distance = h / scale / (2 * tan);
      camera.position.set(target.x, target.y + Math.sin(elevation) * distance, target.z + Math.cos(elevation) * distance);
      camera.lookAt(target);
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const o of outline) {
        probe.copy(o).project(camera);
        const x = ((probe.x + 1) / 2) * w, y = ((1 - probe.y) / 2) * h;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      const half = (unit * scale) / 2;
      return { left: x0 - half, right: x1 + half, top: y0 - half, bottom: y1 + half };
    };
    let pxPerUnit = tall / 0.8, span = frame(pxPerUnit);
    for (let i = 0; i < 3; i++) {
      pxPerUnit *= Math.min(tall / (span.bottom - span.top), (at.width * 0.9) / (span.right - span.left));
      span = frame(pxPerUnit);
    }
    const cx = at.left - box.left + at.width / 2;
    const feet = stacked ? at.bottom - box.top - at.height * 0.05 : pic.bottom - box.top;
    camera.setViewOffset(w, h, (span.left + span.right) / 2 - cx, span.bottom - feet, w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    facing.copy(camera.quaternion);
    // 맴도는 블록은 설 자리 폭과 발 위 공간 안에 들어오게 한다
    // 좁은 화면에서는 화면 폭 가득 퍼지지 않게 친구의 몸 둘레 안으로 모은다
    const around = stacked ? ((span.right - span.left) * 0.64) / (0.78 * pxPerUnit) : 1;
    reach = Math.max(0.3, Math.min(1, around, (at.width * 0.48) / (0.78 * pxPerUnit), (feet - 8) / (1.3 * pxPerUnit)));
    if (stacked) reach *= 1.3; // 좁은 화면에서는 조금 더 넓게 퍼지게
    aim();

    // 칸은 카메라를 마주 보는 평면 위에 놓는다(사진에 붙어 있는 것처럼 보이게)
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), target);
    const ray = new THREE.Raycaster();
    const at0 = subject.box;
    const px = at0 ? (at0.w * pic.width) / subject.cols : Math.min((pic.width * 0.84) / subject.cols, (pic.height * 0.84) / subject.rows);
    cellSize = px / pxPerUnit;
    const left = pic.left - box.left + (at0 ? at0.u * pic.width : (pic.width - px * subject.cols) / 2);
    const top = pic.top - box.top + (at0 ? at0.v * pic.height : (pic.height - px * subject.rows) / 2 + pic.height * 0.02);
    // 모자이크 캔버스는 사진과 같은 자리·크기다
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    mosaic.width = Math.round(pic.width * ratio); mosaic.height = Math.round(pic.height * ratio);
    mosaicBox = [(left - (pic.left - box.left)) * ratio, (top - (pic.top - box.top)) * ratio, px * subject.cols * ratio, px * subject.rows * ratio];
    mosaicShown = -2;
    const onPhoto = (x: number, y: number, out: THREE.Vector3) => {
      ray.setFromCamera(new THREE.Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1), camera);
      return ray.ray.intersectPlane(plane, out) ?? out.copy(target);
    };
    subject.cells.forEach((c, i) => onPhoto(left + (c.gx + 0.5) * px, top + (c.gy + 0.5) * px, cellPlan[i].home));
    lineFrom.copy(onPhoto(left + (px * subject.cols) / 2, top, new THREE.Vector3()));
    lineTo.copy(onPhoto(left + (px * subject.cols) / 2, top + px * subject.rows, new THREE.Vector3()));
    lineWidth = (px * (subject.cols + 2)) / pxPerUnit;
    draw();
  };
  const lineFrom = new THREE.Vector3(), lineTo = new THREE.Vector3();
  let lineWidth = 1;
  let mosaicBox = [0, 0, 0, 0], mosaicShown = -2;
  /** 사진이 제자리에서 점점 굵은 모자이크가 된다(블록 크기에 이르면 칸이 넘겨받는다). */
  const paintMosaic = (t: number) => {
    const step = t < T.reveal || t >= blocksAt ? -1 : Math.min(MOSAIC_STEPS.length - 1, Math.floor((t - T.reveal) / (T.revealSpan / MOSAIC_STEPS.length)));
    if (step === mosaicShown) return;
    mosaicShown = step;
    const ctx = mosaic.getContext("2d")!;
    ctx.clearRect(0, 0, mosaic.width, mosaic.height);
    if (step < 0 || !subject.mosaics[step]) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(subject.mosaics[step], mosaicBox[0], mosaicBox[1], mosaicBox[2], mosaicBox[3]);
  };

  const still = reducedMotion();
  let time = still ? born + 1 : 0;
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  const goal = new THREE.Vector3(), tumble = new THREE.Quaternion();
  const hide = m.clone().makeScale(0, 0, 0);
  let stage: "build" | "asleep" | "awake" | "greeted" = "build";

  const pose = () => {
    const t = time;
    // 사진 위의 칸
    subject.cells.forEach((_, i) => {
      const c = cellPlan[i];
      const fly = (t - c.departAt) / T.flight;
      if (t < c.revealAt || fly >= 1) return grid.setMatrixAt(i, hide);
      const pop = clamp01((t - c.popAt) / T.popOne);
      // 납작한 칸이 살짝 부풀었다가 틈을 두고 블록으로 자리 잡는다
      let size = cellSize * (fromPhoto ? 1 : clamp01((t - c.revealAt) / 0.1)) * (1 + 0.14 * Math.sin(pop * Math.PI) - 0.08 * pop);
      let depth = cellSize * (0.06 + 0.94 * pop);
      p.copy(c.home);
      q.copy(facing);
      if (fly > 0) {
        const o = orbits[slot[i]], e = smooth(fly);
        orbitAt(o, t, goal);
        p.lerp(goal, e);
        p.y += Math.sin(fly * Math.PI) * 0.22 * reach;
        q.slerp(tumbleAt(o, t, tumble), e);
        // 궤도에 먼저 오른 블록이 있으면 그 블록에 스며든다
        size = THREE.MathUtils.lerp(size, fleck, e) * (keeps[i] ? 1 : 1 - clamp01((fly - 0.6) / 0.4));
        depth = size;
      }
      grid.setMatrixAt(i, m.compose(p, q, s.set(size, size, depth)));
    });
    grid.instanceMatrix.needsUpdate = true;

    const sweep = (t - T.reveal) / T.revealSpan;
    scanLine.visible = sweep > 0 && sweep < 1;
    if (scanLine.visible) {
      scanLine.position.lerpVectors(lineFrom, lineTo, sweep);
      scanLine.quaternion.copy(facing);
      scanLine.scale.set(lineWidth, cellSize * 0.3, cellSize * 0.1);
    }

    // 맴도는 블록: 먹여 준 만큼 하나씩 줄어든다
    orbits.forEach((o, i) => {
      const leaveAt = T.assemble + 0.4 + (i / ORBITS) * 2.2;
      const size = t < o.arriveAt ? 0 : fleck * (1 - clamp01((t - leaveAt) / 0.3));
      if (size <= 0) return swirl.setMatrixAt(i, hide);
      swirl.setMatrixAt(i, m.compose(orbitAt(o, t, p), tumbleAt(o, t, q), s.setScalar(size)));
    });
    swirl.instanceMatrix.needsUpdate = true;

    // 내려앉는 블록: 부위의 마지막 블록이 닿으면 그 부위가 나타나고 블록은 물러난다
    for (const [part, landed] of partLanding) if (stage === "build" && t >= landed + 0.04) rig.showPart(part);
    dotPlan.forEach((d, k) => {
      const f = (t - d.launchAt) / T.land;
      if (f <= 0 || t >= (partLanding.get(d.part) ?? 0) + 0.04) return build.setMatrixAt(k, hide);
      const e = smooth(clamp01(f)), u = 1 - e;
      p.set(
        u * u * d.from.x + 2 * u * e * d.control.x + e * e * d.to.x,
        u * u * d.from.y + 2 * u * e * d.control.y + e * e * d.to.y,
        u * u * d.from.z + 2 * u * e * d.control.z + e * e * d.to.z,
      );
      // 작은 조각으로 날아와서, 닿기 직전에 한 칸 크기로 자라며 자리에 끼워진다
      const grow = f < 0.2 ? 0.02 + 0.7 * (f / 0.2) : 0.72 + 0.28 * smooth(clamp01((f - 0.7) / 0.3));
      build.setMatrixAt(k, m.compose(p, q.copy(d.turn).slerp(d.rest, e), s.setScalar(unit * grow)));
    });
    build.instanceMatrix.needsUpdate = true;
  };

  const restart = () => {
    time = 0;
    stage = "build";
    rig.setBuilt(false);
    stand0();
    rig.root.scale.setScalar(1);
  };
  const draw = () => {
    pose();
    paintMosaic(time);
    renderer.render(scene, camera);
  };

  if (!still) restart();
  layout();
  const resize = new ResizeObserver(layout);
  resize.observe(host);

  let visible = false;
  const seen = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 });
  seen.observe(host);

  const step = (dt: number) => {
    if (!still) {
      time += dt;
      // 다 내려앉으면 눈을 감은 채 나타났다가, 눈을 뜨고, 폴짝 뛴다
      if (stage === "build" && time >= born) { stage = "asleep"; rig.setBuilt(true); rig.closeEyes(); }
      if (stage === "asleep" && time >= born + T.wake) { stage = "awake"; rig.alive = true; }
      if (stage === "awake" && time >= born + T.greet) { stage = "greeted"; rig.pet(2.5, 0); }
      if (stage !== "build") {
        rig.look.yaw = POSE.yaw + 0.3 * Math.sin(Math.max(0, time - born - T.wake) * 0.9);
        const gone = clamp01((time - born - T.live) / T.vanish);
        rig.root.scale.setScalar(1 - gone * gone);
      }
      if (time >= END) restart();
      rig.update(dt);
    }
    draw();
  };
  const clock = new THREE.Clock();
  let raf = 0, held = false;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (visible && !document.hidden && !held) step(dt);
  };
  frame();
  // 개발용: 손으로 한 프레임씩 넘긴다(부르면 그때부터 저절로 흐르지 않는다). 지금 시각과 다 쌓이는 시각을 돌려준다
  if (import.meta.env.DEV) Object.assign(window, { __scanStep: (dt: number) => ((held = true), step(dt), { time, born }) });

  return () => {
    cancelAnimationFrame(raf);
    resize.disconnect();
    seen.disconnect();
    renderer.dispose();
  };
}
