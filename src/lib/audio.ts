let ctx: AudioContext | null = null;

/**
 * iOS only allows audio + speech after a user gesture. Call this from the
 * "Start" tap handler so later beeps and voice cues work.
 */
export function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx && AC) ctx = new AC();
    if (ctx?.state === 'suspended') void ctx.resume();
    // Play a silent buffer to fully unlock on older iOS.
    if (ctx) {
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
    }
  } catch {
    /* audio unavailable */
  }
  try {
    if ('speechSynthesis' in window) {
      // iOS ignores empty strings, so use a silent space to unlock speech.
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.resume();
      speechSynthesis.speak(u);
    }
  } catch {
    /* speech unavailable */
  }
}

export function beep(freq = 880, durationMs = 120, volume = 0.25) {
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + durationMs / 1000 + 0.02);
}

// Apple ships novelty voices (Bubbles, Zarvox, …) that aren't useful for coaching.
const NOVELTY =
  /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph)\b/i;
const PREFERRED = ['samantha', 'karen', 'daniel', 'moira'];

/** English voices worth offering, sorted by name. Empty until the browser loads them. */
export function listVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  const seen = new Set<string>();
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith('en') && !NOVELTY.test(v.name))
    .filter((v) => !seen.has(v.voiceURI) && !!seen.add(v.voiceURI))
    .sort((a, b) => a.name.localeCompare(b.name) || a.lang.localeCompare(b.lang));
}

function autoVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const name of PREFERRED) {
    const v = voices.find((v) => v.name.toLowerCase().startsWith(name));
    if (v) return v;
  }
  return voices.find((v) => v.localService) ?? voices[0] ?? null;
}

/** The chosen voice if installed, otherwise the best automatic match. */
export function resolveVoice(voiceURI?: string): SpeechSynthesisVoice | null {
  const voices = listVoices();
  return voices.find((v) => v.voiceURI === voiceURI) ?? autoVoice(voices);
}

// Chrome can garbage-collect an in-flight utterance and go silent; keep a reference.
let current: SpeechSynthesisUtterance | null = null;
let pendingTimer = 0;
let cancelledAt = -Infinity;
/** Chrome and Safari silently drop an utterance queued right after cancel(). */
const AFTER_CANCEL_MS = 150;

function cancelSpeech() {
  window.clearTimeout(pendingTimer);
  speechSynthesis.cancel();
  cancelledAt = performance.now();
}

/**
 * Set once a chosen voice fails to play. Brave's fingerprinting protection
 * (Shields) can report voices that silently never speak, so after the first
 * failure we let the browser use its default voice for the rest of the visit.
 */
let useDefaultVoice = false;
/** How long to wait for a chosen voice to start before falling back. */
const VOICE_START_TIMEOUT_MS = 1500;

export function speak(text: string, voiceURI?: string) {
  if (!('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    const v = useDefaultVoice ? null : resolveVoice(voiceURI);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    }
    u.rate = 1.0;
    current = u;

    let started = false;
    let watchdog = 0;
    const fallBack = (reason: string) => {
      window.clearTimeout(watchdog);
      if (!v || useDefaultVoice || current !== u) return;
      if (import.meta.env.DEV) console.warn(`[speech] voice "${v.name}" failed (${reason}); using browser default`);
      useDefaultVoice = true;
      speak(text);
    };
    u.onstart = () => {
      started = true;
      window.clearTimeout(watchdog);
    };
    u.onerror = (e) => {
      if (import.meta.env.DEV) console.warn('[speech]', e.error, JSON.stringify(text));
      // 'canceled'/'interrupted' just mean a newer cue replaced this one.
      if (e.error !== 'canceled' && e.error !== 'interrupted') fallBack(e.error);
    };

    const start = () => {
      if (current !== u) return; // superseded by a newer cue
      speechSynthesis.resume(); // un-stick Chrome if it got left paused
      speechSynthesis.speak(u);
      if (v) watchdog = window.setTimeout(() => !started && fallBack('never started'), VOICE_START_TIMEOUT_MS);
    };

    if (speechSynthesis.speaking || speechSynthesis.pending) cancelSpeech();
    window.clearTimeout(pendingTimer);
    const sinceCancel = performance.now() - cancelledAt;
    // Speak immediately when possible: on iOS the first cue must run inside the tap.
    if (sinceCancel >= AFTER_CANCEL_MS) start();
    else pendingTimer = window.setTimeout(start, AFTER_CANCEL_MS - sinceCancel);
  } catch {
    /* ignore */
  }
}

export function stopSpeech() {
  if (!('speechSynthesis' in window)) return;
  current = null;
  cancelSpeech();
}
