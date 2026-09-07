---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/spin"]
---

## Scope

The spin page — DopeRoulette's only surface for now, and the whole product: pull, verdict, and the controls that shape the pool. Visitor mode: **Experience**. The machine is the artifact; the interface recedes around it.

## Audience and job

Strangers on the public web, most often a group crowded around one screen on a games night, occasionally one person alone at 11pm. The job is ending the "what should we play?" stall with a verdict the room accepts.

## Confirmed constraints

- Fully static. No server, no accounts. Catalog ships in the repo as data and will later be written by nightly sync scripts.
- Reel items are typographic now, with a slot for artwork the sync scripts can fill later without a redesign.
- Filters exist as physical parts of the machine, not as a form.
- Credits are finite per session — the gambling metaphor gets real teeth.

## Content and proof

The catalog is placeholder until the sync scripts land and must read as visibly synthetic. The one number that is always true and always computed: the draw odds of the title that landed, derived from the live pool size. Rarity is never invented per game — it is the real probability of the pull.

## Memorable moment

The reel overshooting and settling one notch late, then the pool's true odds printing under a title set at across-the-room scale.

## Unresolved

Catalog size and entry shape; whether credits refill and on what clock; whether a landed game can be sent to anyone.

## Direction contract

THESIS: A case opening, not a slot machine: one horizontal reel tears past a fixed marker, decelerates, overshoots, settles a notch late. Refuses the centered reel-trio with a Spin button under it.

OWN-WORLD: Ordnance crate, not neon casino. Gunmetal ground, stencil bone ink, a painted four-stop odds ramp, signal orange for the verdict. Archivo width axis, Saira Stencil One crate marks, Martian Mono figures. Beveled plates, serials, wear grades. No glow.

STORY: A loaded crate, finite keys. Controls narrow the pool; the odds visibly change. Spend a key, the reel runs, a title lands carrying its real draw odds.

FIRST VIEWPORT: Full-bleed crate lid. Reel band across the middle third under a fixed marker. Keys lower left, selector levers on the bottom rail, landed title filling the band.

FORM: The Case Opening, candidate 1 of my ordered list, chosen over assigned index 6. Seed key 0a75662b.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
