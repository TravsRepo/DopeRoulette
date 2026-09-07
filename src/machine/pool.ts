import type { Game, Genre } from './catalog';

/**
 * The machine's controls and the arithmetic behind the readout.
 *
 * Nothing here invents a property of a game. The only thing the verdict
 * claims about a title is how improbable the pull was, and that is computed
 * from the live pool: odds = 1 / pool size.
 */

export type PlayerSetting = 1 | 2 | 3 | 4 | 5;
export type GenreSetting = 'ANY' | Genre;
export type LengthSetting = 'ANY' | 'QUICK' | 'EVENING' | 'LONG';

export interface Settings {
  /** 5 means "5 or more at the table". */
  players: PlayerSetting;
  genre: GenreSetting;
  length: LengthSetting;
}

export const DEFAULT_SETTINGS: Settings = {
  players: 4,
  genre: 'ANY',
  length: 'ANY',
};

export const PLAYER_STOPS: PlayerSetting[] = [1, 2, 3, 4, 5];
const GENRE_ORDER: Genre[] = ['CO-OP', 'VERSUS', 'PARTY', 'SOLO', 'SANDBOX'];

/**
 * Only the genres the catalog can actually answer for. A stop that can never
 * seat a round is a lever that lies, so the dial is cut from the manifest.
 */
export function genreStopsFor(catalog: Game[]): GenreSetting[] {
  const present = new Set(catalog.map((game) => game.genre));
  return ['ANY', ...GENRE_ORDER.filter((genre) => present.has(genre))];
}
export const LENGTH_STOPS: LengthSetting[] = ['ANY', 'QUICK', 'EVENING', 'LONG'];

export const LENGTH_LABELS: Record<LengthSetting, string> = {
  ANY: 'ANY',
  QUICK: 'UNDER 30',
  EVENING: '30 TO 75',
  LONG: 'OVER 75',
};

export const PLAYER_LABELS: Record<PlayerSetting, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5+',
};

function fitsLength(game: Game, length: LengthSetting): boolean {
  if (length === 'ANY') return true;
  if (length === 'QUICK') return game.minutes <= 30;
  if (length === 'EVENING') return game.minutes > 30 && game.minutes <= 75;
  return game.minutes > 75;
}

function fitsPlayers(game: Game, players: PlayerSetting): boolean {
  // The 5 stop means "at least five of us", so it asks for headroom rather
  // than an exact seat count.
  if (players === 5) return game.maxPlayers >= 5;
  return game.minPlayers <= players && game.maxPlayers >= players;
}

export function poolFor(catalog: Game[], settings: Settings): Game[] {
  return catalog.filter(
    (game) =>
      fitsPlayers(game, settings.players) &&
      (settings.genre === 'ANY' || game.genre === settings.genre) &&
      fitsLength(game, settings.length),
  );
}

export interface Grade {
  key: 'common' | 'scarce' | 'rare' | 'exceptional';
  label: string;
}

/**
 * The grade is a reading of the odds, not a property of the game. Narrow the
 * pool and every pull out of it gets more common — which is the honest trade
 * the controls are making, made visible. The bands are cut to the size of the
 * catalog, so a wide-open pool still reads as the long shot it is.
 */
export function gradeFor(poolSize: number): Grade {
  if (poolSize >= 9) return { key: 'exceptional', label: 'EXCEPTIONAL' };
  if (poolSize >= 5) return { key: 'rare', label: 'RARE' };
  if (poolSize >= 2) return { key: 'scarce', label: 'SCARCE' };
  return { key: 'common', label: 'COMMON' };
}

/** Percent chance of any one title, to two decimals. */
export function oddsPercent(poolSize: number): string {
  if (poolSize <= 0) return '0.00';
  return ((1 / poolSize) * 100).toFixed(2);
}

export function describeSettings(settings: Settings): string {
  const parts = [`${PLAYER_LABELS[settings.players]} PLAYER${settings.players === 1 ? '' : 'S'}`];
  if (settings.genre !== 'ANY') parts.push(settings.genre);
  if (settings.length !== 'ANY') parts.push(`${LENGTH_LABELS[settings.length]} MIN`);
  return parts.join(' · ');
}
