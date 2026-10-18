/**
 * Tiny forward-kinematics stick figure.
 *
 * Every segment angle is absolute, in degrees, measured from "straight down":
 *   0 = down, 90 = right (+x), 180 = up, -90 = left.
 * Poses are interpolated angle-by-angle (shortest path), so limb lengths stay
 * constant while animating. Each frame is auto-grounded so the lowest point
 * rests on the floor.
 */

export const FLOOR = 186;
const L = { torso: 46, neck: 7, head: 11, ua: 26, fa: 24, th: 32, sh: 32, foot: 9 };

export type Pose = {
  x: number;
  /** Raise the whole body off the floor (hops, heel raises). */
  lift: number;
  torso: number;
  head: number;
  /** Bulge of the spine; negative bows toward the left of the torso direction. */
  curve: number;
  /** Shoulder offset from the neck (shrugs/rolls). */
  shx: number;
  shy: number;
  /** Radius of a "breath" circle drawn on the belly. */
  breath: number;
  /** [upper arm, forearm] */
  la: [number, number];
  ra: [number, number];
  /** [thigh, shin] */
  ll: [number, number];
  rl: [number, number];
  /** Foot angles. */
  lf: number;
  rf: number;
};

export type PoseInput = Partial<Pose> & { hold?: number };

export type FigureDef = {
  view: 'front' | 'side';
  /** Seconds to move between consecutive poses. */
  seg: number;
  ease?: 'linear' | 'inOut';
  base?: Partial<Pose>;
  poses: PoseInput[];
  /** x position of a wall prop. */
  wall?: number;
};

const FRONT_BASE: Pose = {
  x: 100, lift: 0, torso: 180, head: NaN, curve: 0, shx: 0, shy: 0, breath: 0,
  la: [-14, -6], ra: [14, 6], ll: [-7, -3], rl: [7, 3], lf: -90, rf: 90,
};

const SIDE_BASE: Pose = {
  x: 100, lift: 0, torso: 180, head: NaN, curve: 0, shx: 0, shy: 0, breath: 0,
  la: [-4, 6], ra: [4, 10], ll: [-3, -3], rl: [3, 3], lf: 90, rf: 90,
};

export function resolvePoses(def: FigureDef): { pose: Pose; hold: number }[] {
  const base = { ...(def.view === 'front' ? FRONT_BASE : SIDE_BASE), ...def.base };
  return def.poses.map(({ hold = 0, ...p }) => {
    const pose: Pose = { ...base, ...p };
    if (Number.isNaN(pose.head)) pose.head = pose.torso;
    return { pose, hold };
  });
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function lerpAngle(a: number, b: number, t: number) {
  let d = (((b - a) % 360) + 540) % 360 - 180;
  if (d === -180 && b > a) d = 180;
  return a + d * t;
}
const lerpPair = (a: [number, number], b: [number, number], t: number): [number, number] => [
  lerpAngle(a[0], b[0], t),
  lerpAngle(a[1], b[1], t),
];

export function blend(a: Pose, b: Pose, t: number): Pose {
  return {
    x: lerp(a.x, b.x, t),
    lift: lerp(a.lift, b.lift, t),
    torso: lerpAngle(a.torso, b.torso, t),
    head: lerpAngle(a.head, b.head, t),
    curve: lerp(a.curve, b.curve, t),
    shx: lerp(a.shx, b.shx, t),
    shy: lerp(a.shy, b.shy, t),
    breath: lerp(a.breath, b.breath, t),
    la: lerpPair(a.la, b.la, t),
    ra: lerpPair(a.ra, b.ra, t),
    ll: lerpPair(a.ll, b.ll, t),
    rl: lerpPair(a.rl, b.rl, t),
    lf: lerpAngle(a.lf, b.lf, t),
    rf: lerpAngle(a.rf, b.rf, t),
  };
}

/** Pose at time `t` seconds into a looping animation. */
export function poseAt(def: FigureDef, frames: { pose: Pose; hold: number }[], t: number): Pose {
  if (frames.length === 1) return frames[0].pose;
  const n = frames.length;
  const total = frames.reduce((s, f) => s + def.seg + f.hold, 0);
  let time = ((t % total) + total) % total;
  for (let i = 0; i < n; i++) {
    const from = frames[i];
    const to = frames[(i + 1) % n];
    if (time < def.seg) {
      const k = time / def.seg;
      const eased = def.ease === 'linear' ? k : 0.5 - 0.5 * Math.cos(Math.PI * k);
      return blend(from.pose, to.pose, eased);
    }
    time -= def.seg;
    if (time < to.hold) return to.pose;
    time -= to.hold;
  }
  return frames[0].pose;
}

type Pt = [number, number];
const dir = (deg: number): Pt => {
  const r = (deg * Math.PI) / 180;
  return [Math.sin(r), Math.cos(r)];
};
const add = (p: Pt, deg: number, len: number): Pt => {
  const [dx, dy] = dir(deg);
  return [p[0] + dx * len, p[1] + dy * len];
};

export type Joints = {
  hip: Pt; neck: Pt; shoulder: Pt; head: Pt; spineCtrl: Pt; belly: Pt;
  lElbow: Pt; lHand: Pt; rElbow: Pt; rHand: Pt;
  lKnee: Pt; lAnkle: Pt; lToe: Pt; rKnee: Pt; rAnkle: Pt; rToe: Pt;
};

export const HEAD_R = L.head;

export function solve(p: Pose, view: 'front' | 'side'): Joints {
  const footLen = view === 'front' ? 7 : L.foot;
  const hip: Pt = [p.x, 0];
  const neck = add(hip, p.torso, L.torso);
  const shoulder: Pt = [neck[0] + p.shx, neck[1] + p.shy];
  const head = add(neck, p.head, L.neck + L.head);
  const [tx, ty] = dir(p.torso);
  const mid: Pt = [(hip[0] + neck[0]) / 2, (hip[1] + neck[1]) / 2];
  const spineCtrl: Pt = [mid[0] - ty * p.curve, mid[1] + tx * p.curve];
  const belly: Pt = [hip[0] + (neck[0] - hip[0]) * 0.3, hip[1] + (neck[1] - hip[1]) * 0.3];

  const lElbow = add(shoulder, p.la[0], L.ua);
  const lHand = add(lElbow, p.la[1], L.fa);
  const rElbow = add(shoulder, p.ra[0], L.ua);
  const rHand = add(rElbow, p.ra[1], L.fa);
  const lKnee = add(hip, p.ll[0], L.th);
  const lAnkle = add(lKnee, p.ll[1], L.sh);
  const lToe = add(lAnkle, p.lf, footLen);
  const rKnee = add(hip, p.rl[0], L.th);
  const rAnkle = add(rKnee, p.rl[1], L.sh);
  const rToe = add(rAnkle, p.rf, footLen);

  const j: Joints = {
    hip, neck, shoulder, head, spineCtrl, belly,
    lElbow, lHand, rElbow, rHand, lKnee, lAnkle, lToe, rKnee, rAnkle, rToe,
  };

  // Ground: put the lowest point on the floor, then apply lift.
  const pts = Object.entries(j)
    .filter(([k]) => k !== 'head' && k !== 'spineCtrl' && k !== 'belly')
    .map(([, v]) => v[1]);
  const lowest = Math.max(...pts, head[1] + L.head);
  const dy = FLOOR - 3 - lowest - p.lift;
  for (const v of Object.values(j)) v[1] += dy;
  return j;
}
