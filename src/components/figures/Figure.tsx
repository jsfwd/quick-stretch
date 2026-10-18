import { useEffect, useMemo, useRef, useState } from 'react';
import { FIGURES } from './defs';
import { FLOOR, HEAD_R, poseAt, resolvePoses, solve, type Pose } from './skeleton';

type Props = {
  name: string;
  paused?: boolean;
  /** Flip horizontally (second side of a one-sided stretch). */
  mirror?: boolean;
  /** Render a single static keyframe (gallery / reduced motion). */
  frame?: number;
  className?: string;
};

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function Figure({ name, paused = false, mirror = false, frame, className }: Props) {
  const def = FIGURES[name] ?? FIGURES.overheadReach;
  const frames = useMemo(() => resolvePoses(def), [def]);
  const staticFrame = frame ?? (reducedMotion ? frames.length - 1 : undefined);

  const [t, setT] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    elapsed.current = 0;
    setT(0);
  }, [name]);

  useEffect(() => {
    if (paused || staticFrame !== undefined) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsed.current += Math.min(0.1, (now - last) / 1000);
      last = now;
      setT(elapsed.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, staticFrame]);

  const pose: Pose =
    staticFrame !== undefined ? frames[Math.min(staticFrame, frames.length - 1)].pose : poseAt(def, frames, t);
  const j = solve(pose, def.view);
  const line = (...pts: [number, number][]) => pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
  const far = def.view === 'side' ? 0.4 : 1;

  return (
    <svg viewBox="10 12 180 182" className={className} role="img" aria-hidden="true">
      <line x1="16" y1={FLOOR} x2="184" y2={FLOOR} className="fig-floor" />
      {def.wall && (
        <rect x={mirror ? 200 - def.wall - 8 : def.wall} y="40" width="8" height={FLOOR - 40} className="fig-wall" />
      )}
      <g
        transform={mirror ? 'translate(200 0) scale(-1 1)' : undefined}
        className="fig-body"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {pose.breath > 0 && <circle cx={j.belly[0]} cy={j.belly[1]} r={pose.breath} className="fig-breath" />}
        <g opacity={far}>
          <polyline points={line(j.hip, j.lKnee, j.lAnkle, j.lToe)} />
          <polyline points={line(j.shoulder, j.lElbow, j.lHand)} />
        </g>
        <path d={`M${line(j.hip)} Q${line(j.spineCtrl)} ${line(j.neck)}`} />
        <polyline points={line(j.neck, j.shoulder)} />
        <polyline points={line(j.hip, j.rKnee, j.rAnkle, j.rToe)} />
        <polyline points={line(j.shoulder, j.rElbow, j.rHand)} />
        <circle cx={j.head[0]} cy={j.head[1]} r={HEAD_R} className="fig-head" />
      </g>
    </svg>
  );
}
