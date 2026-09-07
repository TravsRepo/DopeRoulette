import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATALOG, MANIFEST_IS_PLACEHOLDER, type Game } from './machine/catalog';
import {
  LENGTH_LABELS,
  LENGTH_STOPS,
  PLAYER_LABELS,
  PLAYER_STOPS,
  describeSettings,
  genreStopsFor,
  gradeFor,
  oddsPercent,
  poolFor,
  type GenreSetting,
  type LengthSetting,
  type PlayerSetting,
  type Settings,
} from './machine/pool';
import {
  CHAMBER_COUNT,
  addShell,
  confineToPool,
  loadCylinder,
  oddsFor,
  randomLoadout,
  removeShell,
  resolve,
  seatShell,
  spin,
  unseatShell,
  type Chamber,
  type Loadout,
  type SpinOutcome,
} from './machine/cylinder';
import { decodeConfig, encodeConfig } from './machine/share';
import { useCylinder } from './machine/useCylinder';

const SPINS_STORAGE = 'doperoulette.spins';

/** Stable stock number per title, so a round always carries the same mark. */
const GENRE_STOPS = genreStopsFor(CATALOG);
const SERIALS = new Map(CATALOG.map((game, index) => [game.id, String(index + 1).padStart(3, '0')]));

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useNightTally(): [number, () => void] {
  const [spins, setSpins] = useState(0);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(SPINS_STORAGE);
      if (stored !== null) {
        const parsed = Number.parseInt(stored, 10);
        if (Number.isFinite(parsed) && parsed >= 0) setSpins(parsed);
      }
    } catch {
      // Blocked storage: the tally still counts for this page view.
    }
  }, []);

  const count = useCallback(() => {
    setSpins((current) => {
      const next = current + 1;
      try {
        window.sessionStorage.setItem(SPINS_STORAGE, String(next));
      } catch {
        // Nothing to persist to.
      }
      return next;
    });
  }, []);

  return [spins, count];
}

function SoundMark({ on }: { on: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M2 5h2.2L7 2.6v7.8L4.2 8H2z" strokeLinejoin="round" />
      {on ? (
        <path d="M9.2 4.4a3.1 3.1 0 0 1 0 4.2" strokeLinecap="round" />
      ) : (
        <path d="M9.3 4.7 11.9 8.3M11.9 4.7 9.3 8.3" strokeLinecap="round" />
      )}
    </svg>
  );
}

function Lever<T extends string | number>({
  label,
  stops,
  value,
  format,
  disabled,
  onChange,
}: {
  label: string;
  stops: T[];
  value: T;
  format: (stop: T) => string;
  disabled: boolean;
  onChange: (next: T) => void;
}) {
  return (
    <div className="lever">
      <span className="lever-label stencil" id={`lever-${label}`}>
        {label}
      </span>
      <div className="lever-track" role="radiogroup" aria-labelledby={`lever-${label}`}>
        {stops.map((stop) => (
          <button
            key={String(stop)}
            type="button"
            role="radio"
            className="detent"
            aria-checked={stop === value}
            disabled={disabled}
            onClick={() => onChange(stop)}
          >
            {format(stop)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // The link is the opening state: levers, loadout, and the chambers they
  // seat, all settled before the first render so nothing flashes a default.
  const [opening] = useState(() => {
    const shared = decodeConfig(window.location.search);
    const pool = poolFor(CATALOG, shared.settings);
    const loadout = shared.loadout ?? randomLoadout(pool);
    return { settings: shared.settings, loadout, chambers: loadCylinder(pool, loadout) };
  });

  const [settings, setSettings] = useState<Settings>(opening.settings);
  const [soundOn, setSoundOn] = useState(true);
  const [spins, countSpin] = useNightTally();

  const pool = useMemo(() => poolFor(CATALOG, settings), [settings]);
  const poolRef = useRef(pool);
  poolRef.current = pool;

  const [loadout, setLoadout] = useState<Loadout>(opening.loadout);
  const loadoutRef = useRef(loadout);
  loadoutRef.current = loadout;

  const [chambers, setChambers] = useState<Chamber[]>(opening.chambers);
  const [outcome, setOutcome] = useState<SpinOutcome | null>(null);
  const [settled, setSettled] = useState<Game | null>(null);
  /** Spins since the cylinder was last loaded. The levers lock after the first. */
  const [spinsThisLoad, setSpinsThisLoad] = useState(0);

  const reducedMotion = useReducedMotion();
  const cylinder = useCylinder(soundOn, reducedMotion);
  const spinRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const verdictRef = useRef<HTMLButtonElement>(null);

  const odds = oddsFor(chambers);
  const grade = gradeFor(pool.length);
  const armed = spinsThisLoad > 0;
  const leversLocked = armed || cylinder.spinning || settled !== null;
  const gunIsFull = odds.loaded >= CHAMBER_COUNT;

  // Reloading re-applies the recipe rather than drawing a new one: the loadout
  // is what the user (or their link) asked for, and it outlives a night.
  const reload = useCallback(
    (next?: { pool?: Game[]; loadout?: Loadout }) => {
      cylinder.reset();
      setChambers(loadCylinder(next?.pool ?? poolRef.current, next?.loadout ?? loadoutRef.current));
      setOutcome(null);
      setSettled(null);
      setSpinsThisLoad(0);
    },
    [cylinder],
  );

  // Before the first spin the cylinder is not committed, so changing a lever
  // re-seats it from the new pool rather than leaving titles in the gun that
  // the levers now exclude. Shells of a title that survives are kept.
  const handleSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      if (armed || settled !== null) return;

      const nextPool = poolFor(CATALOG, next);
      const nextLoadout = confineToPool(loadoutRef.current, nextPool);
      setLoadout(nextLoadout);
      reload({ pool: nextPool, loadout: nextLoadout });
    },
    [armed, reload, settings, settled],
  );

  // A shell goes straight into a free chamber rather than re-seating the whole
  // cylinder, so the gun fills up under the hand instead of reshuffling.
  //
  // Both halves update from the previous state rather than from a ref, because
  // a fast hand on the + key batches several clicks into one render and a ref
  // read would only count the last of them. They stop on the same condition:
  // before the first spin, shells in the loadout and filled chambers are the
  // same number, so `addShell` runs out of room exactly when `seatShell` does.
  const handleAddShell = useCallback(
    (game: Game) => {
      if (leversLocked) return;
      setLoadout((current) => addShell(current, game.id));
      setChambers((current) => seatShell(current, game));
    },
    [leversLocked],
  );

  const handleRemoveShell = useCallback(
    (game: Game) => {
      if (leversLocked) return;
      setLoadout((current) => removeShell(current, game.id));
      setChambers((current) => unseatShell(current, game.id));
    },
    [leversLocked],
  );

  const handleSpin = useCallback(() => {
    if (cylinder.spinning || settled !== null || pool.length === 0) return;
    const index = spin();
    countSpin();
    setOutcome(null);
    setSpinsThisLoad((n) => n + 1);

    cylinder.run(index, () => {
      const result = resolve(chambers, index, pool);
      setOutcome(result);

      if (result.kind === 'seated') {
        setChambers((current) =>
          current.map((c, i) => (i === index ? { game: result.game, racked: false } : c)),
        );
      } else if (result.kind === 'forced') {
        setSettled(result.game);
      }
    });
  }, [chambers, countSpin, cylinder, pool, settled]);

  const handlePlay = useCallback(() => {
    if (outcome && (outcome.kind === 'choice' || outcome.kind === 'forced')) {
      setSettled(outcome.game);
    }
  }, [outcome]);

  const handleRack = useCallback(() => {
    if (!outcome || outcome.kind !== 'choice') return;
    const { index } = outcome;
    setChambers((current) => current.map((c, i) => (i === index ? { ...c, racked: true } : c)));
    setOutcome(null);
    window.requestAnimationFrame(() => spinRef.current?.focus());
  }, [outcome]);

  const landedIndex = outcome?.index ?? null;
  const decision = outcome?.kind === 'choice' ? outcome : null;

  // A panel that opens over the cylinder takes the keyboard with it, so the
  // decision is never left sitting somewhere the eye is not. Racking hands
  // focus back to Spin, which is where the panel was.
  useEffect(() => {
    if (decision) playRef.current?.focus();
  }, [decision]);

  useEffect(() => {
    if (settled) verdictRef.current?.focus();
  }, [settled]);

  // The address bar always holds the opening configuration, so the page can be
  // bookmarked or handed to someone else. Levers and loadout are frozen once
  // the cylinder is live, so this settles before the first spin and stays put.
  useEffect(() => {
    const url = `${window.location.pathname}${encodeConfig(settings, loadout)}${window.location.hash}`;
    window.history.replaceState(null, '', url);
  }, [loadout, settings]);

  return (
    <div className="bench" style={{ ['--grade' as string]: `var(--grade-${grade.key})` }}>
      <header className="manifest">
        <div className="manifest-left">
          <h1 className="wordmark">
            Dope<span>Roulette</span>
          </h1>
        </div>

        <div className="manifest-right">
          <dl className="pool-readout">
            <dt className="stencil">On the bench</dt>
            <dd>
              {pool.length}
              <small>OF {CATALOG.length}</small>
            </dd>
          </dl>
          <button
            type="button"
            className="sound-toggle stencil"
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Sound on' : 'Sound off'}
            onClick={() => setSoundOn((on) => !on)}
          >
            <span className="sound-lamp" />
            <SoundMark on={soundOn} />
            <span className="sound-text">{soundOn ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>
        </div>

        {MANIFEST_IS_PLACEHOLDER && (
          <p className="manifest-note stencil">Placeholder manifest · not the curated catalog</p>
        )}
      </header>

      <div className="lid" aria-hidden="true">
        <span className="stencil">
          Lot 0001<span className="lid-batch"> · Night batch</span>
        </span>
        <span className="lid-seam" />
        <span className="stencil lid-full">One round decides · Keep out of daylight</span>
        <span className="stencil lid-compact">One round decides</span>
      </div>

      <main className="workspace">
        <section className="rounds" aria-labelledby="rounds-head">
          <h2 className="panel-head stencil" id="rounds-head">
            On the bench
          </h2>
          <ol className="rounds-list">
            {pool.slice(0, 40).map((game) => {
              const shells = loadout[game.id] ?? 0;
              return (
                <li key={game.id} className={shells > 0 ? 'round is-loaded' : 'round'}>
                  <span className="round-serial">{SERIALS.get(game.id) ?? '000'}</span>
                  <span className="round-title">{game.title}</span>
                  <span className="round-stepper">
                    <button
                      type="button"
                      className="shell-step"
                      aria-label={`Take a shell of ${game.title} out of the cylinder`}
                      disabled={leversLocked || shells === 0}
                      onClick={() => handleRemoveShell(game)}
                    >
                      −
                    </button>
                    <span className="round-count" aria-label={`${shells} loaded`}>
                      {shells}
                    </span>
                    <button
                      type="button"
                      className="shell-step"
                      aria-label={`Load a shell of ${game.title}`}
                      disabled={leversLocked || gunIsFull}
                      onClick={() => handleAddShell(game)}
                    >
                      +
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
          {pool.length > 40 && <p className="panel-foot">+{pool.length - 40} more eligible</p>}
          {leversLocked && settled === null ? (
            <p className="panel-foot">Locked while the cylinder is live</p>
          ) : (
            gunIsFull && <p className="panel-foot">Every chamber is spoken for.</p>
          )}
        </section>

        <section className="gun">
          {pool.length === 0 ? (
            <div className="dry-message">
              <p className="headline stencil">No titles match these settings</p>
              <p className="recovery">
                Nothing seats {PLAYER_LABELS[settings.players]} for a{' '}
                {settings.genre === 'ANY' ? 'game' : settings.genre.toLowerCase()} of this length.
                Widen a lever below, then load a fresh cylinder.
              </p>
            </div>
          ) : (
            <>
              <div className="stage">
                <div className="hammer" aria-hidden="true" />
                <div className={cylinder.spinning ? 'cylinder is-spinning' : 'cylinder'}>
                  <div className="cylinder-ring" ref={cylinder.ringRef}>
                    {chambers.map((chamber, i) => {
                      const state =
                        chamber.game === null ? 'empty' : chamber.racked ? 'racked' : 'loaded';
                      const landed = landedIndex === i && !cylinder.spinning;
                      return (
                        <div
                          key={i}
                          className={`socket is-${state}${landed ? ' is-landed' : ''}`}
                          style={{ ['--slot' as string]: String(i) }}
                        >
                          <span className="socket-mark">{String(i + 1).padStart(2, '0')}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="cylinder-core">
                    <p className="cylinder-status">
                      {cylinder.spinning
                        ? 'SPINNING'
                        : outcome?.kind === 'seated'
                          ? `CHAMBER ${String(outcome.index + 1).padStart(2, '0')} LOADED`
                          : outcome?.kind === 'dry'
                            ? `CHAMBER ${String(outcome.index + 1).padStart(2, '0')} DRY`
                            : `${odds.loaded} / ${CHAMBER_COUNT}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* The gun is worked from the gun: spin here, and the panel that
                  opens over the cylinder carries its own play / rack. Stowed
                  rather than unmounted so the cylinder never jumps. */}
              <div className={`stage-controls${decision || settled ? ' is-stowed' : ''}`}>
                <button
                  type="button"
                  className="action"
                  ref={spinRef}
                  disabled={cylinder.spinning || pool.length === 0}
                  onClick={handleSpin}
                >
                  {cylinder.spinning ? 'Spinning…' : 'Spin the cylinder'}
                </button>
              </div>

              {settled ? (
                <div className="verdict">
                  <span className="verdict-grade stencil">{grade.label}</span>
                  <h2 className="verdict-title">{settled.title}</h2>
                  <p className="verdict-odds">
                    Drawn at <b>1 in {pool.length}</b> · {oddsPercent(pool.length)}% ·{' '}
                    {describeSettings(settings)}
                  </p>
                  <div className="panel-actions">
                    <button
                      type="button"
                      className="action-secondary stencil"
                      ref={verdictRef}
                      onClick={() => reload()}
                    >
                      Load a fresh cylinder
                    </button>
                  </div>
                </div>
              ) : decision ? (
                <div className="decision">
                  <span className="decision-chamber stencil">
                    Chamber {String(decision.index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="decision-title">{decision.game.title}</h2>
                  <p className="decision-note">
                    Rack it and it goes back red. Land on it again and it is the night.
                  </p>
                  <div className="panel-actions">
                    <button type="button" className="action" ref={playRef} onClick={handlePlay}>
                      Play it
                    </button>
                    <button type="button" className="action-secondary stencil" onClick={handleRack}>
                      Rack it
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className="register" aria-labelledby="register-head">
          <h2 className="panel-head stencil" id="register-head">
            In the gun
          </h2>
          <ol className="register-list">
            {chambers.map((chamber, i) => {
              const state = chamber.game === null ? 'empty' : chamber.racked ? 'racked' : 'loaded';
              const landed = landedIndex === i && !cylinder.spinning;
              return (
                <li key={i} className={`register-row is-${state}${landed ? ' is-landed' : ''}`}>
                  <span className="register-no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="register-lamp" aria-hidden="true" />
                  <span className="register-title">{chamber.game ? chamber.game.title : '—'}</span>
                </li>
              );
            })}
          </ol>
          <dl className="register-odds">
            <div>
              <dt>Hit</dt>
              <dd>{odds.hit}%</dd>
            </div>
            <div>
              <dt>Settles it</dt>
              <dd className={odds.racked > 0 ? 'is-hot' : undefined}>{odds.settle}%</dd>
            </div>
          </dl>
        </section>
      </main>

      <div className="readout">
        <span className="odds-live">
          <span className="grade-chip" />
          {grade.label} POOL · EVERY TITLE A {oddsPercent(pool.length)}% SHOT
        </span>
        <span>{describeSettings(settings)}</span>
        <span className="tally">
          TONIGHT · <b>{spins}</b> {spins === 1 ? 'SPIN' : 'SPINS'}
        </span>
      </div>

      <div className="rail">
        <div className="levers">
          <Lever
            label="Players"
            stops={PLAYER_STOPS}
            value={settings.players}
            format={(stop) => PLAYER_LABELS[stop]}
            disabled={leversLocked}
            onChange={(players: PlayerSetting) => handleSettings({ players })}
          />
          <Lever
            label="Kind"
            stops={GENRE_STOPS}
            value={settings.genre}
            format={(stop) => stop}
            disabled={leversLocked}
            onChange={(genre: GenreSetting) => handleSettings({ genre })}
          />
          <Lever
            label="Length"
            stops={LENGTH_STOPS}
            value={settings.length}
            format={(stop) => LENGTH_LABELS[stop]}
            disabled={leversLocked}
            onChange={(length: LengthSetting) => handleSettings({ length })}
          />
          {leversLocked && settled === null && (
            <p className="lever-lock stencil">Locked while the cylinder is live</p>
          )}
        </div>

        {/* The rail sets the machine up; the gun is worked at the gun. The
            reload here steps aside once the verdict panel offers its own. */}
        <div className="actions">
          {settled ? (
            <p className="action-note">The night is settled. Go play it.</p>
          ) : (
            <button
              type="button"
              className="action-secondary stencil"
              disabled={cylinder.spinning}
              onClick={() => reload()}
            >
              Load a fresh cylinder
            </button>
          )}
        </div>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {settled
          ? `${settled.title} is the night.`
          : outcome?.kind === 'choice'
            ? `Chamber ${outcome.index + 1} holds ${outcome.game.title}. Play it or rack it.`
            : outcome?.kind === 'seated'
              ? `Chamber ${outcome.index + 1} was empty. ${outcome.game.title} loaded.`
              : ''}
      </p>
    </div>
  );
}
