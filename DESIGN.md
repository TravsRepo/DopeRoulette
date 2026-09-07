---
name: DopeRoulette
description: An ordnance crate that opens one title at a time — gunmetal steel, stencil bone ink, a painted odds ramp, and one orange signal.
colors:
  steel-900: "#0d1012"
  steel-850: "#121618"
  steel-800: "#171b1e"
  steel-750: "#1b2024"
  steel-700: "#1f2429"
  steel-600: "#282e34"
  steel-500: "#333b42"
  hairline: "#3d464d"
  hairline-soft: "#2b3237"
  ink: "#ece7d9"
  ink-dim: "#9aa2a4"
  ink-faint: "#808a8c"
  signal: "#f2560c"
  signal-deep: "#a83606"
  grade-common: "#62705f"
  grade-scarce: "#2f7191"
  grade-rare: "#bb8a2c"
  grade-exceptional: "#bf422b"
  loaded: "#3a76a8"
  chambered: "#c9342a"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2.4rem)"
    lineHeight: 0.9
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 122, 'wght' 900"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2rem, 5.4vw, 6rem)"
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 106, 'wght' 900"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.3rem, 2.1vw, 2rem)"
    lineHeight: 1.06
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 76, 'wght' 800"
  figure:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.07em"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Saira Stencil One, Archivo, sans-serif"
    fontSize: "12px"
    lineHeight: 1.2
    letterSpacing: "0.18em"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.5
    letterSpacing: "normal"
    fontVariation: "'wdth' 100, 'wght' 500"
rounded:
  none: "0px"
  lamp: "50%"
spacing:
  hair: "7px"
  tight: "10px"
  snug: "14px"
  base: "18px"
  step: "24px"
  wide: "32px"
  gutter: "64px"
components:
  pull:
    backgroundColor: "{colors.signal}"
    textColor: "#150803"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "20px 34px"
  pull-disabled:
    backgroundColor: "{colors.steel-600}"
    textColor: "{colors.ink-faint}"
  pull-secondary:
    backgroundColor: "{colors.steel-700}"
    textColor: "{colors.ink-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
  pull-secondary-hover:
    textColor: "{colors.ink}"
  detent:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dim}"
    typography: "{typography.figure}"
    rounded: "{rounded.none}"
    padding: "9px 13px"
  detent-selected:
    backgroundColor: "{colors.steel-600}"
    textColor: "{colors.ink}"
  lever-track:
    backgroundColor: "{colors.steel-850}"
    rounded: "{rounded.none}"
    padding: "3px"
  plate:
    backgroundColor: "{colors.steel-700}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "36px 18px"
    width: "264px"
  verdict-grade:
    backgroundColor: "{colors.grade-rare}"
    textColor: "{colors.steel-900}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  sound-toggle:
    backgroundColor: "{colors.steel-700}"
    textColor: "{colors.ink-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
---

# Design System: DopeRoulette

## Overview

**Creative North Star: "The Ordnance Crate"**

DopeRoulette is one continuous fabricated object, not a page with widgets on it. The screen is the lid, the seam, the reel band, the readout strip and the control rail of a single steel case, stacked full-bleed from the top edge to the bottom with nothing behind them. There is no background the machine floats on; every surface is a part of the crate, and the seams between parts are scored hairlines rather than gaps. Depth comes from milled bevels, inset shadows and painted markings, never from luminance.

The material is gunmetal — a seven-step near-neutral steel ramp so tight that the whole surface reads as one alloy under a single light, lit from above by a 4% white wash at the top and pooled into a 40% black at the bottom. Lettering is bone, not white: a warm off-cream that reads as paint applied to metal. The one saturated voice is a signal orange belonging to the machine itself, and beside it a four-stop painted odds ramp that is data, not decoration. Nothing glows; there is not one blur, bloom or colored halo in the build, and the single filter that ships is a horizontal motion blur applied to the reel while it is genuinely moving fast.

Density is industrial: 11–12px monospaced figures, 12px stencil panel marks, hard uppercase, and one very large uppercase headline that only exists after the reel lands. The composition is calm at rest and violent for exactly one event. The rejected reference is the neon casino — no gradient rainbow, no confetti, no glass, no rounded chrome pill.

**Key Characteristics:**
- Full-bleed, edge-to-edge, zero page margin: the machine has no background.
- Zero corner radius everywhere except a 7px round indicator lamp.
- A seven-step gunmetal ramp plus warm bone ink; saturation is rationed.
- One reserved signal orange; four semantic grade colors that are never decorative.
- Variable-width Archivo, monospaced figures, stencil panel marks with a hard size floor.
- Depth by bevel, inset shadow and hairline seam. No glow anywhere.

## Colors

A near-neutral gunmetal ramp carrying warm bone ink, interrupted by exactly two saturated systems: one reserved machine signal and one four-stop semantic odds ramp.

### Primary
- **Signal Orange** (`signal`): The machine's own voice. It appears on the marker blade and its two arrowheads, the primary Pull button face, the unspent key marks, the 14×2px underscore beneath the active detent, the focus ring, the sound-on lamp, the locked stamp border, the wordmark's second syllable, and the text selection background. Nothing else. It never encodes a value.
- **Signal Deep** (`signal-deep`): The shadowed underside of the same paint. Bottom stop of the Pull's face gradient and the 3px riser it sits on.

### Secondary — the grade ramp
Four painted stops read as a single instrument. They are selected by pool size in `gradeFor()` (≥41 exceptional, ≥21 rare, ≥9 scarce, else common) and assigned to a single `--grade` variable on the crate root.
- **Field Olive** (`grade-common`): pools under 9 titles.
- **Signal Blue** (`grade-scarce`): 9–20 titles.
- **Brass** (`grade-rare`): 21–40 titles.
- **Flare Red** (`grade-exceptional`): 41+ titles.

### Secondary — the chamber pair
Two painted stops that are not part of the grade ramp and never borrow from it. They encode the state of a round in a chamber, and their only job is to be told apart at a glance across the cylinder and the register at once.
- **Chamber Blue** (`loaded`): A live round still in the chamber. The seated socket face and the register row's lamp.
- **Chambered Red** (`chambered`): A round you already refused. The racked socket face, the racked register lamp and title, and the hot odds figure.

### Neutral
- **Steel 900** (`steel-900`): The band well — the darkest surface, the recess the reel runs inside. Also the ink color printed on grade chips.
- **Steel 850** (`steel-850`): Recessed troughs: the lever track interior and the scrollbar channel.
- **Steel 800** (`steel-800`): The crate body, the page ground, the bottom stop of every plate and rail gradient.
- **Steel 750 / 700 / 600** (`steel-750`, `steel-700`, `steel-600`): The lit faces. 750→800 makes the control rail, 600→700→800 makes a plate, 700→800 makes the verdict panel. Steel 700 is the resting face of secondary controls; steel 600 is a pressed-in detent and a disabled Pull.
- **Steel 500** (`steel-500`): The top-lit edge of a plate, spent key marks, and hover border on secondary controls.
- **Hairline / Hairline Soft** (`hairline`, `hairline-soft`): The two seam weights. Soft for structural scores between machine parts; the lighter `hairline` for control outlines that must be found by eye.
- **Bone** (`ink`): All primary lettering. Warm off-cream, never pure white.
- **Bone Dim / Bone Faint** (`ink-dim`, `ink-faint`): Secondary figures and labels; faint for disabled detents and lid marks.

### Named Rules
**The Signal Reserve Rule.** Signal orange belongs to the machine, never to content. Marker, primary action, keys, active detent, focus ring, selection. If a new element wants orange to mean "good", "rare" or "won", it is asking for the grade ramp instead and the answer is no.

**The Grade Triad Rule.** A grade color is never rendered in one place alone. Whenever `--grade` changes it must appear simultaneously on the band's 7px top rail, the readout's 9×9px legend swatch, and the verdict chip — all three transitioning together over 320ms. A grade color used as a lone accent is decoration and is forbidden; used in the triad it is a readout.

**The Chamber Pair Rule.** A chamber's state is read from the chamber pair, never from the grade ramp. Loaded is Chamber Blue and racked is Chambered Red wherever both states can be on screen together — the cylinder's ten sockets and the register's ten rows. A pool-dependent color on a chamber is forbidden: it collides with Chambered Red at the exceptional stop and makes a live round look spent.

**The No Glow Rule.** No box-shadow with a colored spread, no text-shadow, no bloom, no backdrop-filter. Depth is milled, not lit. Every shadow in the system is black at 0.4–0.7 alpha or a ≤6% white inset hairline.

## Typography

**Display Font:** Archivo variable (with Helvetica Neue, Arial fallback) — width axis 62–125, weight 400–900
**Label Font:** Saira Stencil One (with Archivo fallback)
**Figure Font:** Martian Mono (with ui-monospace fallback)

**Character:** Archivo's width axis does the work a second family usually does: the wordmark runs extended (wdth 122) like a case stamped across a lid, the plate titles run condensed (wdth 76) to fit a 264px plate, and the landed headline sits between them (wdth 106). Saira Stencil One is used only where the crate would be physically stencilled, and Martian Mono carries every number so odds stay in tabular columns while they change.

### Hierarchy
- **Display** — the wordmark. Extended, heaviest, tight-tracked, uppercase, set at line-height 0.9 so it reads as one stamped block. Its second syllable is signal orange; this is the only place a word takes the signal color.
- **Headline** — the landed title inside the verdict. The single largest element in the system, uppercase, balanced wrap, present only in the landed state.
- **Title** — plate titles on the reel. Condensed hard so long titles hold two lines inside a fixed-width plate.
- **Figure** — every number, serial, odds string, duration and count. Monospaced, tabular, 11–12px, uppercase, letter-spaced 0.04–0.07em. The pool readout scales this role up to `clamp(1.4rem, 2.2vw, 2rem)` at weight 700 for the one number that must be read from across a room.
- **Label** — stencilled panel marks: lid text, lever names, the keys label, the grade chip, the secondary button, the sound toggle. Uppercase, 0.18em tracked; the lid widens to 16px / 0.26em because it is signage rather than a control label.
- **Body** — running prose (the empty-state recovery line, the pull note). Capped near 24–52ch. Prose is rare by design and is the only unspaced, mixed-case type in the system.

### Named Rules
**The Stencil Floor Rule.** Saira Stencil One is never set below 12px. Below that the bridges in the letterforms stop resolving and the face is indistinguishable from a plain sans — the whole reason to load it is gone. If a label must be smaller than 12px, use the monospaced Figure role instead of shrinking the stencil.

**The Width Axis Rule.** Reach for Archivo's `wdth` axis before reaching for a new family or a new size. Wide (106–122) for identity and verdict, normal (100) for prose, condensed (76) for anything fitting a fixed-width plate.

**The Tabular Figures Rule.** Every digit that can change under the user is Martian Mono with `font-variant-numeric: tabular-nums`. Odds, counts and serials must not reflow horizontally when they update.

## Layout

The crate is a full-height three-row grid (`auto / minmax(0,1fr) / auto`) filling `100dvh`: manifest header, band shell, control rail. The middle row owns the reel and flexes; the two ends are intrinsic. Horizontal padding is a single `--gutter` token shared by every full-width part, so the header, lid, readout and rail all align on one vertical margin — 64px on desktop, 32px below 1180px, 20px below 720px. There is no max-width container anywhere; the machine is always edge to edge.

The reel band is a fixed-height object, not a flexible one: it holds between 268px and 348px on desktop and 226px minimum on mobile. Above the ceiling the plates stop reading as a horizontal reel and start reading as columns. Plates are a fixed `--plate-w` (264px desktop, 168px below 720px) with a `--plate-gap` of 14px/10px, and the track is centered on the marker by a negative half-plate margin so the marker sits over a plate center at rest.

Vertical rhythm is a fine industrial scale — 7, 10, 14, 18, 24, 32 — used for gaps between machine parts; panel padding sits at 20–36px. Two breakpoints: **1180px** collapses the rail from a three-column layout (keys / levers / pull) to a single stacked column and tightens the gutter; **720px** shrinks the plate pitch, drops the sound toggle's word to just the lamp and speaker, swaps the lid's full legend for a compact one, swaps plate meta for a compact variant, hides the pool readout's label, and makes the Pull full width. Content is shortened at narrow widths, never wrapped into a cramped version of the wide layout.

Motion lives here too, because the reel run is the layout's one event. The reel travels for 4400ms on a two-phase curve: 84% of the run is a hard ramp-on and long decelerating tail (`cubic-bezier(0.11, 0.62, 0.02, 1)`) that carries 0.62 of a plate *past* the winner, then the remaining 16% settles back (`cubic-bezier(0.32, 0, 0.2, 1)`). Overshoot-and-settle is the signature; a reel that stops dead on target is wrong. While the track is moving fast it wears a horizontal-only Gaussian blur (stdDeviation `7 0`) as a streak. All non-reel state changes use `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) at 320–520ms, and hover/press feedback at 90–140ms. Under `prefers-reduced-motion` all animation and transition durations collapse to 0.01ms, the streak filter is removed, and the reel steps discretely through its last six plates at 150ms each, the way a segment display swaps rather than slides.

## Elevation & Depth

Hybrid, and strictly physical. Every surface is either a **lit face** (a top-to-bottom gradient from a lighter steel to `steel-800`, sometimes with a 1px `steel-500` top border acting as a milled edge), a **recess** (a flat dark fill with an inset black shadow), or a **seam** (a 1px `hairline-soft` score, or the lid's two-line scored lip: one dark line above, one 4.5% white line below). Nothing is lifted off a background because there is no background — drop shadows exist only to separate objects that are physically stacked inside the crate: plates over the band well, and the verdict panel over the plates.

### Shadow Vocabulary
- **Well** (`box-shadow: 0 18px 44px rgba(0,0,0,0.55) inset`): the reel band interior. Establishes that the reel runs below the surface.
- **Trough** (`box-shadow: 0 2px 6px rgba(0,0,0,0.5) inset`): shallow recesses — the lever track, the indicator lamp.
- **Plate lift** (`box-shadow: 0 10px 24px rgba(0,0,0,0.42)`): reel plates over the well.
- **Panel lift** (`box-shadow: 0 24px 60px rgba(0,0,0,0.7)`): the verdict, the one element allowed to sit above everything.
- **Bevel highlight** (`box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset` up to `0.4` on the Pull): the top edge catching light. Always ≤6% white on steel; only the orange Pull is allowed a stronger one.
- **Key travel** (`0 3px 0 var(--signal-deep)` on the Pull): the physical riser under the primary control. Grows to 4px on hover and collapses to `0 0 0` on `:active` as the button translates down 3px.

### Named Rules
**The Milled Depth Rule.** Depth is expressed by gradient direction, a 1px lit top edge and an inset shadow — in that order. A drop shadow is only permitted when one machine part physically overlaps another.

**The Collapsing Riser Rule.** A hard offset shadow is legal only when it is the same paint's deep tone directly under its own face and it collapses to zero on press with a matching downward translate. A hard offset that never moves is decoration, not a control, and is forbidden.

## Shapes

Zero radius. Every plate, panel, chip, button, detent, track, stamp and swatch is a hard rectangle; the only curve in the system is the 7px round sound lamp, which is round because indicator lamps are round. Borders are 1px hairlines on steel and are used to draw the outline of a control that would otherwise disappear into its own face; the corner stamp is the sole 2px border, and the sole rotation (−3°), because it is an inked stamp rather than a milled part.

Recurring geometry: horizontal bands running the full width of the viewport, stacked without gaps; a fixed-width plate repeated at constant pitch; and pointer triangles built from CSS borders (9px half-width, 13px deep) capping the marker at top and bottom. The band's grade rail is a 7px full-width painted stripe pinned to the band's top edge — it is a machine part, painted on the crate, and every other element in the band is offset by exactly that 7px so nothing sits under fresh paint.

### Named Rules
**The Corner Stamp Rule.** A state mark is struck across a panel's corner, not stacked above its heading. Marks of this kind are absolutely positioned, outlined rather than filled, tilted 2–3°, and must clear the heading's box at every width. The reading order inside a panel is fixed — data chip, then title — and state never inserts itself into it.

## Components

### Buttons
- **Shape:** Hard rectangle (0px radius), all variants.
- **Pull (primary):** A painted orange key: three-stop face gradient (`#ff6a22` → signal → signal-deep), near-black lettering (`#150803`), a light orange 1px border, extended heavy Archivo uppercase, generous 20px/34px padding. It carries the bevel highlight, the 3px riser and a deep ambient shadow.
- **Hover / Active:** Lifts 1px and the riser grows to 4px on hover; presses 3px down and the riser collapses to zero on active, over 90ms. Disabled goes to `steel-600` with faint bone lettering and loses the riser entirely.
- **Secondary (`pull-secondary`), Sound toggle:** Steel 700 face, 1px `hairline` outline, dim bone stencil lettering. Hover raises the text to full bone and the border to `steel-500` over 140ms. Never orange.

### Chips
- **Grade chip:** A solid rectangle filled with the live `--grade`, printing `steel-900` stencil lettering on top, 6px/12px padding. The readout's legend swatch is the same fill at 9×9px. Both transition color over 320ms with the band rail.
- **Corner stamp:** The locked state's "tonight's pick" mark. A 2px signal-orange outline with orange stencil lettering at 13px, rotated −3° and pinned absolutely to the verdict's top-right corner (26px/30px inset; 18px/18px and 12px type below 720px). It is struck across the panel, outside the reading order — never a line of text above the heading.

### Cards / Containers
- **Plate (reel card):** Fixed 264px width, hard corners, three-stop steel face gradient with a `steel-500` milled top edge and `hairline-soft` sides, plate lift shadow. A monospaced SKU serial pins to the top-left, a condensed uppercase title centers, monospaced meta pins to the bottom. When the reel lands, every plate drops to 13% opacity and 0.3 saturation so the verdict owns the band.
- **Verdict panel:** `clamp(320px, 48vw, 760px)` wide, centered on the marker, hairline sides only (no top or bottom border — it spans the full band height), panel lift shadow, and a 520ms `clip-path: inset(42% 0 42% 0)` open that reads as shutters snapping apart. Its head is invariant across both states: grade chip, then title, in that order, landed and locked alike. Locking adds the corner stamp and changes nothing else in the panel.

### Inputs / Fields — the lever
The only input pattern in the system. A stencilled label sits above a recessed `steel-850` track with a hairline border, a 3px inner pad and an inset trough shadow; inside it the detents sit flush as monospaced uppercase segments. Unselected detents are dim bone on transparent; hover fills to `steel-700` without changing the text color. The selected detent lifts to a `steel-600` face with a bevel highlight, full bone text, and a 14×2px signal-orange underscore pinned 4px above its bottom edge — the mechanical indicator that the lever is in that notch. Disabled detents drop to faint bone with no fill. Focus is the global 2px signal ring at 3px offset.

### Signature Component: the reel band
The band is the whole first viewport's middle third: a full-bleed dark well with hairline scores top and bottom, a 7px painted grade rail on its top edge, a fixed-width plate track running horizontally beneath it, and a 2px orange marker blade pinned dead center with a triangle capping each end. The marker never moves; the reel moves under it. The band has one job and three states — loaded (plates at rest, three parked left of the marker so the band never opens with a hole), running (track translating with the horizontal streak filter), and landed (plates dimmed to 13%, verdict panel snapped open over them). The empty-pool state replaces the plates with a centered stencil headline and a monospaced recovery line inside the same well.

## Do's and Don'ts

### Do:
- **Do** build every new surface as another part of the same crate: full-bleed, hard-cornered, aligned to the shared `--gutter`, separated by a scored hairline rather than a gap.
- **Do** reserve signal orange for the machine's own controls and indicators, and route any "how rare is this" meaning through the four-stop grade ramp.
- **Do** move all three grade surfaces together — band rail, legend swatch, verdict chip — over 320ms whenever the pool changes.
- **Do** set every changing number in Martian Mono with tabular figures.
- **Do** reach for Archivo's width axis before adding a family or a size step.
- **Do** keep Saira Stencil One at 12px or larger, always uppercase, always tracked at 0.16em or more.
- **Do** express depth with a face gradient, a 1px lit top edge and an inset shadow, in that order.
- **Do** shorten or swap content at 720px (compact lid legend, compact meta, lamp-only sound toggle) rather than shrinking the wide layout.
- **Do** give any signature motion a two-phase overshoot-and-settle shape, and give it a discrete stepped equivalent under `prefers-reduced-motion`.

### Don't:
- **Don't** introduce a corner radius. The only round object in the system is an indicator lamp.
- **Don't** add glow: no colored shadow spread, no text-shadow, no bloom, no backdrop-filter. The one filter that ships is the horizontal reel streak, and it only exists while the reel is genuinely fast.
- **Don't** use a grade color decoratively, in isolation, or on anything that is not a reading of the pool.
- **Don't** use signal orange to encode value, rarity, or success.
- **Don't** use pure white for text or borders; lettering is bone and highlights top out near 6% white.
- **Don't** put a hard offset shadow under anything that doesn't collapse on press.
- **Don't** let the reel band exceed 348px tall — past that the plates stop reading as a reel and start reading as columns.
- **Don't** center a content column on a background. There is no background; a card floating in a margin breaks the object.
- **Don't** add a decorative label above a heading. The verdict's grade chip is data and the tonight's-pick mark is a corner stamp; a text kicker above a title is not part of this system.
