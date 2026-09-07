# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Fully static, no web server, no backend runtime — the site must deploy as plain files to any static host. Confirmed by the user, along with the requirement that the UI be rich, highly interactive, and animated.

Framework choice was delegated: **Vite + TypeScript + React**, building to static output. Rationale: the catalog is a build-time JSON asset that a bundler can type-check and inline; React carries the catalog/filter/spin state without a server; and the static build satisfies the deploy constraint. The cylinder motion itself is bespoke (CSS transforms / Web Animations API), not a general animation framework. Since this was delegated rather than specified, it is revisable before the first build lands.

## Users

Strangers on the public web — no accounts, no prior context, no onboarding from a person who already knows the product.

The primary situation is a group gathered around **one screen** (a laptop on the coffee table, a TV, a shared screen), deciding what to play tonight. One person drives; everyone watches the spin. The same person alone, facing the same decision, is the secondary situation and uses the identical flow.

The job: end the "what should we play?" stall. Not by producing a recommendation to evaluate — by producing a verdict everyone accepts because the machine, not a person in the room, chose it.

## Product Purpose

DopeRoulette picks a video game to play, at random, through a spin of a loaded cylinder. The user spins; the cylinder runs; a round comes up under the hammer.

Success is that the group actually plays the game that came up. The spin has to feel consequential enough that the result carries authority — a plain "here's a random game" button fails this even though it computes the same answer.

## Positioning

The mechanic *is* the product. Randomness is trivial to compute; the gamble is what a neighboring "random game picker" cannot truthfully copy — the spin, the cylinder, the near-miss, the moment the result locks. DopeRoulette sells the theater of chance, and the theater is what makes the outcome binding instead of just advisory.

## Operating Context

- One screen, one spin, watched by everyone present. The result must be legible from across a room, not just to the person holding the mouse.
- Browser only. Desktop/TV-scale viewing and phone-in-hand use are both real.
- The moment is short and social. Repeat spins are expected — people will spin again, and the design has to have a stance on that.
- The catalog is maintained out-of-band by the site admin. Users never curate it; they arrive to a cylinder that is already loaded.

## Capabilities and Constraints

**Confirmed:**
- Fully static deployment. No server, no API of our own, no database, no accounts, no server-side persistence.
- The game catalog is **curated by the site admin** and ships in the repo as data.
- Catalog maintenance will later be automated: scripts that pull and sync a nightly game list into the repo. The catalog format should anticipate being machine-written, not hand-edited forever.
- Group play needs no networking — a single device serves the whole group.

**Open / undecided (do not invent answers):**
- Whether users can narrow the pool before spinning (by player count, genre, platform, playtime) or only pull from the full catalog.
- Whether a spin result can be rejected/re-rolled, and whether the product takes a position on re-rolling.
- What a catalog entry contains beyond a title — art, player count, platform, store links are all unresolved until the sync scripts define the source.
- Catalog size and scope (a tight curated set vs. thousands of titles) — this materially changes the cylinder design and is not yet decided.

## Brand Commitments

The name **DopeRoulette** and its revolver-roulette gambling premise. No logo, wordmark, palette, typography, or voice has been established or made binding.

## Evidence on Hand

None yet. The repository is empty apart from a Python `.gitignore` and this file. There is no catalog data, no artwork, no copy, no users, and no deployment.

Future work must not fabricate: game titles or metadata presented as a real catalog, box art or screenshots, player counts, review scores, store availability, testimonials, or usage numbers. Placeholder catalog data must be visibly placeholder until the sync scripts supply real entries.

## Product Principles

1. **The spin is the product.** Any change that makes the outcome arrive faster or more soberly, at the cost of the gamble, is a regression.
2. **The verdict must feel binding.** The design's job is to make the result land with enough authority that the group stops deliberating.
3. **Readable across the room.** Every state that matters to a group — spinning, landing, landed — reads at a distance and from a phone.
4. **Zero setup before the first spin.** A stranger with no account and no list of their own can spin within seconds of arriving.
5. **Static forever.** No feature may quietly require a server; the catalog is data in the repo, and the browser is the whole runtime.

## Accessibility & Inclusion

No standard was specified by the user; the following follows from the product rather than from a stated requirement and is recorded as an assumption to confirm.

A continuously spinning, high-motion centerpiece is the core interaction, so `prefers-reduced-motion` must have a real path — the result must be announced and readable without the animation carrying it. The outcome must never be conveyed by motion or color alone.
