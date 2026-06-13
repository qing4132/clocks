# Ideas parked for later

Designs and structural decisions we've discussed but deliberately *haven't*
built yet. Unlike `archive/`, these were never prototyped — they're waiting
until the gallery grows enough to need them. Revisit when adding many more
clocks or rethinking how the gallery is presented.

## Frosted — 毛玻璃钟（built, then parked）

**Concept.** A counterweight to #026 Anxiety: instead of a sharp extra hand
spinning once per second, time becomes a few large color masses moving behind a
frosted-glass layer. The intended mood was soft, slow and anti-anxious. Later
iterations mapped the three blobs from largest to smallest as Sun / Earth /
Moon colors.

**What was tried.** Built as `src/clocks/frosted/FrostedClock.tsx` after #027.
Iterations included:

- three blurred color blobs for hour / minute / second under a round frosted
  face
- subtle orbit rings to explain the motion
- removing rings and border after they made the face feel diagrammatic
- shrinking the inner glass disc and allowing color to bleed past it
- removing hard circular and square clipping artifacts
- reintroducing a weak glass blur while keeping the effect inside #001's
  original circular footprint
- switching the palette to Sun / Earth / Moon: warm yellow, blue, silver white

**Why parked.** The core feeling is attractive, but the implementation kept
falling into visible clipping boundaries: first a round plate, then a square
canvas, then a safety circle. Once those boundaries were removed or softened,
the design also lost the clear "frosted glass clock" object. The time motion
remained hard to understand without adding guides, and the guides made it less
like fogged color and more like a diagram.

**If revisited.** Start from a material model instead of CSS layers: treat the
glass as a real object with a designed silhouette, or abandon the glass plate
and make the idea a full-bleed color-field clock. Keep the Sun / Earth / Moon
palette as a possible direction, but solve the boundary first.

## Pointer-tip tetrahedron — 指针尖端四面体（built, then parked）

**Concept.** Start from #001's real hand geometry, but hide the dial, hands and
numerals. Keep only four moving points:

- the center of the clock
- the hour-hand tip
- the minute-hand tip
- the second-hand tip

Connect the three hand tips into a triangle, then connect the center to all
three tips. The result is a tetrahedron-like wireframe whose projected shape is
entirely determined by the current time. A later pass tried soft face shading so
the four triangular faces read like a solid.

**What was tried.** Built as `pointer-tip-triangle` after #025. Iterations:
single triangle from the three hand tips → add center point and spokes → add
face shading → remove vertex dots → thin the edges.

**Why parked.** The premise is clean, but in the small 200-unit clock face the
solid/shaded version becomes a generic abstract polyhedron more than a readable
time encoding. The best surviving branch from this family is still #025's
open-triangle hand geometry.

**If revisited.** Keep it as a pure wireframe first; avoid vertex dots, heavy
edges and decorative shading until the time-reading relation is strong enough.

## Moire — 莫尔纹钟（built, then parked）

**Concept.** Three dense line gratings sit on the same round face. The hour,
minute and second each control one grating's angle; their interference produces
the visible time pattern. A later pass matched the grating stroke weights and
colours to #001's hands (hour black 5, minute black 3, second red 1.5) while
keeping different line spacing per layer.

**Why parked.** The mechanism is good, but at clock size the interference tends
to read as visual texture before it reads as time. It may need a more deliberate
readout layer or much clearer separation between the three gratings.

## Melting — 融化钟（built, then parked）

**Concept.** A #001-like dial is softened into a drooping, melting clock face:
the outline sags, the numeral layer is skewed/pressed, and the hands still use
the real wall-clock angles. The reference point was the famous surreal melting-
clock motif, but the implementation stayed as an original #001-derived face.

**Why parked.** It became more of a visual homage/material treatment than a new
encoding of time. If revived, the melting deformation should be tied more
directly to the time values rather than merely styling a conventional dial.

## Gravity Well — 重力井钟（built, then parked）

**Concept.** Turn hour, minute and second into three mass points that pull a
grid toward themselves. The first version used a square face and square grid;
the next explored a circular / polar grid with stronger distortion and smooth
second motion.

**Why parked.** The metaphor is legible, but the grid distortion reads more like
a physics demo than a clock in this gallery. If revived, it needs a cleaner way
to read H/M/S from the wells, not just stronger warping.

## Chemical — 化学式钟（built, then parked）

**Concept.** Encode time as chemistry-like tiles. Two versions were tried:

- H / M / S as three periodic-table-style cells carrying the current hour,
  minute and second, with a formula-like footer.
- A stricter mapping where each value selects the element with that atomic
  number (e.g. 26 → Fe, 33 → As), with 0 treated as a special empty element.

**Why parked.** The graphic language is clear, but it reads too much like a
labelled conversion table. It needs a stronger clock-native mechanism before it
deserves a slot in the gallery.

## Offset Layers — 错层钟（built, then parked）

**Concept.** Split #001 into three transparent printing plates: an hour layer,
a minute layer and a second layer. Each layer carries only its own ring and hand,
then the three plates are slightly misregistered. Time is read from the fact that
the layers no longer share one perfectly aligned dial.

**Implementation that was tried.** Built as `src/clocks/offset-layers/OffsetLayersClock.tsx`.
The component used `useWallClock(1000)` and rendered one faint shared face plus
three translated SVG groups:

```tsx
<circle cx="0" cy="0" r="96" fill="#fafaf7" stroke="#1a1a1a" strokeWidth="3" opacity="0.18" />

<Layer dx={-7} dy={-5} stroke="#1a1a1a" opacity={0.7}>
  <circle cx="0" cy="0" r="72" fill="none" strokeWidth="1" />
  <line x1="0" y1="8" x2="0" y2="-50" strokeWidth="5" strokeLinecap="round" transform={`rotate(${h * 30 + m * 0.5})`} />
</Layer>

<Layer dx={5} dy={2} stroke="#1a1a1a" opacity={0.55}>
  <circle cx="0" cy="0" r="82" fill="none" strokeWidth="1" />
  <line x1="0" y1="12" x2="0" y2="-74" strokeWidth="3" strokeLinecap="round" transform={`rotate(${m * 6 + s * 0.1})`} />
</Layer>

<Layer dx={1} dy={7} stroke="#c1121f" opacity={0.82}>
  <circle cx="0" cy="0" r="92" fill="none" strokeWidth="1" />
  <line x1="0" y1="16" x2="0" y2="-84" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${s * 6})`} />
</Layer>
```

**Why parked.** The offset-printing metaphor is readable, but the result still
feels close to #001 with a registration-error effect. If revived, it needs a
stronger rule for why the three plates drift apart, not just fixed offsets.

## Envelope — 包络线钟（built, then parked）

**Concept.** A minute is represented by 60 short line segments. Together they
form a changing envelope-like texture; the current second is the one red
segment. The first version encoded hour/minute only implicitly through the
overall rotation and internal modulation; a later pass added explicit readout
rings so it could actually be read as a clock.

**Implementation that was tried.** Built as `src/clocks/envelope/EnvelopeClock.tsx`.
The component used `useWallClock(1000)` and rendered:

- a #001-style cream round face with black rim
- 60 short segments, one per second
- one red segment for the current second
- an inner 60-dot minute ring, with the current minute enlarged
- an outer 12-dot hour ring, with the current hour enlarged
- faint helper lines from the center to the active hour/minute dots

The key geometry was:

```tsx
const hourTurn = h * 30 + m * 0.5;
const minuteTurn = m * 6;
const hourPoint = polar(hourTurn, 86);
const minutePoint = polar(minuteTurn, 72);

Array.from({ length: 60 }).map((_, i) => {
  const age = (s - i + 60) % 60;
  const opacity = i <= s ? 0.14 + (i / Math.max(1, s)) * 0.5 : 0.06;
  const angle = hourTurn + i * 6;
  const center = polar(angle, 38 + Math.sin((i + m) * 0.31) * 16);
  const dir = polar(angle + 90 + minuteTurn * 0.08, 10 + (age % 12) * 0.8);

  return (
    <line
      x1={Math.round((center.x - dir.x) * 1000) / 1000}
      y1={Math.round((center.y - dir.y) * 1000) / 1000}
      x2={Math.round((center.x + dir.x) * 1000) / 1000}
      y2={Math.round((center.y + dir.y) * 1000) / 1000}
      stroke={i === s ? "#c1121f" : "#1a1a1a"}
      strokeWidth={i === s ? 1.4 : 0.7}
      opacity={i === s ? 1 : opacity}
      strokeLinecap="round"
    />
  );
})
```

**Why parked.** Once the hour/minute rings were added, it became readable, but
the result felt like two different clocks layered together: an expressive
envelope texture plus conventional dot-ring readouts. The envelope itself still
does not carry enough readable structure on its own.

## Round-dial 30-hour clock (a pair for the digital #012)

**Concept.** A 30-hour clock built on the round 24-hour dial (#004: 24
divisions, the hour hand making one full revolution per day) instead of a
7-segment panel. Re-label the small-hours portion of the rim:

- midnight (top) is labelled **24**
- clockwise: 1 o'clock → **25**, 2 → **26**, … 5 → **29**
- **6 o'clock resets back to 6** — the day boundary is 06:00, exactly matching
  the digital #012 (so the number **30** never actually appears)

**Why it's readable.** On a 24-division dial, 1 a.m. and 1 p.m. sit at
*different* angles, so the relabelled 24–29 wedge is unambiguous. (Note: a
normal 12-division dial can't do this — 29 and 5 would land on the same
angle. Only the 24-division face works.)

**Why it doesn't duplicate #012.** Same rule, two complementary faces —
like an algebraic vs. a geometric proof of one theorem:

- **Digital #012** — the twist is the *broadcast-TV artifact*: 7-segment
  digits, the context of station idents and printed schedules.
- **Round version** — the twist is *spatial intuition*: the 24→29 arc sits
  at the top of the dial, so at any glance you can *see* that those hours are
  "borrowed," still filed under yesterday.

**Why we're holding off.** Building it sets a precedent for "one concept,
two media." Worth the exception for this pair, but only once the gallery's
presentation can clearly express a *paired / counterpoint* relationship —
otherwise it's just two similar-looking faces.

**If/when we build it — candidate ways to present the pair:**

1. Naming + adjacency: `30-Hour · Digital` / `30-Hour · Dial`, placed at
   adjacent numbers.
2. Model the relationship as data: add `pairedWith?: string` /
   `pairNote?: string` to `ClockEntry`; the detail page renders a clickable
   "↔ the other telling" link to the twin.
3. A short counterpoint blurb on the detail page ("30 hours, two ways").

## Related: the gallery's underlying philosophy (decide before going big)

The 30-hour pairing forces a fork in what the gallery is *about*:

- **Philosophy A — "museum of strange clocks":** the thesis is *how many
  media can re-tell time*. Medium diversity is the selling point; keep the
  digital trio (011 digital / 012 30-hour / 013 unix).
- **Philosophy B — "essay on spatial encodings":** the thesis is *how many
  geometric / spatial ways time can be encoded*. Digital read-outs are
  outliers; lean toward dropping the digital family and keeping only a
  round-dial 30-hour.

A radical option we discussed: build the round 30-hour, then delete
011/012/013 along with `digital/segments.tsx`. **Cost:** #013 (unix) — its
twist *is* unreadability ("machine truth vs. human illegibility"), the most
philosophical clock in the set; deleting it purely for medium purity would be
a mis-kill. #012's broadcast-artifact angle would also be lost.

Middle-ground option: delete only #011 (the one truly zero-twist digital
baseline), keep 012/013 (both carry a real twist).

**Decision: do nothing for now.** Settle this only when scale forces a
rethink of presentation / philosophy.

## Julian Day clock (a cousin of the Unix clock #013)

**Concept.** Show the *Julian Day* — a single continuous day-count used in
astronomy, numbered from noon on 1 Jan 4713 BC (proleptic Julian). Today is
≈ JD 2,461,192. The integer part ticks once per day; the fractional part
encodes the time *within* the day.

**The one twist that makes it not just "Unix #013 again":** Julian Day
starts at **noon**, and time-of-day lives in the **decimals**:

- `.0` = noon 12:00 · `.25` = 18:00 · `.5` = **midnight** · `.75` = 06:00

So the reveal is the inverted boundary: at midnight the readout is `…​.5`,
not `.0`; the number rolls over a *whole day* at lunch, not at midnight.

**Why hold off.** Structurally it's the same "one giant accreting number" as
the Unix clock (#013). To earn its place it must *not* be just another
scrolling integer — it has to dramatize the **noon-flip + decimal-as-time**
idea (e.g. a ring that sits at the half mark at midnight, integer digits
nearly frozen while the decimals stream). Build only when we specifically
want to tell that story; otherwise it reads as Unix-clock filler.

**Scale aside.** Could pair with #013 as a "two continuous counts" duo
(Unix: 1970, seconds, midnight epoch — Julian: 4713 BC, days, noon epoch).

## Folded World — 折针世界钟 (multi-timezone on a single dial)

**Concept.** A plain #001 round dial that reads *local* time as usual — but
its **hour hand is a polyline instead of a straight line**. The inner circle
is sliced into a few concentric rings, one per city (e.g. NYC / LON / TYO /
local, inner→outer). The folded hand leaves the center and bends on each ring
to that city's current hour-angle, the outermost fold landing back on the
local dial like a normal hour hand. One hand reads four cities at once; the
angle between adjacent folds *is* their time difference.

**Why it matters.** It's the proof that a round dial *can* juxtapose multiple
timezones (the thing I'd wrongly claimed only digital read-outs could do).
Minute + second hands stay conventional (local), so readability is preserved.

**Why parked.** Prototyped (three variants: faint 12h dials / 24h day-night
shading / minimal dot-constellation, then a single #001-based folded-hand
version) — all worked but didn't feel compelling enough to keep in the
gallery. The folded hand reads as visual noise more than revelation at small
sizes, and 4 concentric rings crowd the 200-unit face. Revisit if we ever
want a dedicated "world clock" piece — likely needs fewer rings (2–3), a
clearer fold/color treatment, or a larger canvas to earn its place.

## Sea — 海上钟 (the face is the sea; boats are hands)

**Concept.** The dial *is* an ocean. The twelve numerals float on the surface
like buoys, bobbing gently. The **second hand is a sweeping wave** — a
foam-crested front that circles the face once a minute. The **hour & minute
hands are two boats** (large = hour, small = minute) that also float, rocking,
nudged around by the passing wave; read the hour by which numeral a boat is
moored beside.

**Texture is the whole point.** This piece lives or dies on *material feel*,
not cleverness. Prototyped four finishes:

- **Daylight** — realistic sunlit sea: `feTurbulence` + `feDiffuseLighting`
  for embossed water glints/caustics; the wave front uses `feDisplacementMap`
  for a frothy broken edge; proper sloop silhouettes (curved hull, billowed
  mainsail + jib, mast) with mirrored water reflections.
- **Moonlight** — night sea, a high moon casting a shimmering *moonglade*
  (rectangles of reflected light streaming down the middle), silhouette boats.
- **Ink** — ukiyo-e woodblock: paper grain, layered drifting ink swells,
  Hokusai-style curling foam claws trailing the sweep, calligraphic boats.
- **Chart** — antique nautical chart: parchment + hatched sea, rhumb lines
  radiating from a hidden center compass, a dashed sounding-line second hand,
  fine line-drawn boats, italic numerals.

**Why parked.** All four rendered well and the brief was met (boats are
believable sloops, not cartoons; water has real texture). Held back only to
keep the gallery tight — it's a *mood/illustration* piece more than a new way
of *encoding* time (the underlying read is still a plain 12-hour dial). Best
revived as a flagship "atmosphere" clock, probably the **Daylight** or
**Moonlight** finish; the heavy SVG filters (turbulence/lighting/displacement)
are GPU-real-time fine at one instance but worth profiling on the gallery grid.

**Reusable bits if revived.** The `Sloop`/`InkBoat`/`ChartBoat` silhouette
components, the moonglade strip technique, the displacement-froth wave front,
and the fractal-noise water-emboss filter recipe.

## Reading time from the real night sky (the Horologium experiments)

**Concept.** Tell the time with an astronomically *correct* sky rather than a
painted starfield. Prototyped four variants off the #021 warp tunnel, all
built on real data:

- **Horologium** — the warp tunnel flown through the constellation Horologium
  ("the Pendulum Clock," named by Lacaille in the 1750s after Huygens'
  pendulum clock). Stylised star chain + a pendulum-swinging hour hand.
- **Diurnal Motion** — real J2000 RA/Dec of Horologium and bright southern
  neighbours, polar-projected about the **south celestial pole** and rotated
  rigidly at the true sidereal rate (~15°/hr), oriented from **Local Sidereal
  Time** (longitude estimated from the browser timezone) so it shows roughly
  the real sky right now.
- **Star Trails** — long-exposure concentric arcs about the pole; bright head =
  the star "now," arc = where it just was; Horologium's trails picked out in
  gold.
- **Culmination** — an alt-az dome for a latitude −31° observer: Horologium
  rises in the SE, culminates, and sets, vanishing below a real horizon.

**The hook (the irony).** Horologium is named for a *clock* but is a terrible
natural clock — too faint, oddly shaped, far from the pole, and (like any star
clock) it runs on sidereal time, drifting ~4 min/day vs. civil time. The whole
charm is the contradiction: *the clock constellation that can't tell time, made
to tell time by software.* A future flagship version could lean into that —
e.g. an explicit **civil-time ↔ sidereal-time** conversion ring on the dial.

**Why parked.** Rendered well and the astronomy is genuine, but it pulled the
"twelve / tunnel" family off-course into a starfield sub-theme; set aside to
return to the #019–#021 tunnel discussion. The real-sky math is worth keeping.

**Reusable bits if revived.** A `sky.ts` helper module: real Horologium +
southern-neighbour star tables (J2000), `mulberry32` seeded field stars given
as (ra, dec), `localSiderealDeg(now)` from wall-clock + timezone longitude,
`projectPolar` (south-pole polar projection) and `altAz` (horizon projection
for a given latitude), and a magnitude→dot-radius mapping.

## Spectrum — HSL colour time (built, then parked)

**Concept.** The whole face is one flat colour, mapped through HSL so it is
always vivid (unlike the literal `#HHMMSS` hex clock #021, which stays near
black because H/M/S are small numbers). Mapping that was prototyped:

- **Hue** = how far through the day (`dayFrac × 360°`) — one full loop round
  the colour wheel per 24 h: midnight red → morning yellow → midday green/cyan
  → evening blue → late-night violet → back to red.
- **Lightness** = the minute (≈42–58%, breathing dark→light across the hour).
- **Saturation** = the second (≈62–80%, a gentle pulse across the minute).

A monospace caption showed `H __° · S __% · L __%`.

**Why parked.** Rendered fine and the hue-is-a-circle ↔ day-is-a-circle idea is
clean, but the user judged it not good enough to keep. The literal hex clock
(#021 Color) was kept instead. Code lived at `src/clocks/spectrum/`.

**Reusable bits.** A self-contained `hslToRgb(h,s,l)` and a `readableInk(r,g,b)`
contrast picker (black/white by relative luminance) — handy for any future
colour-driven clock.

## Fireworks — 烟火钟 (built, then parked)

**Concept.** A night sky over a faint ground line. **Every second launches one
firework** that blooms and fades over ~3.2 s, so a few bursts always overlap —
the newest is brightest. The reading is *impressionistic*, not precise: a near-
empty sky means the minute just rolled over; a crowded, busy sky means you're
mid-minute. Accents mark the cadence: the **first burst of each minute is
bigger and red**, and the **top of each hour is one large gold shell**.

**Why parked.** Built and registered (was #027), driven by `useWallClock(100)`
with a PRNG (`rng(seed)`) seeded per launch (seed = `launchSec + h*3600 + m*60`)
so a given burst always looks identical frame-to-frame. The user judged it — and
the whole batch it shipped in (rings / ascii / balance / ink / crystal /
fireworks) — not good enough to keep. Known rough edges that would need fixing
if revived: **bursts cluster toward the upper-right** (spawn box was
`cx ∈ [-70,70]`, `cy ∈ [-60,10]`, not balanced about the face) and the **ground
line slightly overflows** the round frame at the ends.

**Why it's a weak "twist" anyway.** Like Sea, it's more *mood/animation* than a
new way of **encoding** time — you can't actually read the time off it, only
sense "early vs. late in the minute." If revived it needs a genuine readable
layer (e.g. burst count or position truly encoding minutes), not just
atmosphere.

**Reusable bits.** The seeded-per-event PRNG pattern (deterministic bursts that
stay stable across renders), the age-based fade (`age = secsSinceLaunch /
LIFETIME`, `fade = 1 - age`, `spread = radius · min(1, age·1.4)`), and the
radial-spoke burst drawing (N petals = lines + end dots, jittered angles).


