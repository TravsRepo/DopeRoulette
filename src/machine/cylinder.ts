import type { Game } from './catalog';
import { randomIndex, sample } from './random';

/**
 * The cylinder. Ten chambers, loaded from a recipe rather than a fixed draw:
 * the loadout says how many shells of each title go in, so four of one game
 * and two of another is four chances against two.
 *
 * Empty chambers are live in their own way — a spin that finds one seats a
 * random title from the pool, exactly as if the shell had been added by hand,
 * so the gun only ever gets hotter.
 *
 * A round you have already refused is racked — it sits red in the chamber, and
 * landing on it a second time is the end of the argument. Racking is per
 * chamber, not per title: refusing one shell of a game leaves its other shells
 * loaded, which is the whole point of loading more than one.
 */

export const CHAMBER_COUNT = 10;
export const OPENING_ROUNDS = 3;

export interface Chamber {
  game: Game | null;
  /** Refused once. The next landing on it settles the night. */
  racked: boolean;
}

/** How many shells of each title the cylinder is loaded with, by game id. */
export type Loadout = Record<string, number>;

export type SpinOutcome =
  /** Empty chamber: a round was seated here and the turn is over. */
  | { kind: 'seated'; index: number; game: Game }
  /** Empty chamber, but no pool left to seat from. */
  | { kind: 'dry'; index: number }
  /** A loaded round: play it, or rack it and keep going. */
  | { kind: 'choice'; index: number; game: Game }
  /** A racked round, landed on twice. No choice left. */
  | { kind: 'forced'; index: number; game: Game };

export function emptyCylinder(): Chamber[] {
  return Array.from({ length: CHAMBER_COUNT }, () => ({ game: null, racked: false }));
}

export function shellsIn(loadout: Loadout): number {
  return Object.values(loadout).reduce((total, count) => total + count, 0);
}

/** One more shell of `id`, unless every chamber is already spoken for. */
export function addShell(loadout: Loadout, id: string): Loadout {
  if (shellsIn(loadout) >= CHAMBER_COUNT) return loadout;
  return { ...loadout, [id]: (loadout[id] ?? 0) + 1 };
}

/** One shell of `id` back out. A title at zero leaves the loadout entirely. */
export function removeShell(loadout: Loadout, id: string): Loadout {
  const count = loadout[id] ?? 0;
  if (count <= 0) return loadout;
  const next = { ...loadout, [id]: count - 1 };
  if (next[id] === 0) delete next[id];
  return next;
}

/**
 * The loadout a pool can actually honor: titles the levers now exclude are
 * dropped, junk counts are rounded down, and the total is cut to the number of
 * chambers. Everything arriving from a URL goes through here.
 */
export function confineToPool(loadout: Loadout, pool: Game[]): Loadout {
  const confined: Loadout = {};
  let used = 0;
  for (const game of pool) {
    const wanted = Math.floor(loadout[game.id] ?? 0);
    const take = Math.min(Math.max(0, wanted), CHAMBER_COUNT - used);
    if (take > 0) {
      confined[game.id] = take;
      used += take;
    }
  }
  return confined;
}

/** The opening draw when nothing was asked for: a few distinct titles, one shell each. */
export function randomLoadout(pool: Game[], rounds: number = OPENING_ROUNDS): Loadout {
  const loadout: Loadout = {};
  for (const game of sample(pool, Math.min(rounds, pool.length))) loadout[game.id] = 1;
  return loadout;
}

/** Seat the whole loadout in random chambers; the rest stay empty. */
export function loadCylinder(pool: Game[], loadout: Loadout): Chamber[] {
  const shells: Game[] = [];
  for (const game of pool) {
    const count = loadout[game.id] ?? 0;
    for (let i = 0; i < count && shells.length < CHAMBER_COUNT; i += 1) shells.push(game);
  }

  const chambers = emptyCylinder();
  const slots = sample(
    Array.from({ length: CHAMBER_COUNT }, (_, i) => i),
    shells.length,
  );
  shells.forEach((game, i) => {
    chambers[slots[i]] = { game, racked: false };
  });
  return chambers;
}

/** Drop one more shell of `game` into a random empty chamber. */
export function seatShell(chambers: Chamber[], game: Game): Chamber[] {
  const empty = chambers.flatMap((chamber, i) => (chamber.game === null ? [i] : []));
  if (empty.length === 0) return chambers;
  const slot = empty[randomIndex(empty.length)];
  return chambers.map((chamber, i) => (i === slot ? { game, racked: false } : chamber));
}

/** Pull the last-seated shell of `id` back out, emptying its chamber. */
export function unseatShell(chambers: Chamber[], id: string): Chamber[] {
  const held = chambers.flatMap((chamber, i) => (chamber.game?.id === id ? [i] : []));
  if (held.length === 0) return chambers;
  const slot = held[held.length - 1];
  return chambers.map((chamber, i) => (i === slot ? { game: null, racked: false } : chamber));
}

export function spin(): number {
  return randomIndex(CHAMBER_COUNT);
}

/**
 * What landing on `index` means. An empty chamber draws from the whole pool —
 * duplicates included, since a title already in the gun is exactly as seatable
 * as one that is not.
 */
export function resolve(chambers: Chamber[], index: number, pool: Game[]): SpinOutcome {
  const chamber = chambers[index];

  if (chamber.game === null) {
    if (pool.length === 0) return { kind: 'dry', index };
    return { kind: 'seated', index, game: pool[randomIndex(pool.length)] };
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
