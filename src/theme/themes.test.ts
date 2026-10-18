import { describe, expect, it } from 'vitest';
import { THEMES, resolveTheme } from './themes';

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe.each(THEMES)('theme $id', (t) => {
  const c = t.colors;
  it('uses 6-digit hex colours', () => {
    for (const v of Object.values(c)) expect(v).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it('has readable text (WCAG AA)', () => {
    expect(contrast(c.text, c.bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(c.muted, c.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.text, c.accentSoft)).toBeGreaterThanOrEqual(7);
    expect(contrast(c.muted, c.accentSoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.onAccent, c.accent)).toBeGreaterThanOrEqual(4.5);
  });
  it('has a visible accent and figure', () => {
    expect(contrast(c.accent, c.bg)).toBeGreaterThanOrEqual(3);
    expect(contrast(c.accent, c.accentSoft)).toBeGreaterThanOrEqual(3);
    expect(contrast(c.figure, c.bg)).toBeGreaterThanOrEqual(7);
  });
});

describe('resolveTheme', () => {
  it('follows the system for "system" and unknown ids', () => {
    expect(resolveTheme('system', false).id).toBe('paper');
    expect(resolveTheme('system', true).id).toBe('ink');
    expect(resolveTheme('nope', true).id).toBe('ink');
    expect(resolveTheme('paper', true).id).toBe('paper');
  });
});
