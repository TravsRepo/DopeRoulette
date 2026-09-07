import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATALOG, MANIFEST_IS_PLACEHOLDER, type Game } from './machine/catalog';
import {
  DEFAULT_SETTINGS,
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
  loadCylinder,
  onTheBench,
  oddsFor,
  resolve,
  spin,
  type Chamber,
  type SpinOutcome,
} from './machine/cylinder';
import { useCylinder } from './machine/useCylinder';

const PULLS_STORAGE = 'dopechaser.pulls';

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
  const [pulls, setPulls] = useState(0);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(PULLS_STORAGE);
      if (stored !== null) {
        const parsed = Number.parseInt(stored, 10);
        if (Number.isFinite(parsed) && parsed >= 0) setPulls(parsed);
      }
    } catch {
      // Blocked storage: the tally still counts for this page view.
    }
  }, []);

  const count = useCallback(() => {
    setPulls((current) => {
      const next = current + 1;
      try {
        window.sessionStorage.setItem(PULLS_STORAGE, String(next));
      } catch {
        // Nothing to persist to.
      }
      return next;
    });
  }, []);

  return [pulls, count];
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
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [soundOn, setSoundOn] = useState(true);
  const [pulls, countPull] = useNightTally();

  const pool = useMemo(() => poolFor(CATALOG, settings), [settings]);
  const poolRef = useRef(pool);
  poolRef.current = pool;

  const [chambers, setChambers] = useState<Chamber[]>(() => loadCylinder(pool));
  const [outcome, setOutcome] = useState<SpinOutcome | null>(null);
  const [settled, setSettled] = useState<Game | null>(null);
  /** Spins since the rifle was last loaded. The levers lock after the first. */
  const [spinsThisLoad, setSpinsThisLoad] = useState(0);

  const reducedMotion = useReducedMotion();
  const cylinder = useCylinder(soundOn, reducedMotion);
  const spinRef = useRef<HTMLButtonElement>(null);

  const bench = useMemo(() => onTheBench(pool, chambers), [pool, chambers]);
  const odds = oddsFor(chambers);
  const grade = gradeFor(pool.length);
  const armed = spinsThisLoad > 0;
  const leversLocked = armed || cylinder.spinning || settled !== null;

  const reload = useCallback(
    (nextPool?: Game[]) => {
      cylinder.reset();
      setChambers(loadCylinder(nextPool ?? poolRef.current));
      setOutcome(null);
      setSettled(null);
      setSpinsThisLoad(0);
    },
    [cylinder],
  );

  // Before the first spin the rifle is not committed, so changing a lever
  // re-seats the opening rounds from the new pool rather than leaving titles
  // in the gun that the levers now exclude.
  const handleSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((current) => {
        const next = { ...current, ...patch };
        if (!armed && settled === null) reload(poolFor(CATALOG, next));
        return next;
      });
    },
    [armed, reload, settled],
  );

  const handleSpin = useCallback(() => {
    if (cylinder.spinning || settled !== null || pool.length === 0) return;
    const index = spin();
    countPull();
    setOutcome(null);
    setSpinsThisLoad((n) => n + 1);

    cylinder.run(index, () => {
      const result = resolve(chambers, index, bench);
      setOutcome(result);

      if (result.kind === 'seated') {
        setChambers((current) =>
          current.map((c, i) => (i === index ? { game: result.game, racked: false } : c)),
        );
      } else if (result.kind === 'forced') {
        setSettled(result.game);
      }
    });
  }, [bench, chambers, countPull, cylinder, pool.length, settled]);

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

  return (
    <div className="bench" style={{ ['--grade' as string]: `var(--grade-${grade.key})` }}>
      <header className="manifest">
        <div className="manifest-left">
          <h1 className="wordmark">
            Dope<span>Chaser</span>
          </h1>
        </div>

        <div className="manifest-right">
          <dl className="pool-readout">
            <dt className="stencil">On the bench</dt>
            <dd>
              {bench.length}
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
            {bench.slice(0, 40).map((game) => (
              <li key={game.id} className="round">
                <span className="round-serial">{SERIALS.get(game.id) ?? '000'}</span>
                <span className="round-title">{game.title}</span>
              </li>
            ))}
          </ol>
          {bench.length > 40 && <p className="panel-foot">+{bench.length - 40} more eligible</p>}
          {bench.length === 0 && pool.length > 0 && (
            <p className="panel-foot">Every eligible title is in the gun.</p>
          )}
        </section>

        <section className="gun">
          {pool.length === 0 ? (
            <div className="dry-message">
              <p className="headline stencil">No titles match these settings</p>
              <p className="recovery">
                Nothing seats {PLAYER_LABELS[settings.players]} for a{' '}
                {settings.genre === 'ANY' ? 'game' : settings.genre.toLowerCase()} of this length.
                Widen a lever below, then reload the rifle.
              </p>
            </div>
          ) : (
            <>
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

              {settled ? (
                <div className="verdict" role="status">
                  <span className="verdict-grade stencil">{grade.label}</span>
                  <h2 className="verdict-title">{settled.title}</h2>
                  <p className="verdict-odds">
                    Drawn at <b>1 in {pool.length}</b> · {oddsPercent(pool.length)}% ·{' '}
                    {describeSettings(settings)}
                  </p>
                </div>
              ) : decision ? (
                <div className="decision" role="status">
                  <span className="decision-chamber stencil">
                    Chamber {String(decision.index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="decision-title">{decision.game.title}</h2>
                  <p className="decision-note">
                    Rack it and it goes back red. Land on it again and it is the night.
                  </p>
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
          TONIGHT · <b>{pulls}</b> {pulls === 1 ? 'SPIN' : 'SPINS'}
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
            <p className="lever-lock stencil">Locked while the rifle is live</p>
          )}
        </div>

        <div className="actions">
          {settled ? (
            <>
              <p className="action-note">The night is settled. Go play it.</p>
              <button type="button" className="action-secondary stencil" onClick={() => reload()}>
                Reload dope rifle
              </button>
            </>
          ) : decision ? (
            <>
              <button type="button" className="action" onClick={handlePlay}>
                Play it
              </button>
              <button type="button" className="action-secondary stencil" onClick={handleRack}>
                Rack it
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="action"
                ref={spinRef}
                disabled={cylinder.spinning || pool.length === 0}
                onClick={handleSpin}
              >
                {cylinder.spinning ? 'Spinning…' : 'Spin the cylinder'}
              </button>
              <button
                type="button"
                className="action-secondary stencil"
                disabled={cylinder.spinning}
                onClick={() => reload()}
              >
                Reload dope rifle
              </button>
            </>
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
