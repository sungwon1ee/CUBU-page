import * as THREE from "three";
import {
  A, B, G, R, FacePainter, PixelImage, hex, isClear, makeSkin, mixed, shade, sprite, uniformFaces,
  type BoxFaces, type RGBA, type Skin,
} from "./pixel";

// 앱의 CreatureRig.buildQuadruped를 옮긴 것. 길이 단위는 도트(1도트 = 1/16 유닛)이고 `grow`가 유닛으로 줄인다.
export const DOT = 1 / 16;

export interface BodyPlan {
  bodyW: number; bodyH: number; bodyL: number;
  headW: number; headH: number; headL: number;
  snoutL: number; legW: number; legH: number; tailL: number;
  ear: "pointy" | "floppy" | "round" | "none";
  earL?: number;
}

export interface CreatureSpec {
  kind: "dog" | "cat";
  plan: BodyPlan;
  skin: Skin;
  seed: number | bigint;
  /** 나이에 따른 전체 크기(다 큰 친구 = 1) */
  scale?: number;
}

/** 앱이 사진에서 만든 동물(도감에 저장된 그대로)을 옮겨 담은 것. `creatures/*.json` */
export interface ScannedCreature {
  kind: string; stage: string; seed: string; plan: BodyPlan & Record<string, unknown>;
  skin: {
    palette: RGBA[]; bodyTile: RGBA[]; headTile: RGBA[]; legTile: RGBA[];
    eye: RGBA; nose: RGBA; blush: RGBA; accent: RGBA;
    ear: RGBA | null; tail: RGBA | null; tailTip: RGBA | null; muzzle: RGBA | null;
    appearance: { coat: string | null; tail: string | null; colors: Record<string, RGBA> };
  };
}

export function scanned(c: ScannedCreature): CreatureSpec {
  const tile = (px: RGBA[]) => { const t = new PixelImage(16, 16); t.px.set(px); return t; };
  const k = c.skin;
  return {
    kind: c.kind === "cat" ? "cat" : "dog",
    seed: BigInt(c.seed),
    scale: c.stage === "young" ? 0.86 : c.stage === "baby" ? 0.78 : 1,
    plan: c.plan,
    skin: {
      palette: k.palette, bodyTile: tile(k.bodyTile), headTile: tile(k.headTile), legTile: tile(k.legTile),
      eye: k.eye, nose: k.nose, blush: k.blush, accent: k.accent,
      ear: k.ear ?? undefined, tail: k.tail ?? undefined, tailTip: k.tailTip ?? undefined, muzzle: k.muzzle ?? undefined,
      appearance: k.appearance,
    },
  };
}

/** 콩이: 앱에 처음부터 살고 있는 시바. */
export function kong(): CreatureSpec {
  const shiba = [0x5a2e17, 0x9c4f22, 0xd9823f, 0xebb57a, 0xf7e6cc].map(hex);
  const skin = makeSkin("twoTone", shiba, 11);
  skin.accent = hex(0x4e7fb0);
  return {
    kind: "dog", seed: 11, skin,
    plan: { bodyW: 6, bodyH: 5, bodyL: 9, headW: 7, headH: 6, headL: 6, snoutL: 2, legW: 2, legH: 3, tailL: 4, ear: "pointy" },
  };
}

/** 나비: 턱시도 고양이. */
export function nabi(): CreatureSpec {
  const tux = [0x231a18, 0x3a2c27, 0x6b5a50, 0xd8cbb8, 0xf5eee2].map(hex);
  const skin = makeSkin("tuxedo", tux, 22);
  skin.eye = hex(0x6e8a3a);
  skin.nose = hex(0xd98a8a);
  skin.accent = hex(0xd9653b);
  return {
    kind: "cat", seed: 22, skin,
    plan: { bodyW: 5, bodyH: 5, bodyL: 9, headW: 6, headH: 5, headL: 5, snoutL: 0, legW: 2, legH: 3, tailL: 8, ear: "pointy" },
  };
}

export function toColor(c: RGBA): THREE.Color {
  return new THREE.Color().setRGB(R(c) / 255, G(c) / 255, B(c) / 255, THREE.SRGBColorSpace);
}

const litMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });

type FaceKey = keyof BoxFaces;
/** 면마다: 왼쪽 위 꼭짓점, 오른쪽(u)·아래(v) 방향, 바깥 방향. 모두 상자 크기에 곱하는 비율이다. */
const FACE_FRAMES: Record<FaceKey, { o: number[]; u: number[]; v: number[]; n: number[] }> = {
  front: { o: [-0.5, 0.5, 0.5], u: [1, 0, 0], v: [0, -1, 0], n: [0, 0, 1] },
  right: { o: [0.5, 0.5, 0.5], u: [0, 0, -1], v: [0, -1, 0], n: [1, 0, 0] },
  back: { o: [0.5, 0.5, -0.5], u: [-1, 0, 0], v: [0, -1, 0], n: [0, 0, -1] },
  left: { o: [-0.5, 0.5, -0.5], u: [0, 0, 1], v: [0, -1, 0], n: [-1, 0, 0] },
  top: { o: [-0.5, 0.5, -0.5], u: [1, 0, 0], v: [0, 0, 1], n: [0, 1, 0] },
  bottom: { o: [-0.5, -0.5, 0.5], u: [1, 0, 0], v: [0, 0, -1], n: [0, -1, 0] },
};
const FACE_ORDER: FaceKey[] = ["front", "top", "right", "left", "back", "bottom"];

/** 도트 하나를 사각형 하나로 만든다. 텍스처가 없으니 아무리 크게 그려도 경계가 번지지 않는다. */
function boxGeometry(w: number, h: number, l: number, faces: BoxFaces): THREE.BufferGeometry {
  const size = [w, h, l];
  const pos: number[] = [], nor: number[] = [], col: number[] = [];
  const color = new THREE.Color();
  for (const key of FACE_ORDER) {
    const img = faces[key], f = FACE_FRAMES[key];
    const at = (u: number, v: number) => [0, 1, 2].map((k) => (f.o[k] + f.u[k] * u + f.v[k] * v) * size[k]);
    for (let j = 0; j < img.h; j++) {
      for (let i = 0; i < img.w; i++) {
        const c = img.get(i, j);
        if (isClear(c)) continue;
        const u0 = i / img.w, u1 = (i + 1) / img.w, v0 = j / img.h, v1 = (j + 1) / img.h;
        const tl = at(u0, v0), bl = at(u0, v1), br = at(u1, v1), tr = at(u1, v0);
        color.copy(toColor(c));
        for (const p of [tl, bl, br, tl, br, tr]) {
          pos.push(p[0], p[1], p[2]);
          nor.push(f.n[0], f.n[1], f.n[2]);
          col.push(color.r, color.g, color.b);
        }
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
}

function flatBox(w: number, h: number, l: number, c: RGBA): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, l), new THREE.MeshBasicMaterial({ color: toColor(c) }));
}

interface Part { mesh: THREE.Mesh; w: number; h: number; l: number; faces: BoxFaces }
export interface Dot {
  position: THREE.Vector3; color: THREE.Color;
  /** 이 도트가 속한 부위(`showPart`의 번호) */ part: number;
  /** 그 부위가 돌아가 있는 방향(root 기준). 블록을 이만큼 돌려 놓아야 부위의 면과 딱 겹친다 */ turn: THREE.Quaternion;
}

const HEART = sprite([".rr.rr.", "rprrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."],
  { r: hex(0xe5675f), p: hex(0xf4a3a0) });

function spriteTexture(img: PixelImage): THREE.DataTexture {
  const data = new Uint8Array(img.w * img.h * 4);
  for (let y = 0; y < img.h; y++)
    for (let x = 0; x < img.w; x++) {
      const c = img.get(x, img.h - 1 - y), k = (y * img.w + x) * 4;
      data[k] = R(c); data[k + 1] = G(c); data[k + 2] = B(c); data[k + 3] = A(c);
    }
  const t = new THREE.DataTexture(data, img.w, img.h, THREE.RGBAFormat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}
let heartTexture: THREE.DataTexture | null = null;

const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export class Rig {
  readonly spec: CreatureSpec;
  readonly root = new THREE.Group(); // 위치·방향
  readonly grow = new THREE.Group(); // 도트 → 유닛
  readonly hop = new THREE.Group(); // 점프 높이
  readonly torso = new THREE.Group();
  readonly breath = new THREE.Group();
  readonly neck = new THREE.Group();
  readonly eyes: THREE.Group[] = [];
  readonly ears: THREE.Group[] = [];
  readonly legs: THREE.Group[] = [];
  private tail?: THREE.Group;
  private tailTip?: THREE.Group;
  private tailRest = 0.85;
  private parts: Part[] = [];
  /** 머리 꼭대기 높이(도트) */
  readonly top: number;

  // 움직임
  /** 목이 향할 방향(몸 기준 라디안). 무대가 포인터를 보고 정한다 */
  look = { yaw: 0, pitch: 0, roll: 0 };
  /** 살아 있는 움직임(숨·깜빡임·꼬리). 꺼 두면 가만히 선 자세만 그린다 */
  alive = true;
  private time = 0;
  private breathing = 0; // 숨을 쉬기 시작한 뒤로 흐른 시간(깨어나는 순간 몸이 튀지 않게 0에서 시작한다)
  private blinkAt = 1.5;
  private blink = -1;
  private wagLeft = 0;
  private wagAt = 4;
  private twitchAt = 6;
  private twitch = -1;
  private hopTime = -1;
  private hopHeight = 5;
  private hearts: { node: THREE.Sprite; age: number }[] = [];

  constructor(spec: CreatureSpec) {
    this.spec = spec;
    const p = spec.plan, s = spec.skin, cat = spec.kind === "cat";
    const { legH: lh, bodyH: bh, bodyL: bl, legW: lw, headW: hw, headH: hh, headL: hl } = p;
    this.top = lh + bh - 1 + hh;

    this.root.add(this.grow);
    this.grow.scale.setScalar(DOT * (spec.scale ?? 1));
    const look = s.appearance;
    const seed = (n = 0) => BigInt(spec.seed) + BigInt(n);
    this.grow.add(this.hop);
    this.hop.add(this.torso);
    this.torso.position.set(0, lh, -bl / 2 + lw / 2);

    // 몸통
    this.torso.add(this.breath);
    this.breath.position.set(0, 0, bl / 2 - lw / 2);
    this.add(this.breath, [0, bh / 2, 0], p.bodyW, bh, bl, FacePainter.body(s.bodyTile, p.bodyW, bh, bl));

    // 사진에서 만든 친구는 목줄이 사진에 보일 때만 맨다
    if (look ? look.colors.collar !== undefined : !cat) {
      const cw = p.bodyW + 1;
      const collar = uniformFaces(s.accent, cw, 1, 2, seed());
      collar.front.set(Math.floor(cw / 2), 0, hex(0xf2c14e));
      this.add(this.breath, [0, bh - 1.5, bl / 2 - 1.5], cw, 1, 2, collar);
    }

    // 다리
    const legFaces = FacePainter.leg(s.legTile, lw, lh);
    const fx = p.bodyW / 2 - lw / 2;
    for (const [x, z] of [[-fx, bl - lw], [fx, bl - lw], [-fx, 0], [fx, 0]]) {
      const hip = new THREE.Group();
      hip.position.set(x, 0.01, z);
      this.torso.add(hip);
      this.add(hip, [0, -lh / 2, 0], lw, lh, lw, legFaces);
      this.legs.push(hip);
    }

    // 머리
    this.neck.position.set(0, bh - 1, bl - lw / 2 - 1.5);
    this.torso.add(this.neck);
    this.add(this.neck, [0, hh / 2 - 0.5, hl / 2 - 1.5], hw, hh, hl,
      FacePainter.animalHead(s, hw, hh, hl, p.snoutL > 0));
    const faceZ = hl - 1.5;

    if (p.snoutL > 0) {
      const sw = Math.max(3, hw - 4);
      this.add(this.neck, [0, 0.5, faceZ + p.snoutL / 2], sw, 2, p.snoutL, FacePainter.snout(s, sw, 2, p.snoutL));
    }

    // 눈(깜빡임을 위해 따로). 조명과 상관없이 또렷하게
    const ex = (hw - 3) / 2, ey = hh - 3;
    for (const sx of [-1, 1]) {
      const eye = new THREE.Group();
      eye.position.set(sx * ex, ey, faceZ + 0.06);
      this.neck.add(eye);
      eye.add(flatBox(1, 1.2, 0.12, s.eye));
      const shine = flatBox(0.42, 0.42, 0.13, hex(0xfff6e6));
      shine.position.set(0.25 * -sx, 1.2 * 0.28, 0.02);
      eye.add(shine);
      this.eyes.push(eye);
    }

    // 귀
    const earTop = hh - 0.5, earC = s.ear ?? s.palette[1];
    if (p.ear === "pointy" || p.ear === "round") {
      for (const sx of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(sx * (hw / 2 - 1), earTop, hl / 2 - 2);
        this.neck.add(pivot);
        const baseH = p.ear === "round" ? 2 : Math.max(1, (p.earL ?? 2) - 1);
        const ef = uniformFaces(earC, 2, baseH, 1, seed(9));
        for (let y = 0; y < baseH; y++) ef.front.set(sx < 0 ? 1 : 0, y, mixed(s.blush, earC, 0.65));
        this.add(pivot, [0, baseH / 2, 0], 2, baseH, 1, ef);
        if (p.ear === "pointy") this.add(pivot, [sx * 0.5, baseH + 0.5, 0], 1, 1, 1, uniformFaces(shade(earC, 0.92), 1, 1, 1, seed(10)));
        this.ears.push(pivot);
      }
    } else if (p.ear === "floppy") {
      for (const sx of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(sx * (hw / 2 + 0.5), earTop - 0.5, hl / 2 - 2);
        this.neck.add(pivot);
        const length = Math.max(2, Math.min(5, p.earL ?? 3)), width = look?.coat === "curly" ? 2 : 1;
        this.add(pivot, [0, 0.5 - length / 2, 0], width, length, 2, uniformFaces(earC, width, length, 2, seed(9)));
        this.ears.push(pivot);
      }
    }

    const tail = new THREE.Group();
    this.torso.add(tail);
    this.tail = tail;
    if (look) {
      // 털: 볼 털과 가슴 털(복슬복슬), 정수리 곱슬(곱슬)
      if (look.coat === "fluffy" || look.coat === "curly") {
        const c = look.colors.base ?? s.palette[2];
        for (const sx of [-1, 1]) this.add(this.neck, [(sx * hw) / 2, 1, hl / 2 - 1], 2, 2, 3, uniformFaces(c, 2, 2, 3, seed()));
        if (look.coat === "curly") {
          for (const x of [-2, 0, 2]) this.add(this.neck, [x, hh, hl / 2 - 1], 2, 1, 3, uniformFaces(c, 2, 1, 3, seed()));
        } else {
          this.add(this.breath, [0, bh / 2, bl / 2], p.bodyW + 1, 3, 2, uniformFaces(look.colors.chest ?? c, p.bodyW + 1, 3, 2, seed()));
        }
      }
      // 꼬리는 늘 단다(사진에서 "없음"은 대개 가려진 것이다)
      const width = look.tail === "bushy" ? 3 : cat ? 1 : 2;
      tail.position.set(0, bh - width / 2 - 0.5, -lw / 2);
      this.tailRest = look.tail === "curled" ? 0.25 : 0.85;
      const color = s.tail ?? s.palette[2];
      const segment = (w: number, h: number, l: number, at: number[], tip = false) =>
        this.add(tail, at, w, h, l, uniformFaces(tip ? s.tailTip ?? color : color, w, h, l, seed()));
      if (look.tail === "curled") {
        segment(width, width, 3, [0, 0, -1.5]);
        segment(width, 3, width, [0, 1.5, -3]);
        segment(width, width, 3, [0, 3, -1.5], true);
      } else {
        const length = Math.max(2, p.tailL - 1);
        segment(width, width, length, [0, 0, -length / 2]);
        segment(width, width, 1, [0, 0, -length - 0.5], true);
      }
    } else {
      const tw = cat ? 1 : 2;
      tail.position.set(0, bh - tw / 2 - 0.5, -lw / 2);
      const seg1 = cat ? Math.floor(p.tailL / 2) : p.tailL;
      this.add(tail, [0, 0, -seg1 / 2], tw, tw, seg1, uniformFaces(cat ? s.palette[1] : s.palette[2], tw, tw, seg1, seed(12)));
      this.tailRest = cat ? 0.9 : 0.85;
      if (cat) {
        const tip = new THREE.Group();
        tip.position.set(0, 0, -seg1);
        tail.add(tip);
        const seg2 = p.tailL - seg1;
        const tf = uniformFaces(s.palette[1], 1, 1, seg2, seed(13));
        const tipC = s.palette[4];
        tf.right.set(seg2 - 1, 0, tipC); tf.left.set(0, 0, tipC); tf.back.set(0, 0, tipC);
        this.add(tip, [0, 0, -seg2 / 2], 1, 1, seg2, tf);
        tip.rotation.x = 0.7;
        this.tailTip = tip;
      }
    }
    tail.rotation.x = this.tailRest;
  }

  private add(parent: THREE.Object3D, at: number[], w: number, h: number, l: number, faces: BoxFaces) {
    const mesh = new THREE.Mesh(boxGeometry(w, h, l, faces), litMaterial);
    mesh.position.set(at[0], at[1], at[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    this.parts.push({ mesh, w, h, l, faces });
  }

  /** 겉면 도트마다 한 칸짜리 블록의 중심(root 기준 유닛)과 색. 조립 연출에 쓴다. */
  surfaceDots(): Dot[] {
    this.root.updateMatrixWorld(true);
    const toRoot = new THREE.Matrix4().copy(this.root.matrixWorld).invert();
    const seen = new Set<string>();
    const out: Dot[] = [];
    const rootTurn = this.root.getWorldQuaternion(new THREE.Quaternion()).invert();
    for (const [index, part] of this.parts.entries()) {
      const size = [part.w, part.h, part.l];
      const turn = rootTurn.clone().multiply(part.mesh.getWorldQuaternion(new THREE.Quaternion()));
      for (const key of FACE_ORDER) {
        const img = part.faces[key], f = FACE_FRAMES[key];
        for (let j = 0; j < img.h; j++) {
          for (let i = 0; i < img.w; i++) {
            const c = img.get(i, j);
            if (isClear(c)) continue;
            const u = (i + 0.5) / img.w, v = (j + 0.5) / img.h;
            // 겉면에서 반 칸 안쪽이 블록의 중심이다
            const local = [0, 1, 2].map((k) => (f.o[k] + f.u[k] * u + f.v[k] * v) * size[k] - f.n[k] * 0.5);
            const position = new THREE.Vector3(local[0], local[1], local[2])
              .applyMatrix4(part.mesh.matrixWorld).applyMatrix4(toRoot);
            const id = `${Math.round(position.x * 64)},${Math.round(position.y * 64)},${Math.round(position.z * 64)}`;
            if (seen.has(id)) continue;
            seen.add(id);
            out.push({ position, color: toColor(c), part: index, turn });
          }
        }
      }
    }
    return out;
  }

  /** 조립 연출: 모든 조각을 숨겨 두었다가(`false`) 부위별로, 또는 한꺼번에(`true`) 드러낸다. */
  setBuilt(built: boolean) {
    for (const p of this.parts) p.mesh.visible = built;
    for (const e of this.eyes) e.visible = built;
  }
  showPart(index: number) {
    this.parts[index].mesh.visible = true;
  }
  /** 눈을 감긴다(깨어날 때 다음 깜빡임으로 뜬다). */
  closeEyes() {
    for (const e of this.eyes) e.scale.y = 0.1;
    this.blink = 0.06;
  }

  /** 쓰다듬기: 폴짝 뛰고 꼬리를 흔들고 하트가 뜬다. `lift`는 하트가 머리 위 몇 도트에서 뜨기 시작하는지. */
  pet(height = 5, lift = 3) {
    this.hopHeight = height;
    if (this.hopTime < 0) this.hopTime = 0;
    this.wagLeft = 0.09 * 2 * 5;
    heartTexture ??= spriteTexture(HEART);
    const node = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTexture, depthWrite: false, depthTest: false }));
    node.scale.set(7 * 0.62, 6 * 0.62, 1);
    node.position.set((Math.random() - 0.5) * 3, this.top + lift, 2);
    node.renderOrder = 10;
    this.hop.add(node);
    this.hearts.push({ node, age: 0 });
  }

  wag(times = 4) {
    this.wagLeft = Math.max(this.wagLeft, 0.09 * 2 * times);
  }

  update(dt: number) {
    this.time += dt;
    const t = this.time;

    // 하트는 떠오르며 사라진다
    for (const h of this.hearts) {
      h.age += dt;
      h.node.position.y += dt * 5;
      h.node.material.opacity = clamp(1.6 - h.age * 1.6, 0, 1);
    }
    this.hearts = this.hearts.filter((h) => {
      if (h.age < 1) return true;
      this.hop.remove(h.node);
      h.node.material.dispose();
      return false;
    });

    // 목은 늘 부드럽게 따라간다
    const n = this.neck.rotation;
    n.y = damp(n.y, clamp(this.look.yaw, -0.65, 0.65), 7, dt);
    n.x = damp(n.x, clamp(this.look.pitch, -0.2, 0.3), 7, dt);
    n.z = damp(n.z, this.look.roll, 5, dt);

    // 폴짝: 올라갔다 내려온 뒤 살짝 눌린다
    if (this.hopTime >= 0) {
      this.hopTime += dt;
      const air = 0.38, k = this.hopTime / air;
      if (k < 1) {
        this.hop.position.y = this.hopHeight * 4 * k * (1 - k);
        this.hop.scale.set(1, 1, 1);
      } else {
        this.hop.position.y = 0;
        const q = (this.hopTime - air) / 0.18;
        const squash = q < 0.45 ? q / 0.45 : Math.max(0, 1 - (q - 0.45) / 0.55);
        this.hop.scale.set(1 + 0.08 * squash, 1 - 0.12 * squash, 1 + 0.08 * squash);
        if (q >= 1) this.hopTime = -1;
      }
    }

    if (!this.alive) {
      this.breathing = 0;
      return;
    }

    // 숨쉬기
    this.breathing += dt;
    this.breath.scale.y = 1 + 0.035 * Math.sin((this.breathing / 2.4) * Math.PI * 2);

    // 깜빡임
    if (this.blink < 0 && t > this.blinkAt) this.blink = 0;
    if (this.blink >= 0) {
      this.blink += dt;
      const k = this.blink < 0.06 ? 1 - 0.9 * (this.blink / 0.06) : 0.1 + 0.9 * Math.min(1, (this.blink - 0.06) / 0.08);
      for (const e of this.eyes) e.scale.y = k;
      if (this.blink > 0.14) {
        this.blink = -1;
        this.blinkAt = t + 3.2 + Math.random() * 3;
      }
    }

    // 귀 쫑긋
    if (this.twitch < 0 && t > this.twitchAt) this.twitch = 0;
    if (this.twitch >= 0) {
      this.twitch += dt;
      const k = this.twitch < 0.06 ? this.twitch / 0.06 : Math.max(0, 1 - (this.twitch - 0.06) / 0.1);
      this.ears.forEach((e, i) => (e.rotation.z = (i === 0 ? 1 : -1) * 0.35 * k));
      if (this.twitch > 0.16) {
        this.twitch = -1;
        this.twitchAt = t + 4 + Math.random() * 6;
      }
    }

    // 꼬리: 강아지는 가끔 세게 흔들고, 고양이는 천천히 살랑거린다
    if (this.tail) {
      if (this.spec.kind === "dog" && this.wagLeft <= 0 && t > this.wagAt) {
        this.wag(4);
        this.wagAt = t + 5 + Math.random() * 5;
      }
      if (this.wagLeft > 0) {
        this.wagLeft -= dt;
        const phase = (this.wagLeft / 0.18) % 1;
        const tri = phase < 0.5 ? 1 - phase * 4 : -3 + phase * 4;
        this.tail.rotation.x = damp(this.tail.rotation.x, this.tailRest + 0.25, 30, dt);
        this.tail.rotation.y = 0.55 * tri;
      } else if (this.spec.kind === "cat") {
        this.tail.rotation.y = 0.22 * Math.sin(t * 1.1);
        this.tail.rotation.x = this.tailRest + 0.08 * Math.sin(t * 0.7);
        if (this.tailTip) this.tailTip.rotation.x = 0.7 + 0.25 * Math.sin(t * 1.3 + 1);
      } else {
        this.tail.rotation.x = damp(this.tail.rotation.x, this.tailRest, 12, dt);
        this.tail.rotation.y = damp(this.tail.rotation.y, 0, 12, dt);
      }
    }
  }

  /** 가만히 선 자세로 바로 되돌린다: 숨·눈·귀·꼬리·뜀은 처음 자리로, 목은 `look`이 가리키는 쪽으로. */
  rest() {
    this.breath.scale.y = 1;
    for (const e of this.eyes) e.scale.y = 1;
    for (const e of this.ears) e.rotation.z = 0;
    if (this.tail) {
      this.tail.rotation.x = this.tailRest;
      this.tail.rotation.y = 0;
    }
    if (this.tailTip) this.tailTip.rotation.x = 0.7;
    this.hop.position.y = 0;
    this.hop.scale.set(1, 1, 1);
    this.hopTime = -1;
    this.wagLeft = 0;
    this.blink = -1;
    this.twitch = -1;
    this.neck.rotation.set(clamp(this.look.pitch, -0.2, 0.3), clamp(this.look.yaw, -0.65, 0.65), this.look.roll);
  }
}
