import { addHistory, getHistory, toggleHeart } from '../lib/history';

/**
 * Dev-only: seed sample history for screenshots.
 * #demo → home, #demo-done → completion screen, #demo-history → history.
 */
export function seedDemoHistory() {
  if (getHistory().length) return;
  const s = (id: string, name: string, completed = true) => ({ id, name, completed });
  const a = addHistory({
    name: 'Desk Break',
    durationSec: 300,
    roundSec: 60,
    stretches: [
      s('shoulder-rolls', 'Shoulder Rolls'),
      s('neck-tilt', 'Neck Side Tilt'),
      s('chest-opener', 'Chest Opener'),
      s('torso-twist', 'Torso Twist'),
      s('wrist-ankle-rolls', 'Wrist & Ankle Rolls'),
    ],
  });
  toggleHeart(a.id);
  const b = addHistory({
    name: 'Random Quick Routine',
    durationSec: 162,
    roundSec: 45,
    stretches: [
      s('march', 'March in Place'),
      s('figure-four', 'Figure-4 Stretch', false),
      s('calf-stretch', 'Calf Stretch'),
      s('overhead-reach', 'Overhead Reach'),
    ],
  });
  toggleHeart(b.id);
  addHistory({
    name: 'Lymphatic Flow',
    durationSec: 150,
    roundSec: 30,
    stretches: [
      s('belly-breathing', 'Deep Belly Breathing'),
      s('lymphatic-hops', 'Lymphatic Hops'),
      s('arm-circles', 'Arm Circles'),
      s('heel-raises', 'Heel Raises'),
      s('torso-twist', 'Torso Twist'),
    ],
  });
}
