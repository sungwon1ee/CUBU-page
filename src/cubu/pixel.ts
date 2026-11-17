// 앱(CUBU/Pixel, CUBU/Scene)의 도트 그림 코드를 그대로 옮긴 것.
// 색 연산의 버림(Int 변환)과 난수 순서까지 맞춰야 앱과 같은 무늬가 나온다.

/** 0xRRGGBBAA. alpha 0 = 빈칸. */
export type RGBA = number;

const byte = (v: number) => Math.max(0, Math.min(255, Math.trunc(v)));

export const rgba = (r: number, g: number, b: number, a = 255): RGBA =>
  ((byte(r) << 24) | (byte(g) << 16) | (byte(b) << 8) | byte(a)) >>> 0;
export const hex = (h: number): RGBA => ((h << 8) | 0xff) >>> 0;

export const R = (c: RGBA) => (c >>> 24) & 0xff;
export const G = (c: RGBA) => (c >>> 16) & 0xff;
export const B = (c: RGBA) => (c >>> 8) & 0xff;
export const A = (c: RGBA) => c & 0xff;
export const isClear = (c: RGBA) => A(c) < 128;
export const luma = (c: RGBA) => 0.299 * R(c) + 0.587 * G(c) + 0.114 * B(c);

export const scaled = (c: RGBA, k: number): RGBA => rgba(R(c) * k, G(c) * k, B(c) * k, A(c));
export const mixed = (c: RGBA, o: RGBA, t: number): RGBA =>
  rgba(R(c) + (R(o) - R(c)) * t, G(c) + (G(o) - G(c)) * t, B(c) + (B(o) - B(c)) * t, A(c));
/** 그림자는 차갑게 대신 갈색 쪽으로 어둡게. */
export const shade = (c: RGBA, k: number): RGBA => mixed(scaled(c, k), hex(0x3a2218), (1 - k) * 0.35);

const MASK = (1n << 64n) - 1n;
const GOLDEN = 0x9e3779b97f4a7c15n;

export class SplitMix {
  private state: bigint;
  constructor(seed: number | bigint) {
    this.state = (BigInt(seed) + GOLDEN) & MASK;
  }
  next(): bigint {
    this.state = (this.state + GOLDEN) & MASK;
    let z = this.state;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK;
    return z ^ (z >> 31n);
  }
  unit(): number {
    return Number(this.next() >> 11n) / 9007199254740992;
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.unit();
  }
}

export class PixelImage {
  readonly w: number;
  readonly h: number;
  px: Uint32Array;

  constructor(w: number, h: number, fill: RGBA = 0) {
    this.w = Math.max(w, 1);
    this.h = Math.max(h, 1);
    this.px = new Uint32Array(this.w * this.h).fill(fill);
  }
  get(x: number, y: number): RGBA {
    return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.px[y * this.w + x] : 0;
  }
  set(x: number, y: number, c: RGBA) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = c;
  }
  clone(): PixelImage {
    const o = new PixelImage(this.w, this.h);
    o.px.set(this.px);
    return o;
  }
  /** 최근접 리샘플. */
  resampled(nw: number, nh: number): PixelImage {
    const o = new PixelImage(nw, nh);
    for (let y = 0; y < o.h; y++)
      for (let x = 0; x < o.w; x++) o.set(x, y, this.get(Math.floor((x * this.w) / o.w), Math.floor((y * this.h) / o.h)));
    return o;
  }
  flippedH(): PixelImage {
    const o = this.clone();
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) o.set(x, y, this.get(this.w - 1 - x, y));
    return o;
  }
  /** 바닥 줄을 살짝 어둡게: 손으로 칠한 앰비언트 오클루전. */
  aoBottom(k = 0.82): PixelImage {
    const o = this.clone();
    for (let i = 0; i < this.w; i++) {
      const c = o.get(i, this.h - 1);
      if (!isClear(c)) o.set(i, this.h - 1, shade(c, k));
    }
    return o;
  }
  aoTop(k = 0.9): PixelImage {
    const o = this.clone();
    for (let i = 0; i < this.w; i++) {
      const c = o.get(i, 0);
      if (!isClear(c)) o.set(i, 0, shade(c, k));
    }
    return o;
  }
}

/** 상자 여섯 면. 바깥에서 볼 때 그림의 왼쪽 위가 (0, 0)이다. */
export interface BoxFaces {
  front: PixelImage; // +z
  right: PixelImage; // +x
  back: PixelImage; // -z
  left: PixelImage; // -x
  top: PixelImage; // +y
  bottom: PixelImage; // -y
}

export function uniformFaces(c: RGBA, w: number, h: number, l: number, seed: number | bigint = 5): BoxFaces {
  const rng = new SplitMix(seed);
  const f = (a: number, b: number) => {
    const p = new PixelImage(a, b);
    for (let i = 0; i < p.px.length; i++) p.px[i] = scaled(c, 1 + rng.range(-0.05, 0.05));
    return p;
  };
  // 앱과 같은 순서로 난수를 쓴다
  const front = f(w, h), right = f(l, h), back = f(w, h), left = f(l, h), top = f(w, l), bottom = f(w, l);
  return { front, right, back, left, top, bottom };
}

export type FurPattern = "twoTone" | "tuxedo";
export type Region = "head" | "body" | "leg";

/** palette: 어두움→밝음 5색. 반환: 16×16 타일 */
export function furTile(pattern: FurPattern, p: RGBA[], seed: number, region: Region): PixelImage {
  const rng = new SplitMix(seed);
  const t = new PixelImage(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dx = Math.abs(x - 8);
      let idx: number;
      if (pattern === "twoTone") {
        idx = region === "head" ? (y > 9 || (y > 6 && dx < 3) ? 4 : 2) : y > 10 ? 4 : 2;
      } else {
        idx =
          region === "head"
            ? (y > 8 && dx < 4) || (y > 4 && dx < 1) ? 4 : 0
            : region === "leg" ? (y > 11 ? 4 : 0) : y > 9 ? 4 : 0;
      }
      t.set(x, y, scaled(p[idx], 1 + rng.range(-0.05, 0.05)));
    }
  }
  return t;
}

export interface Skin {
  palette: RGBA[];
  bodyTile: PixelImage;
  headTile: PixelImage;
  legTile: PixelImage;
  eye: RGBA;
  nose: RGBA;
  blush: RGBA;
  accent: RGBA;
  // 사진에서 뽑은 부위별 색(없으면 팔레트로 대신)
  ear?: RGBA;
  tail?: RGBA;
  tailTip?: RGBA;
  muzzle?: RGBA;
  /** 사진에서 읽은 생김새(앱의 AnimalAppearance). 처음부터 있는 친구에게는 없다 */
  appearance?: { coat?: string | null; tail?: string | null; colors: Record<string, RGBA> };
}

export function makeSkin(pattern: FurPattern, palette: RGBA[], seed: number): Skin {
  return {
    palette,
    bodyTile: furTile(pattern, palette, seed, "body"),
    headTile: furTile(pattern, palette, seed + 1, "head"),
    legTile: furTile(pattern, palette, seed + 2, "leg"),
    eye: hex(0x2a1a14),
    nose: hex(0x3b2420),
    blush: hex(0xf0a0a0),
    accent: hex(0xe58c8a),
  };
}

const div = (a: number, b: number) => Math.floor(a / b);

export const FacePainter = {
  /** bodyTile: 몸 옆모습, x=0 쪽이 머리 방향, 위=등, 아래=배 */
  body(t: PixelImage, w: number, h: number, l: number): BoxFaces {
    const side = t.resampled(l, h).aoBottom();
    const top = new PixelImage(w, l);
    for (let j = 0; j < l; j++)
      for (let i = 0; i < w; i++) {
        const edge = Math.abs(i - (w - 1) / 2) / Math.max(w, 1);
        top.set(i, j, t.get(div((l - 1 - j) * 16, l), edge > 0.3 ? 2 : 0));
      }
    const bottom = new PixelImage(w, l);
    for (let j = 0; j < l; j++) for (let i = 0; i < w; i++) bottom.set(i, j, shade(t.get(div(j * 16, l), 15 - (i % 2)), 0.8));
    const front = new PixelImage(w, h), back = new PixelImage(w, h);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        front.set(i, j, t.get(1 + ((i + j) % 2), div(j * 16, h)));
        back.set(i, j, t.get(14 - ((i + j) % 2), div(j * 16, h)));
      }
    return { front: front.aoBottom(), right: side, back: back.aoBottom(), left: side.flippedH(), top, bottom };
  },

  leg(t: PixelImage, w: number, h: number): BoxFaces {
    const face = (ox: number) => {
      const f = new PixelImage(w, h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) f.set(i, j, t.get((ox + i * 3) % 16, div(j * 16, h)));
      return f.aoTop(0.85);
    };
    return {
      front: face(2), right: face(6), back: face(10), left: face(13),
      top: new PixelImage(w, w, t.get(8, 0)),
      bottom: new PixelImage(w, w, shade(t.get(8, 15), 0.8)),
    };
  },

  /** headTile: 얼굴 정면 무늬 */
  animalHead(s: Skin, w: number, h: number, l: number, snout: boolean): BoxFaces {
    const t = s.headTile;
    const front = t.resampled(w, h);
    const cheekY = h - 2;
    if (w >= 6) {
      const blush = s.appearance ? 0.22 : 0.7;
      front.set(0, cheekY, mixed(front.get(0, cheekY), s.blush, blush));
      front.set(w - 1, cheekY, mixed(front.get(w - 1, cheekY), s.blush, blush));
    }
    if (!snout) {
      // 고양이: 주둥이 색 위에 코 한 점 + ω 입
      const cx = div(w, 2), ny = h - 2, even = w % 2 === 0 ? 1 : 0;
      if (s.muzzle !== undefined) {
        for (let y = ny - 1; y <= Math.min(h - 1, ny + 1); y++)
          for (let x = cx - 2; x <= cx + 1; x++) if (x >= 1 && x < w - 1) front.set(x, y, mixed(front.get(x, y), s.muzzle, 0.75));
      }
      front.set(cx - even, ny, s.nose);
      if (even) front.set(cx, ny, s.nose);
      front.set(cx - 1 - even, ny + 1, mixed(s.nose, front.get(cx, ny + 1), 0.35));
      front.set(cx + 1, ny + 1, mixed(s.nose, front.get(cx, ny + 1), 0.35));
    }
    const side = new PixelImage(l, h), top = new PixelImage(w, l), back = new PixelImage(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < l; i++) side.set(i, j, t.get((i + j) % 2, div(j * 16, h)));
    for (let j = 0; j < l; j++) for (let i = 0; i < w; i++) top.set(i, j, t.get(div(i * 16, w), j % 2));
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) back.set(i, j, t.get(div(i * 16, w), Math.min(3, j)));
    const bottom = new PixelImage(w, l, shade(t.get(8, 15), 0.85));
    return { front, right: side, back, left: side.flippedH(), top, bottom };
  },

  snout(s: Skin, w: number, h: number, l: number): BoxFaces {
    // 주둥이는 얼굴 아래쪽의 가장 밝은 색
    const under = s.headTile.get(8, 14);
    const muzzle = s.muzzle ?? (luma(under) > luma(s.palette[3]) ? under : mixed(s.palette[3], s.palette[4], 0.5));
    const f = uniformFaces(muzzle, w, h, l, 77);
    const cx = div(w, 2);
    f.front.set(cx, 0, s.nose);
    if (w % 2 === 0) f.front.set(cx - 1, 0, s.nose);
    f.front.set(cx, 1, shade(muzzle, 0.8));
    f.top.set(cx, l - 1, s.nose);
    if (w % 2 === 0) f.top.set(cx - 1, l - 1, s.nose);
    return f;
  },
};

/** 문자열 도트 그림. '.'은 빈칸. */
export function sprite(rows: string[], colors: Record<string, RGBA>, seed = 3): PixelImage {
  const rng = new SplitMix(seed);
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const img = new PixelImage(w, h);
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const c = colors[ch];
      if (c !== undefined) img.set(x, y, scaled(c, 1 + rng.range(-0.04, 0.04)));
    });
  });
  return img;
}
