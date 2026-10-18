import { PRESETS } from '../data/presets';
import { buildRoutine, formatTime, newSeed, totalDurationSec, type RoutineSource } from '../lib/routine';
import type { Settings } from '../lib/storage';
import { formatWhen, renameHistory, toggleHeart, useHistory, type HistoryEntry } from '../lib/history';
import { resolveVoice, speak } from '../lib/audio';
import { useVoices } from '../lib/useVoices';
import { DEFAULT_DARK, DEFAULT_LIGHT, THEMES, type Theme } from '../theme/themes';
import { EditableName } from './EditableName';
import { HeartButton } from './HeartButton';
import { Icon } from './Icon';
import { SessionControls } from './SessionControls';
import { RoutineCard } from './RoutineCard';

const PREVIEW_LINE = 'Lymphatic hops. Bounce gently on the balls of your feet.';

type Props = {
  settings: Settings;
  theme: Theme;
  onSettings: (patch: Partial<Settings>) => void;
  onPick: (source: RoutineSource) => void;
  onReplay: (entry: HistoryEntry) => void;
  onHistory: () => void;
};

export function Home({ settings, theme, onSettings, onPick, onReplay, onHistory }: Props) {
  const history = useHistory();
  const favorites = history.filter((e) => e.hearted);
  const last = history[0];
  const voices = useVoices();
  const autoName = voices.length ? resolveVoice()?.name : undefined;
  const opts = { roundSec: settings.roundSec, count: settings.count };
  // Every routine of N moves has the same length, so any source gives the total.
  const sessionSec = totalDurationSec(buildRoutine({ kind: 'random', seed: 1 }, opts));
  const isDark = theme.scheme === 'dark';

  return (
    <main className="screen home">
      <header className="home-header">
        <h1 className="brand">
          Quick
          <br />
          Stretch
        </h1>
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => onSettings({ theme: isDark ? DEFAULT_LIGHT : DEFAULT_DARK })}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name={isDark ? 'sun' : 'moon'} />
          </button>
          <button className="icon-btn" onClick={onHistory} aria-label="History">
            <Icon name="history" />
          </button>
        </div>
      </header>
      <p className="home-meta">
        {last
          ? `${history.length} session${history.length === 1 ? '' : 's'} · last ${formatWhen(last.completedAt).replace(/^(Today|Yesterday)/, (d) => d.toLowerCase())}`
          : 'Quick stretch breaks, one move at a time.'}
      </p>

      <SessionControls value={opts} onChange={onSettings} />

      <button className="cta" onClick={() => onPick({ kind: 'random', seed: newSeed() })}>
        <Icon name="shuffle" />
        <span className="cta-label">Random routine</span>
        <span className="cta-meta">{formatTime(sessionSec)}</span>
      </button>

      {favorites.length > 0 && (
        <details className="favorites">
          <summary>
            <Icon name="heart" filled className="accent-icon" />
            <span className="fav-title">Favorites</span>
            <span className="fav-count">{favorites.length}</span>
            <Icon name="chevron" size={18} className="chevron" />
          </summary>
          <ul className="fav-list">
            {favorites.map((e) => (
              <li key={e.id} className="fav-item">
                <div className="fav-text">
                  <EditableName value={e.name} onSave={(name) => renameHistory(e.id, name)} />
                  <span className="muted small">
                    {e.stretches.length} stretches · {e.roundSec}s · {formatWhen(e.completedAt)}
                  </span>
                </div>
                <button className="play-btn" onClick={() => onReplay(e)} aria-label={`Start ${e.name}`}>
                  <Icon name="play" filled size={16} />
                </button>
                <HeartButton hearted onToggle={() => toggleHeart(e.id)} />
              </li>
            ))}
          </ul>
        </details>
      )}

      <h2 className="section-title">Routines</h2>
      <ul className="routine-list">
        {PRESETS.map((p) => (
          <li key={p.id}>
            <RoutineCard preset={p} opts={opts} onPick={() => onPick({ kind: 'preset', preset: p })} />
          </li>
        ))}
      </ul>

      <h2 className="section-title">Settings</h2>
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
        </div>
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
