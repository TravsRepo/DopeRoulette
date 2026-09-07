import { CATALOG } from './catalog';
import { confineToPool, type Loadout } from './cylinder';
import {
  DEFAULT_SETTINGS,
  LENGTH_STOPS,
  PLAYER_STOPS,
  genreStopsFor,
  poolFor,
  type GenreSetting,
  type LengthSetting,
  type PlayerSetting,
  type Settings,
} from './pool';

/**
 * The gun as a link. A configuration is worth sharing — "here is the night I
 * loaded, spin it yourself" — so the levers and the opening loadout live in
 * the query string and nothing else does. What happens after the first spin is
 * the machine's business, not the URL's.
 *
 * Written by hand rather than through URLSearchParams so the separators stay
 * legible: `?p=4&gun=valorant:4,deadlock:2` survives being read aloud.
 */

const PLAYERS = 'p';
const KIND = 'k';
const LENGTH = 'l';
const GUN = 'gun';

export function encodeConfig(settings: Settings, loadout: Loadout): string {
  const parts = [`${PLAYERS}=${settings.players}`];
  if (settings.genre !== 'ANY') parts.push(`${KIND}=${encodeURIComponent(settings.genre)}`);
  if (settings.length !== 'ANY') parts.push(`${LENGTH}=${encodeURIComponent(settings.length)}`);

  // Always written, even empty: an absent `gun` means "roll me an opening",
  // while `gun=` means the user deliberately emptied every chamber.
  const shells = CATALOG.filter((game) => (loadout[game.id] ?? 0) > 0).map(
    (game) => `${game.id}:${loadout[game.id]}`,
  );
  parts.push(`${GUN}=${shells.join(',')}`);

  return `?${parts.join('&')}`;
}

export interface SharedConfig {
  settings: Settings;
  /** Null when the link carried no loadout at all, so the opening is rolled. */
  loadout: Loadout | null;
}

/** Anything unreadable falls back to a default rather than failing the load. */
export function decodeConfig(search: string): SharedConfig {
  const params = new URLSearchParams(search);
  const settings: Settings = { ...DEFAULT_SETTINGS };

  const players = Number.parseInt(params.get(PLAYERS) ?? '', 10);
  if ((PLAYER_STOPS as number[]).includes(players)) settings.players = players as PlayerSetting;

  const kind = params.get(KIND) as GenreSetting | null;
  if (kind !== null && genreStopsFor(CATALOG).includes(kind)) settings.genre = kind;

  const length = params.get(LENGTH) as LengthSetting | null;
  if (length !== null && LENGTH_STOPS.includes(length)) settings.length = length;

  const gun = params.get(GUN);
  if (gun === null) return { settings, loadout: null };

  const asked: Loadout = {};
  for (const entry of gun.split(',')) {
    if (entry === '') continue;
    const separator = entry.lastIndexOf(':');
    const id = separator === -1 ? entry : entry.slice(0, separator);
    const count = separator === -1 ? 1 : Number.parseInt(entry.slice(separator + 1), 10);
    if (id === '' || !Number.isFinite(count) || count <= 0) continue;
    asked[id] = (asked[id] ?? 0) + count;
  }

  return { settings, loadout: confineToPool(asked, poolFor(CATALOG, settings)) };
}
