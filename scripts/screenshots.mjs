// Retake the README screenshots (light and dark) with headless Chrome.
// Run `npm run dev` first, then `npm run screenshots`.
// Uses the installed Chrome rather than a bundled browser, so the voice
// picker appears on Settings (it only shows when speech voices exist).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = new URL('../docs/screenshots/', import.meta.url).pathname;
const ORIGIN = 'http://localhost:7771';
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
// [file name, dev shortcut hash, ms to wait before capturing]
const SHOTS = [
  ['home', 'demo', 1500],
  ['player', 'play-work', 3500],
  ['rest', 'play-rest', 3500],
  ['done', 'demo-done', 1500],
  ['history', 'demo-history', 1500],
  ['settings', 'settings', 2500],
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}. Set CHROME_PATH to your Chrome binary.`);
  process.exit(1);
}
if (!(await fetch(ORIGIN).then((r) => r.ok, () => false))) {
  console.error(`Dev server isn't running on ${ORIGIN}. Start it with \`npm run dev\` first.`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), 'qs-shots-'));
const chrome = spawn(
  CHROME,
  ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--mute-audio', 'about:blank'],
  { stdio: 'ignore' },
);

try {
  let targets;
  for (let i = 0; i < 50 && !targets; i++) {
    await sleep(200);
    targets = await fetch(`http://127.0.0.1:${PORT}/json`).then((r) => r.json(), () => null);
  }
  if (!targets) throw new Error('Chrome did not start its DevTools endpoint');

  // Minimal DevTools protocol client over Node's built-in WebSocket.
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let nextId = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    pending.get(m.id)?.(m);
    pending.delete(m.id);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  // iPhone-sized viewport; set here because headless windows won't go this narrow.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  for (const scheme of ['light', 'dark']) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    for (const [name, hash, wait] of SHOTS) {
      await send('Page.navigate', { url: 'about:blank' });
      // #demo only seeds sample history when it's empty.
      await send('Storage.clearDataForOrigin', { origin: ORIGIN, storageTypes: 'all' });
      await send('Page.navigate', { url: `${ORIGIN}/#${hash}` });
      await sleep(wait);
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const file = `${name}${scheme === 'dark' ? '-dark' : ''}.png`;
      writeFileSync(join(OUT, file), Buffer.from(data, 'base64'));
      console.log(`docs/screenshots/${file}`);
    }
  }
  ws.close();
} finally {
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
