import * as THREE from "three";
import { hex, shade } from "./pixel";
import { toColor } from "./rig";

/** 앱이 내보낸 블록: [x, y, z, 0xRRGGBB]. y는 바닥에서 위로, 앞은 +z. */
export type VoxelList = number[][];

const DIRS = [
  { d: [1, 0, 0], k: 0.88, q: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
  { d: [-1, 0, 0], k: 0.88, q: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
  { d: [0, 1, 0], k: 1.0, q: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { d: [0, -1, 0], k: 0.7, q: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { d: [0, 0, 1], k: 0.94, q: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { d: [0, 0, -1], k: 0.94, q: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
];

/** 앱의 VoxelMesher.geometry와 같다: 보이는 면만, 면마다 은은한 밝기 차를 둔다. 길이 단위는 도트. */
export function voxelGeometry(voxels: VoxelList): THREE.BufferGeometry {
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  const filled = new Set(voxels.map((v) => key(v[0], v[1], v[2])));
  const pos: number[] = [], nor: number[] = [], col: number[] = [];
  for (const [x, y, z, rgb] of voxels) {
    for (const f of DIRS) {
      if (filled.has(key(x + f.d[0], y + f.d[1], z + f.d[2]))) continue;
      const c = toColor(shade(hex(rgb), f.k));
      for (const i of [0, 1, 2, 0, 2, 3]) {
        const p = f.q[i];
        pos.push(x + p[0], y + p[1], z + p[2]);
        nor.push(f.d[0], f.d[1], f.d[2]);
        col.push(c.r, c.g, c.b);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
}
