import { useMemo, useState } from 'react';
import { Home } from './components/Home';
import { Preview } from './components/Preview';
import { Player } from './components/Player';
import { Done } from './components/Done';
import { History } from './components/History';
import { SettingsScreen } from './components/SettingsScreen';
import { FigureGallery } from './components/figures/FigureGallery';
import { PRESETS } from './data/presets';
import { buildRoutine, newSeed, type RoutineSource } from './lib/routine';
import { addHistory, getHistory, savedSource, useHistory } from './lib/history';
import { seedDemoHistory } from './dev/demo';
import { useSettings } from './lib/storage';
import { useTheme } from './theme/useTheme';

type Screen =
  | { name: 'home' }
  | { name: 'history' }
  | { name: 'settings' }
  | { name: 'preview' | 'player'; source: RoutineSource }
  | { name: 'done'; source: RoutineSource; entryId: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    if (import.meta.env.DEV) {
      // Dev shortcuts for screenshots (see src/dev/demo.ts).
      const hash = location.hash;
      if (hash === '#settings') return { name: 'settings' };
      if (hash === '#play' || hash === '#play-work') return { name: 'player', source: { kind: 'preset', preset: PRESETS[0] } };
      if (hash.startsWith('#demo')) {
        seedDemoHistory();
        const latest = getHistory()[0];
        if (hash === '#demo-done') return { name: 'done', source: savedSource(latest), entryId: latest.id };
        if (hash === '#demo-history') return { name: 'history' };
      }
    }
    return { name: 'home' };
  });
  const [settings, updateSettings] = useSettings();
  const theme = useTheme(settings.theme);
  const history = useHistory();
  const source = 'source' in screen ? screen.source : null;
  const routine = useMemo(
    () => source && buildRoutine(source, { roundSec: settings.roundSec, count: settings.count }),
    [source, settings.roundSec, settings.count],
  );

  if (import.meta.env.DEV && location.hash === '#gallery') return <FigureGallery />;

  const home = () => setScreen({ name: 'home' });
  const preview = (source: RoutineSource) => setScreen({ name: 'preview', source });
  const fresh = (s: RoutineSource): RoutineSource => (s.kind === 'random' ? { kind: 'random', seed: newSeed() } : s);

  if (screen.name === 'history') {
    return <History onBack={home} onReplay={(e) => preview(savedSource(e))} />;
  }
  if (screen.name === 'settings') {
    return <SettingsScreen settings={settings} onSettings={updateSettings} onBack={home} />;
  }

  const homeScreen = (
    <Home
      settings={settings}
      theme={theme}
      onSettings={updateSettings}
      onPick={preview}
      onReplay={(e) => preview(savedSource(e))}
      onHistory={() => setScreen({ name: 'history' })}
      onOpenSettings={() => setScreen({ name: 'settings' })}
    />
  );
  if (screen.name === 'home' || !routine) return homeScreen;

  switch (screen.name) {
    case 'preview':
      return (
        <Preview
          routine={routine}
          settings={settings}
          onSettings={updateSettings}
          locked={screen.source.kind === 'saved'}
          onShuffle={screen.source.kind === 'random' ? () => preview(fresh(screen.source)) : undefined}
          onBack={home}
          onStart={() => setScreen({ ...screen, name: 'player' })}
        />
      );
    case 'player':
      return (
        <Player
          routine={routine}
          settings={settings}
          initialStep={import.meta.env.DEV && location.hash === '#play-work' ? 3 : 0}
          onExit={home}
          onFinish={({ completed, activeSec }) => {
            const entry = addHistory({
              name: routine.name,
              durationSec: activeSec,
              roundSec: routine.exercises[0]?.durationSec ?? settings.roundSec,
              stretches: routine.exercises.map((e, i) => ({ id: e.id, name: e.name, completed: completed[i] })),
            });
            setScreen({ name: 'done', source: screen.source, entryId: entry.id });
          }}
        />
      );
    case 'done': {
      const entry = history.find((e) => e.id === screen.entryId);
      if (!entry) return homeScreen;
      return <Done entry={entry} onAgain={() => preview(fresh(screen.source))} onHome={home} />;
    }
  }
}
