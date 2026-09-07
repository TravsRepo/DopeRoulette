/**
 * The machine's own noises. Built from oscillators rather than shipped audio
 * files so the site stays a pile of static text, and only ever started from a
 * real user gesture (the pull).
 */

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** A detent passing the marker. Pitch drifts so a fast reel does not buzz. */
export function tick(intensity: number): void {
  const ac = context();
  if (!ac) return;

  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(1180 + Math.random() * 220, now);
  osc.frequency.exponentialRampToValueAtTime(560, now + 0.012);

  const level = 0.016 + 0.02 * Math.min(1, Math.max(0, intensity));
  gain.gain.setValueAtTime(level, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** The latch dropping when the reel finally sits still. */
export function landing(): void {
  const ac = context();
  if (!ac) return;

  const now = ac.currentTime;

  const thud = ac.createOscillator();
  const thudGain = ac.createGain();
  thud.type = 'triangle';
  thud.frequency.setValueAtTime(190, now);
  thud.frequency.exponentialRampToValueAtTime(52, now + 0.22);
  thudGain.gain.setValueAtTime(0.14, now);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  thud.connect(thudGain).connect(ac.destination);
  thud.start(now);
  thud.stop(now + 0.36);

  const snap = ac.createOscillator();
  const snapGain = ac.createGain();
  snap.type = 'square';
  snap.frequency.setValueAtTime(880, now);
  snap.frequency.exponentialRampToValueAtTime(300, now + 0.03);
  snapGain.gain.setValueAtTime(0.05, now);
  snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  snap.connect(snapGain).connect(ac.destination);
  snap.start(now);
  snap.stop(now + 0.08);
}
