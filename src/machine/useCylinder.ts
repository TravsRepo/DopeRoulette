import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAMBER_COUNT } from './cylinder';
import { landing, tick } from './audio';

/**
 * The spin itself. The ring accelerates, runs long, and eases down onto the
 * chamber under the hammer — overshooting a touch and settling back, so the
 * stop reads as mechanical rather than as a number appearing.
 */

const STEP = 360 / CHAMBER_COUNT;
const SPIN_MS = 3600;
const TURNS = 5;
const SETTLE_SPLIT = 0.86;
const OVERSHOOT_DEG = 13;

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number): number => {
    let t = x;
    for (let i = 0; i < 6; i += 1) {
      const slope = slopeX(t);
      if (slope === 0) break;
      t -= (sampleX(t) - x) / slope;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}

const runEase = bezier(0.13, 0.58, 0.02, 1);
const settleEase = bezier(0.32, 0, 0.2, 1);

export interface CylinderSpin {
  spinning: boolean;
  ringRef: React.RefObject<HTMLDivElement>;
  /** Spins to `index`, then resolves. */
  run: (index: number, done: () => void) => void;
  /** Snaps the ring back to chamber zero without animating. */
  reset: () => void;
}

export function useCylinder(soundOn: boolean, reducedMotion: boolean): CylinderSpin {
  const [spinning, setSpinning] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    frameRef.current = null;
    timerRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const paint = (angle: number) => {
    const ring = ringRef.current;
    if (!ring) return;
    ring.style.transform = `rotate(${angle}deg)`;
    // Chamber marks stay upright while the cylinder turns under them.
    ring.style.setProperty('--ring-angle', `${-angle}deg`);
  };

  const reset = useCallback(() => {
    stop();
    setSpinning(false);
    angleRef.current = 0;
    paint(0);
  }, [stop]);

  const run = useCallback(
    (index: number, done: () => void) => {
      stop();
      setSpinning(true);

      const from = angleRef.current;
      // The chamber under the hammer is the one whose slot sits at twelve.
      const targetMod = (-index * STEP) % 360;
      const base = from - (((from - targetMod) % 360) + 360) % 360;
      const to = base - TURNS * 360;

      if (reducedMotion) {
        let step = 5;
        const advance = () => {
          const angle = to + step * STEP;
          angleRef.current = angle;
          paint(angle);
          if (soundRef.current) tick(0.5);
          if (step === 0) {
            setSpinning(false);
            if (soundRef.current) landing();
            done();
            return;
          }
          step -= 1;
          timerRef.current = window.setTimeout(advance, 150);
        };
        advance();
        return;
      }

      const overshoot = -OVERSHOOT_DEG;
      const travel = to + overshoot - from;
      const start = performance.now();
      let lastNotch = 0;
      let lastTickAt = 0;

      const frame = (now: number) => {
        const elapsed = Math.min(1, (now - start) / SPIN_MS);
        let angle: number;

        if (elapsed <= SETTLE_SPLIT) {
          angle = from + travel * runEase(elapsed / SETTLE_SPLIT);
        } else {
          const back = (elapsed - SETTLE_SPLIT) / (1 - SETTLE_SPLIT);
          angle = to + overshoot - overshoot * settleEase(back);
        }

        angleRef.current = angle;
        paint(angle);

        const notch = Math.floor(Math.abs(angle - from) / STEP);
        if (notch !== lastNotch) {
          lastNotch = notch;
          if (soundRef.current && now - lastTickAt > 28) {
            lastTickAt = now;
            tick(elapsed);
          }
        }

        if (elapsed < 1) {
          frameRef.current = requestAnimationFrame(frame);
          return;
        }

        frameRef.current = null;
        angleRef.current = to;
        setSpinning(false);
        if (soundRef.current) landing();
        done();
      };

      frameRef.current = requestAnimationFrame(frame);
    },
    [reducedMotion, stop],
  );

  return { spinning, ringRef, run, reset };
}
