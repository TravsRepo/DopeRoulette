/**
 * THE CATALOG.
 *
 * The ten titles the night actually chooses between. Two of them are not
 * games — "Random Friendslop" and "YouTube Doomscroll" are the honest names
 * for what the group ends up doing anyway, and the machine treats them as
 * seatable rounds like anything else.
 *
 * The player counts and session lengths are broad-strokes values for shaping
 * the pool, not verified specifications. Keep the shape stable: `art` is the
 * slot artwork lands in later, and nothing in the cylinder or the register
 * needs a redesign to make room for it.
 */

export type Genre = 'CO-OP' | 'VERSUS' | 'PARTY' | 'SOLO' | 'SANDBOX';

export interface Game {
  /** Stable key; the sync scripts own the namespace. */
  id: string;
  title: string;
  /** Inclusive player range the game supports at one sitting. */
  minPlayers: number;
  maxPlayers: number;
  /** Typical minutes for one session, used only to bucket the LENGTH lever. */
  minutes: number;
  genre: Genre;
  /** Reserved for the sync scripts. Nothing ships art yet. */
  art?: string;
}

export const MANIFEST_IS_PLACEHOLDER = false;

export const CATALOG: Game[] = [
  { id: 'counter-strike-2', title: 'Counter-Strike 2', minPlayers: 1, maxPlayers: 10, minutes: 40, genre: 'VERSUS' },
  { id: 'valorant', title: 'Valorant', minPlayers: 1, maxPlayers: 5, minutes: 35, genre: 'VERSUS' },
  { id: 'marvel-rivals', title: 'Marvel Rivals', minPlayers: 1, maxPlayers: 6, minutes: 25, genre: 'VERSUS' },
  { id: 'deadlock', title: 'Deadlock', minPlayers: 1, maxPlayers: 6, minutes: 40, genre: 'VERSUS' },
  { id: 'random-friendslop', title: 'Random Friendslop', minPlayers: 2, maxPlayers: 8, minutes: 45, genre: 'PARTY' },
  { id: 'youtube-doomscroll', title: 'YouTube Doomscroll', minPlayers: 1, maxPlayers: 1, minutes: 90, genre: 'SOLO' },
  { id: 'jackbox', title: 'Jackbox', minPlayers: 1, maxPlayers: 8, minutes: 30, genre: 'PARTY' },
  { id: 'wardogs', title: 'Wardogs', minPlayers: 1, maxPlayers: 4, minutes: 40, genre: 'CO-OP' },
  { id: 'call-of-duty', title: 'Call of Duty', minPlayers: 1, maxPlayers: 6, minutes: 30, genre: 'VERSUS' },
  { id: 'battlefield', title: 'Battlefield', minPlayers: 1, maxPlayers: 8, minutes: 40, genre: 'VERSUS' },
];
