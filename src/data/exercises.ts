export type Focus = 'lymphatic' | 'neck' | 'shoulders' | 'back' | 'hips' | 'legs' | 'full';

export type Exercise = {
  id: string;
  name: string;
  emoji: string;
  durationSec: number;
  /** Split into left/right halves with a "switch sides" cue. */
  sides?: boolean;
  /** Suitable as a gentle opener for a random routine. */
  gentle?: boolean;
  focus: Focus[];
  cues: string[];
  figure: string;
};

export const EXERCISES: Exercise[] = [
  {
    id: 'lymphatic-hops',
    name: 'Lymphatic Hops',
    emoji: '🐇',
    durationSec: 60,
    focus: ['lymphatic', 'full'],
    cues: [
      'Stand tall, feet hip-width apart',
      'Bounce gently on the balls of your feet',
      'Keep knees soft and arms loose',
      'Small, light hops — no need to leave the ground much',
    ],
    figure: 'hops',
  },
  {
    id: 'heel-raises',
    name: 'Heel Raises',
    emoji: '🦶',
    durationSec: 60,
    gentle: true,
    focus: ['lymphatic', 'legs'],
    cues: [
      'Stand tall, hands on hips or a wall',
      'Rise slowly onto your toes',
      'Pause at the top, then lower with control',
    ],
    figure: 'heelRaise',
  },
  {
    id: 'march',
    name: 'March in Place',
    emoji: '🚶',
    durationSec: 60,
    gentle: true,
    focus: ['lymphatic', 'full'],
    cues: [
      'Lift knees to a comfortable height',
      'Swing opposite arm with each step',
      'Breathe steadily',
    ],
    figure: 'march',
  },
  {
    id: 'arm-circles',
    name: 'Arm Circles',
    emoji: '🔄',
    durationSec: 60,
    gentle: true,
    focus: ['shoulders', 'lymphatic'],
    cues: [
      'Arms out to the sides at shoulder height',
      'Make small circles, growing bigger',
      'Reverse direction halfway through',
    ],
    figure: 'armCircles',
  },
  {
    id: 'shoulder-rolls',
    name: 'Shoulder Rolls',
    emoji: '🤷',
    durationSec: 60,
    gentle: true,
    focus: ['shoulders', 'neck'],
    cues: [
      'Arms relaxed by your sides',
      'Roll shoulders up, back and down',
      'Slow and smooth — reverse halfway',
    ],
    figure: 'shoulderRolls',
  },
  {
    id: 'neck-tilt',
    name: 'Neck Side Tilt',
    emoji: '🙆',
    durationSec: 60,
    sides: true,
    gentle: true,
    focus: ['neck'],
    cues: [
      'Sit or stand tall, shoulders down',
      'Tilt ear toward shoulder',
      'Breathe and let the neck soften',
    ],
    figure: 'neckTilt',
  },
  {
    id: 'chest-opener',
    name: 'Chest Opener',
    emoji: '🫁',
    durationSec: 60,
    focus: ['shoulders', 'back'],
    cues: [
      'Clasp hands behind your back',
      'Draw shoulder blades together',
      'Lift chest and gently raise hands',
    ],
    figure: 'chestOpener',
  },
  {
    id: 'cat-cow',
    name: 'Cat–Cow',
    emoji: '🐈',
    durationSec: 60,
    focus: ['back'],
    cues: [
      'On hands and knees, wrists under shoulders',
      'Inhale: drop belly, lift chest (cow)',
      'Exhale: round spine, tuck chin (cat)',
    ],
    figure: 'catCow',
  },
  {
    id: 'childs-pose',
    name: "Child's Pose",
    emoji: '🧘',
    durationSec: 60,
    gentle: true,
    focus: ['back', 'hips'],
    cues: [
      'Kneel, big toes together, knees wide',
      'Sit hips back toward heels',
      'Reach arms forward, forehead down',
      'Breathe into your back',
    ],
    figure: 'childsPose',
  },
  {
    id: 'side-bend',
    name: 'Standing Side Bend',
    emoji: '🌙',
    durationSec: 60,
    sides: true,
    focus: ['back', 'full'],
    cues: [
      'Reach one arm overhead',
      'Lean to the opposite side',
      'Keep hips steady, breathe into the ribs',
    ],
    figure: 'sideBend',
  },
  {
    id: 'forward-fold',
    name: 'Forward Fold',
    emoji: '🙇',
    durationSec: 60,
    focus: ['back', 'legs'],
    cues: [
      'Feet hip-width, knees softly bent',
      'Hinge at the hips and hang forward',
      'Let head and arms dangle heavy',
    ],
    figure: 'forwardFold',
  },
  {
    id: 'hip-circles',
    name: 'Hip Circles',
    emoji: '⭕',
    durationSec: 60,
    gentle: true,
    focus: ['hips', 'back'],
    cues: [
      'Hands on hips, feet wider than hips',
      'Draw big slow circles with your hips',
      'Switch direction halfway',
    ],
    figure: 'hipCircles',
  },
  {
    id: 'quad-stretch',
    name: 'Standing Quad Stretch',
    emoji: '🦵',
    durationSec: 60,
    sides: true,
    focus: ['legs', 'hips'],
    cues: [
      'Hold a wall for balance if needed',
      'Bend one knee, hold ankle behind you',
      'Knees together, tuck tailbone slightly',
    ],
    figure: 'quadStretch',
  },
  {
    id: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    emoji: '🦿',
    durationSec: 60,
    sides: true,
    focus: ['legs'],
    cues: [
      'Step one heel forward, toes up',
      'Bend back knee and hinge forward',
      'Keep your back long',
    ],
    figure: 'hamstring',
  },
  {
    id: 'figure-four',
    name: 'Figure-4 Stretch',
    emoji: '4️⃣',
    durationSec: 60,
    sides: true,
    focus: ['hips', 'back'],
    cues: [
      'Lie or sit, cross ankle over opposite knee',
      'Draw legs gently toward you',
      'Feel the stretch in the outer hip',
    ],
    figure: 'figureFour',
  },
  {
    id: 'torso-twist',
    name: 'Torso Twist',
    emoji: '🌀',
    durationSec: 60,
    gentle: true,
    focus: ['back', 'lymphatic'],
    cues: [
      'Feet planted, arms loose',
      'Rotate side to side, letting arms swing',
      'Let the hips follow naturally',
    ],
    figure: 'torsoTwist',
  },
  {
    id: 'belly-breathing',
    name: 'Deep Belly Breathing',
    emoji: '🌬️',
    durationSec: 60,
    gentle: true,
    focus: ['lymphatic'],
    cues: [
      'Hand on belly, shoulders relaxed',
      'Inhale through the nose for 4',
      'Exhale slowly through the mouth for 6',
    ],
    figure: 'breathing',
  },
  {
    id: 'wrist-ankle-rolls',
    name: 'Wrist & Ankle Rolls',
    emoji: '🤲',
    durationSec: 60,
    gentle: true,
    focus: ['lymphatic', 'full'],
    cues: [
      'Lift one foot and circle the ankle',
      'Circle both wrists at the same time',
      'Swap feet halfway',
    ],
    figure: 'wristAnkle',
  },
  {
    id: 'calf-stretch',
    name: 'Calf Stretch',
    emoji: '🧱',
    durationSec: 60,
    sides: true,
    focus: ['legs'],
    cues: [
      'Hands on a wall, step one foot back',
      'Press back heel into the floor',
      'Lean forward until you feel the calf',
    ],
    figure: 'calfStretch',
  },
  {
    id: 'overhead-reach',
    name: 'Overhead Reach',
    emoji: '🙌',
    durationSec: 60,
    gentle: true,
    focus: ['full', 'shoulders'],
    cues: [
      'Interlace fingers, palms to the sky',
      'Reach tall through your fingertips',
      'Rise onto toes as you reach, then lower',
    ],
    figure: 'overheadReach',
  },
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
);
