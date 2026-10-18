export type Preset = {
  id: string;
  name: string;
  description: string;
  exerciseIds: string[];
};

export const PRESETS: Preset[] = [
  {
    id: 'morning',
    name: 'Morning Wake-up',
    description: 'Get the blood moving and loosen up',
    exerciseIds: ['belly-breathing', 'overhead-reach', 'lymphatic-hops', 'side-bend', 'forward-fold'],
  },
  {
    id: 'lymphatic',
    name: 'Lymphatic Flow',
    description: 'Gentle bouncing and movement to stimulate flow',
    exerciseIds: ['belly-breathing', 'lymphatic-hops', 'arm-circles', 'heel-raises', 'torso-twist'],
  },
  {
    id: 'desk',
    name: 'Desk Break',
    description: 'Undo the hunch: neck, shoulders and back',
    exerciseIds: ['shoulder-rolls', 'neck-tilt', 'chest-opener', 'torso-twist', 'wrist-ankle-rolls'],
  },
  {
    id: 'hips',
    name: 'Hips & Lower Back',
    description: 'Release tight hips and a stiff lower back',
    exerciseIds: ['hip-circles', 'cat-cow', 'figure-four', 'hamstring-stretch', 'childs-pose'],
  },
  {
    id: 'evening',
    name: 'Evening Wind-down',
    description: 'Slow stretches to relax before bed',
    exerciseIds: ['neck-tilt', 'cat-cow', 'forward-fold', 'childs-pose', 'belly-breathing'],
  },
];
