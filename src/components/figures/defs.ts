import type { FigureDef } from './skeleton';

// Angle cheat sheet: 0 = down, 90 = right, 180 = up, -90 = left.
// Side-view figures face right; "l" limbs are the far side (drawn faded).

export const FIGURES: Record<string, FigureDef> = {
  hops: {
    view: 'front',
    seg: 0.32,
    poses: [
      { ll: [-4, -9], rl: [4, 9], la: [-22, -10], ra: [22, 10] },
      { lift: 10, ll: [-6, -3], rl: [6, 3], la: [-10, -4], ra: [10, 4] },
    ],
  },

  heelRaise: {
    view: 'side',
    seg: 1.1,
    poses: [
      { hold: 0.3 },
      { lf: 38, rf: 38, ra: [10, 20], la: [-2, 10], hold: 0.6 },
    ],
  },

  march: {
    view: 'side',
    seg: 0.5,
    poses: [
      { rl: [72, 0], ll: [-4, -4], ra: [-35, -25], la: [40, 75] },
      { rl: [3, 3], ll: [3, 3], ra: [4, 10], la: [-4, 6] },
      { ll: [72, 0], rl: [-4, -4], la: [-35, -25], ra: [40, 75] },
      { rl: [3, 3], ll: [3, 3], ra: [4, 10], la: [-4, 6] },
    ],
  },

  armCircles: {
    view: 'side',
    seg: 0.38,
    ease: 'linear',
    poses: [
      { ra: [0, 0], la: [8, 8] },
      { ra: [90, 90], la: [98, 98] },
      { ra: [180, 180], la: [188, 188] },
      { ra: [-90, -90], la: [-82, -82] },
    ],
  },

  shoulderRolls: {
    view: 'side',
    seg: 0.55,
    ease: 'linear',
    poses: [
      { shx: 5, shy: 2, ra: [8, 12], la: [4, 8] },
      { shx: 2, shy: -9, ra: [2, 6], la: [-2, 2] },
      { shx: -6, shy: -4, ra: [-6, -2], la: [-10, -6] },
      { shx: -3, shy: 3, ra: [0, 4], la: [-4, 0] },
    ],
  },

  neckTilt: {
    view: 'front',
    seg: 1.6,
    poses: [
      { hold: 0.6 },
      { head: 142, ra: [150, 225], hold: 2.5 },
    ],
  },

  chestOpener: {
    view: 'side',
    seg: 1.4,
    poses: [
      { ra: [-12, -28], la: [-16, -30], hold: 0.6 },
      { torso: 188, head: 200, ra: [-38, -55], la: [-42, -58], hold: 2.5 },
    ],
  },

  catCow: {
    view: 'side',
    seg: 1.8,
    base: {
      torso: 112, ra: [0, 0], la: [-3, -3], ll: [0, -90], rl: [3, -90], lf: -90, rf: -90,
    },
    poses: [
      { curve: 7, head: 150, hold: 0.8 },
      { curve: -10, head: 35, hold: 0.8 },
    ],
  },

  childsPose: {
    view: 'side',
    seg: 2.5,
    base: {
      x: 75, ll: [50, -90], rl: [54, -90], lf: -90, rf: -90,
      torso: 74, head: 62, ra: [88, 92], la: [86, 90],
    },
    poses: [{ curve: -2 }, { curve: -8, hold: 0.6 }],
  },

  sideBend: {
    view: 'front',
    seg: 1.6,
    poses: [
      { la: [175, 178], ra: [14, 6], hold: 0.5 },
      { torso: 158, head: 150, la: [140, 118], ra: [24, 18], ll: [-9, -3], rl: [5, 2], hold: 2.5 },
    ],
  },

  forwardFold: {
    view: 'side',
    seg: 2,
    poses: [
      { hold: 0.5 },
      {
        torso: 52, head: 20, curve: -7, ra: [5, -5], la: [0, -8],
        ll: [12, -8], rl: [14, -8], hold: 2.5,
      },
    ],
  },

  hipCircles: {
    view: 'front',
    seg: 0.6,
    base: { la: [-40, 55], ra: [40, -55] },
    poses: [
      { x: 93, torso: 186, ll: [-1, 3], rl: [13, 9] },
      { x: 100, torso: 180, lift: -2 },
      { x: 107, torso: 174, ll: [-13, -9], rl: [1, -3] },
      { x: 100, torso: 180, lift: 2 },
    ],
  },

  quadStretch: {
    view: 'side',
    seg: 1.4,
    poses: [
      { hold: 0.4 },
      { torso: 186, rl: [5, -150], ra: [-12, -6], la: [-50, -20], hold: 3 },
    ],
  },

  hamstring: {
    view: 'side',
    seg: 1.6,
    poses: [
      { hold: 0.4 },
      {
        x: 90, torso: 140, head: 130, rl: [22, 22], rf: 160, ll: [-15, -20],
        ra: [30, 40], la: [26, 36], hold: 3,
      },
    ],
  },

  figureFour: {
    view: 'side',
    seg: 1.6,
    base: {
      x: 120, torso: -90, head: -82, ll: [150, 20], rl: [150, 20], lf: 90, rf: 90,
      la: [130, 100], ra: [128, 98],
    },
    poses: [
      { hold: 0.4 },
      { rl: [125, 80], rf: 100, hold: 0.6 },
      { ll: [165, 35], rl: [138, 88], rf: 100, la: [140, 110], ra: [138, 108], hold: 2.5 },
    ],
  },

  torsoTwist: {
    view: 'front',
    seg: 0.75,
    poses: [
      { torso: 177, la: [-75, -45], ra: [-30, -85] },
      { torso: 183, ra: [75, 45], la: [30, 85] },
    ],
  },

  breathing: {
    view: 'front',
    seg: 4,
    base: { la: [-25, 42], ra: [25, -42] },
    poses: [
      { breath: 3, shy: 1 },
      { breath: 15, shy: -3, hold: 0.5 },
    ],
  },

  wristAnkle: {
    view: 'front',
    seg: 0.35,
    ease: 'linear',
    base: { ll: [-3, -2], rl: [22, 8] },
    poses: [
      { la: [-25, -150], ra: [25, 150], rf: 60 },
      { la: [-25, -170], ra: [25, 170], rf: 110 },
      { la: [-25, 170], ra: [25, -170], rf: 150 },
      { la: [-25, -170], ra: [25, 170], rf: 110 },
    ],
  },

  calfStretch: {
    view: 'side',
    seg: 1.6,
    wall: 160,
    base: { x: 90 },
    poses: [
      { torso: 168, ra: [100, 92], la: [98, 90], rl: [18, -6], ll: [-16, -16], hold: 0.6 },
      { torso: 156, ra: [96, 88], la: [94, 86], rl: [32, -10], ll: [-26, -26], hold: 2.5 },
    ],
  },

  overheadReach: {
    view: 'front',
    seg: 1.3,
    poses: [
      { hold: 0.4 },
      { la: [168, 176], ra: [192, 184], hold: 0.4 },
      { la: [172, 179], ra: [188, 181], lift: 6, lf: -60, rf: 60, hold: 1.2 },
    ],
  },
};
