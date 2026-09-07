import type { Game } from './catalog';
import { randomIndex, sample } from './random';

/**
 * The cylinder. Ten chambers, three of them loaded to start, and a gun that
 * only ever gets hotter: every spin that finds an empty chamber loads it.
 *
 * A round you have already refused is racked — it sits red in the chamber, and
 * landing on it a second time is the end of the argument.
 */

export const CHAMBER_COUNT = 10;
export const OPENING_ROUNDS = 3;

export interface Chamber {
  game: Game | null;
  /** Refused once. The next landing on it settles the night. */
  racked: boolean;
}

export type SpinOutcome =
  /** Empty chamber: a round was seated here and the turn is over. */
  | { kind: 'seated'; index: number; game: Game }
  /** Empty chamber, but nothing left on the bench to seat. */
  | { kind: 'dry'; index: number }
  /** A loaded round: play it, or rack it and keep going. */
  | { kind: 'choice'; index: number; game: Game }
  /** A racked round, landed on twice. No choice left. */
  | { kind: 'forced'; index: number; game: Game };

export function emptyCylinder(): Chamber[] {
  return Array.from({ length: CHAMBER_COUNT }, () => ({ game: null, racked: false }));
}

/** Seat `rounds` distinct titles in random chambers; the rest stay empty. */
export function loadCylinder(pool: Game[], rounds: number = OPENING_ROUNDS): Chamber[] {
  const chambers = emptyCylinder();
  const games = sample(pool, Math.min(rounds, pool.length));
  const slots = sample(
    Array.from({ length: CHAMBER_COUNT }, (_, i) => i),
    games.length,
  );
  games.forEach((game, i) => {
    chambers[slots[i]] = { game, racked: false };
  });
  return chambers;
}

/** Titles eligible to be seated that are not already in the gun. */
export function onTheBench(pool: Game[], chambers: Chamber[]): Game[] {
  const chambered = new Set(chambers.map((c) => c.game?.id).filter(Boolean));
  return pool.filter((game) => !chambered.has(game.id));
}

export function spin(): number {
  return randomIndex(CHAMBER_COUNT);
}

/** What landing on `index` means, given the gun and what is left on the bench. */
export function resolve(chambers: Chamber[], index: number, bench: Game[]): SpinOutcome {
  const chamber = chambers[index];

  if (chamber.game === null) {
    if (bench.length === 0) return { kind: 'dry', index };
    return { kind: 'seated', index, game: bench[randomIndex(bench.length)] };
  }

  return chamber.racked
    ? { kind: 'forced', index, game: chamber.game }
    : { kind: 'choice', index, game: chamber.game };
}

export interface CylinderOdds {
  loaded: number;
  racked: number;
  /** Percent chance the next spin finds any round at all. */
  hit: string;
  /** Percent chance the next spin settles the night outright. */
  settle: string;
}

export function oddsFor(chambers: Chamber[]): CylinderOdds {
  const loaded = chambers.filter((c) => c.game !== null).length;
  const racked = chambers.filter((c) => c.racked).length;
  return {
    loaded,
    racked,
    hit: ((loaded / CHAMBER_COUNT) * 100).toFixed(0),
    settle: ((racked / CHAMBER_COUNT) * 100).toFixed(0),
  };
}
