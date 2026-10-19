import { resolveVoice, speak } from '../../lib/audio';
import type { Settings as SettingsValues, TimerStyle } from '../../lib/storage';
import { useVoices } from '../../lib/useVoices';
import { THEMES, type Theme } from '../../theme/themes';
import { Icon } from '../elements/Icon';

const TIMER_OPTIONS: { id: TimerStyle; name: string }[] = [
  { id: 'ring', name: 'Ring' },
  { id: 'numbers', name: 'Numbers' },
];

const PREVIEW_LINE = 'Lymphatic hops. Bounce gently on the balls of your feet.';

type Props = {
  settings: SettingsValues;
  onSettings: (patch: Partial<SettingsValues>) => void;
  onBack: () => void;
};

export function Settings({ settings, onSettings, onBack }: Props) {
  const voices = useVoices();
  const autoName = voices.length ? resolveVoice()?.name : undefined;

  return (
    <main className="screen settings-screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="back" />
        </button>
      </div>
      <h1 className="page-title">Settings</h1>

      <h2 className="section-title">Appearance</h2>
      <div className="settings">
        <div className="setting-row theme-row">
          <span id="theme-label">Theme</span>
          <div className="theme-options" role="radiogroup" aria-labelledby="theme-label">
            {[{ id: 'system', name: 'Auto' }, ...THEMES].map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={settings.theme === t.id}
                className={settings.theme === t.id ? 'theme-opt active' : 'theme-opt'}
                onClick={() => onSettings({ theme: t.id })}
              >
                <span className="swatch" style={swatchStyle(t)} aria-hidden="true" />
                {t.name}
              </button>
            ))}
          </div>
          <p className="setting-help">Auto matches your device's light or dark mode.</p>
        </div>
        <div className="setting-row theme-row">
          <span id="timer-label">Timer</span>
          <div className="theme-options" role="radiogroup" aria-labelledby="timer-label">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={settings.timerStyle === t.id}
                className={settings.timerStyle === t.id ? 'theme-opt active' : 'theme-opt'}
                onClick={() => onSettings({ timerStyle: t.id })}
              >
                {t.id === 'ring' ? (
                  <svg className="timer-glyph" viewBox="0 0 20 20" aria-hidden="true">
                    <circle cx="10" cy="10" r="7.5" className="glyph-track" />
                    <path d="M10 2.5a7.5 7.5 0 1 1-7.5 7.5" className="glyph-arc" />
                  </svg>
                ) : (
                  <span className="timer-glyph numbers" aria-hidden="true">
                    42
                  </span>
                )}
                {t.name}
              </button>
            ))}
          </div>
          <p className="setting-help">
            Ring shows the seconds inside a progress ring you tap to pause. Numbers shows a large countdown over a
            progress line.
          </p>
        </div>
      </div>

      <h2 className="section-title">Sound</h2>
      <div className="settings">
        <label className="setting-row toggle">
          <span>Beeps</span>
          <input type="checkbox" checked={settings.sound} onChange={(e) => onSettings({ sound: e.target.checked })} />
        </label>
        <label className="setting-row toggle">
          <span>Voice cues</span>
          <input type="checkbox" checked={settings.voice} onChange={(e) => onSettings({ voice: e.target.checked })} />
        </label>
        {voices.length > 0 && (
          <div className="setting-row voice-row">
            <label htmlFor="voice-select">Voice</label>
            <select
              id="voice-select"
              className="voice-select"
              value={settings.voiceURI}
              onChange={(e) => {
                onSettings({ voiceURI: e.target.value });
                speak(PREVIEW_LINE, e.target.value);
              }}
            >
              <option value="">Automatic{autoName ? ` (${autoName})` : ''}</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} · {v.lang}
                </option>
              ))}
            </select>
            <button
              className="icon-btn"
              onClick={() => speak(PREVIEW_LINE, settings.voiceURI)}
              aria-label="Preview voice"
            >
              <Icon name="volume" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

/** Half-and-half swatch of a theme's background and accent; "Auto" shows the light and dark defaults. */
function swatchStyle(t: { id: string } & Partial<Theme>) {
  if (!t.colors) {
    const [light, dark] = THEMES;
    return { background: `linear-gradient(135deg, ${light.colors.bg} 50%, ${dark.colors.bg} 50%)` };
  }
  return { background: `linear-gradient(135deg, ${t.colors.bg} 50%, ${t.colors.accent} 50%)` };
}
