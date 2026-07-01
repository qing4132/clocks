# Ideas parked for later

Designs and structural decisions we've discussed but deliberately *haven't*
built yet. Unlike `archive/`, these were never prototyped — they're waiting
until the gallery grows enough to need them. Revisit when adding many more
clocks or rethinking how the gallery is presented.

## Core principle — display time, don't use the clock for other ends

The gallery is **always about displaying the actual current time in a new
form**. A clock must not be borrowed as a vehicle to express some *other*
intention or topic (labour politics, doomsday warnings, illness, holidays,
anticipation, mortality-as-message, etc.). Pieces like #015 Sleep, #028 Now and
#026 Anxiety survive because they are attitudes toward **time itself** — refusing
it, the felt passage of it — not messages about unrelated subjects. New ideas
should be genuine alternate **representations** of the current time.

## Do not propose again

Directions the user has explicitly ruled out — don't resurface these:

- **Tide / 潮汐**
- **Sundial / 日晷**
- **Braille / 盲文钟** — an alternate notation swap, not a new way of *displaying*
  time.

## Design principle — alternate time systems

Modern readability is not always the first goal. For clocks like #020 Decimal
or #023 Shengxiao, the first goal is to let the viewer enter another way of
dividing the day. If a clock commits to a non-modern time system, its internal
hands and marks should usually follow that system instead of translating back
to ordinary HH:MM readability.

## Zulu — 祖鲁钟（built, then parked）

**Concept.** A #011-style digital clock that refuses local time and shows only
Zulu time / UTC+00: `HH:MM:SSZ`. The idea was to give UTC a more specific
aviation, military, maritime and weather-reporting context instead of making a
generic UTC+0 readout.

**What was tried.** Built as `src/clocks/zulu/ZuluClock.tsx` after #027. The
prototype reused the shared 7-segment digital family, switched to
`getUTCHours()` / `getUTCMinutes()` / `getUTCSeconds()`, and added small
`ZULU` and `UTC+00` labels around the panel.

**Why parked.** It was correct and useful in a narrow sense, but it did not add
enough beyond "UTC in #011's clothes". The Zulu label provided context, yet the
clock still behaved like a minor variant of the existing digital family.

**If revisited.** Give Zulu time a stronger operational frame: radio/aviation
logbook styling, a compact `2359Z` notation, or a paired local-vs-Zulu display
where the point is coordination rather than just another digital readout.

## Julian Day — 儒略日钟（built, then parked）

**Concept.** A #011-style digital clock for Julian Day, the astronomy convention
of counting continuous days from a noon epoch. It is a useful-format cousin of
#013 Unix: Unix counts seconds from 1970-01-01, while Julian Day counts days
from an ancient astronomical epoch.

**What was tried.** Built as `src/clocks/julian-day/JulianDayClock.tsx` after
#028. The prototype reused the shared 7-segment digital panel, computed
`JD = unixMs / 86400000 + 2440587.5`, and showed the 7-digit integer plus 5 red
fractional digits in one line. The 5 fractional digits give roughly 0.864-second
resolution, matching the once-per-second update cadence.

**Why parked.** The idea is correct and potentially useful, but the single-line
layout fights the digital family geometry: 12 digits must be squeezed into the
#011 panel, making the readout feel compressed, while splitting integer and
fraction makes it less Unix-like. It needs a stronger layout decision before it
earns a permanent slot.

**If revisited.** Decide whether this is primarily a Unix-like machine number
or an astronomy instrument. For the former, keep a single compact numeric line;
for the latter, let the integer day and fractional day have distinct visual
roles instead of forcing both into the #011 panel.

## Interruption — 打断钟（built, then parked）

**Concept.** A day is not a continuous ring but a set of fragments broken by
interruptions. Notifications, meetings or context switches cut the 24-hour ring
into pieces; the current fragment is red while past/future fragments fade.

**What was tried.** Built as `src/clocks/interruption/InterruptionClock.tsx`
after #028. The prototype used a fixed list of interruption cut points across
the day, rendered each continuous segment as a separated arc, and placed a red
dot at the current minute-of-day.

**Why parked.** The content is strong, but this first version still looked like
a segmented progress ring. It did not yet make interruptions feel like lived
breaks in attention; the cuts were arbitrary marks rather than meaningful
events.

**If revisited.** Tie interruptions to a visible event model: recurring pings,
meeting blocks, or externally supplied events. The point should be that
attention is shattered, not merely that a circle has gaps.

## Typewriter — 打字机钟（built, then parked）

**Concept.** Every second types one character. Each minute becomes a line on a
sheet of paper; previous lines remain as faint records, and the current second
is the red insertion point.

**What was tried.** Built as `src/clocks/typewriter/TypewriterClock.tsx` after
#028. The prototype generated deterministic pseudo-text per minute, rendered
the last seven lines on a paper rectangle, and advanced the red cursor one
character per second.

**Why parked.** The mechanism is legible, but the first version became a texture
of random characters rather than a strong clock. The typed content had no
semantic relation to the time, so the typewriter metaphor felt arbitrary.

**If revisited.** Type meaningful structured text: timestamps, log entries,
or a line that reveals one time unit at a time. The paper should accumulate a
real record, not just random glyphs.

## Yamanote — 山手线钟（built, then parked）

**Concept.** Use Tokyo's Yamanote Line as a clock mechanism: it is a real loop,
has a strong railway visual language, and has exactly 30 stations. The cleanest
time rule was one hour per loop, one station every two minutes, with seconds
moving the train between stations.

**What was tried.** Built as `src/clocks/yamanote/variants.tsx` after #028.
Three prototype directions were tried:

- `yamanote-loop`: a rounded-square line diagram with 30 station dots, a moving
  train, six major station labels, and center `HH:MM` plus current → next station.
- `yamanote-lcd`: a JR-style in-car LCD screen with `YAMANOTE LINE`, current
  time, current/next station, and a horizontal 30-station strip.
- `yamanote-sign`: a station-sign clock where the current station name is the
  main display and a lower progress line shows movement to the next station.

**Why parked.** The premise is strong, but the first three visual directions
did not yet land. The loop version risks becoming a generic green route diagram;
the LCD version becomes more interface than clock; the station-sign version has
great identity but weakens the 30-station loop mechanism.

**If revisited.** Keep the one-hour loop / two-minutes-per-station rule. Solve
the visual language first: either commit fully to a JR station-sign artifact, or
make a more original square-loop clock where the train movement, station count
and current time are inseparable.

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

## Refraction — 折射钟（built, then parked）

**Concept.** Start from #001's real hand angles, but instead of drawing each
hand as a single solid stroke, pass it through a small prism-like center shape.
Each hand splits into several offset coloured rays, so the time is still the
classic analog geometry, but seen through a refracting medium.

**What was tried.** Built as `src/clocks/refraction/RefractionClock.tsx` after
#027. The prototype kept the #001 face, ticks and numerals, then replaced each
hand with four coloured parallel/offset rays. A translucent diamond prism sat
at the center, with the hour/minute/second hands using increasing spreads.

**Why parked.** The mechanism was understandable, but visually it stayed too
close to "#001 with chromatic aberration". The prism became decoration rather
than a rule that deeply changes how the clock is read.

**If revisited.** Make refraction structurally necessary: rays should bend at
explicit entry/exit points, or the prism should occlude and remap the hands so
the viewer reads time from the refracted endpoints rather than from familiar
analog strokes.

## Field Lines — 磁场线钟（built, then parked）

**Concept.** Turn hour, minute and second into three moving magnetic poles. The
dial is filled with field lines that bend around those poles; the current time
is encoded by both the pole positions and the changing line field.

**What was tried.** Built as `src/clocks/field-lines/FieldLinesClock.tsx` after
#027. The prototype used 25 horizontal seed paths clipped to the round face;
each path was displaced by three moving pole points. Hour, minute and second
poles had different radii, strengths and twist values, and were marked by small
black/blue/red dots.

**Why parked.** It produced a readable physical texture, but the clock still
depended on the three visible pole markers. Without them it was a field-line
illustration; with them it became three dots plus background physics.

**If revisited.** Let the field lines themselves carry the readout: for example
make stable separatrices, null points or line intersections land on readable
rings. Avoid relying on three labelled-looking pole markers.

## Stitch — 针脚钟（built, then parked）

**Concept.** Time is sewn into the surface. A ring of 60 stitches carries the
seconds, an inner ring of holes carries minutes, and twelve larger knots carry
hours. The current second is the red stitch being pulled tight.

**What was tried.** Built as `src/clocks/stitch/StitchClock.tsx` after #027.
The prototype drew 60 curved stitch paths around a #001-like face; already sewn
seconds were darker, future stitches were faint, the active second was red, and
a red thread curved from the current minute hole toward the current stitch.

**Why parked.** The hand-made metaphor is promising, but this first version was
too decorative at clock size: many small repeated marks formed a texture before
they formed an immediately readable clock. The minute and hour rings also
started to feel like separate UI overlays rather than one sewing mechanism.

**If revisited.** Focus on one sewing action. The whole face could be a single
thread path that accumulates through the minute, with hour/minute/second all
encoded by tension, stitch position and thread slack instead of three separate
rings.

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

## Barcode — 条形码钟（built, then parked）

**Concept.** A one-dimensional cousin of #027 QR. Where QR is a 2-D machine
matrix, Barcode is a horizontal Code 128-C bar/space pattern encoding the
current `HHMMSS` as three digit pairs, with the checksum and stop character
appended so a phone camera can actually scan the display and read back the
time string. Below the bars a human-readable `HH MM SS` row echoes the value,
with a faint `CODE 128 C` footer identifying the format.

**What was tried.** Built as `src/clocks/barcode/BarcodeClock.tsx` after #031.
The prototype included the full 107-entry Code 128 pattern table (11 modules
per data character, 13 modules for the stop with terminator bar), computed the
mod-103 checksum, and rendered every bar as an SVG rect with `shapeRendering="crispEdges"`
inside the same cream/black frame the digital family uses.

**Why parked.** The mechanism was correct and genuinely scannable, but as a
gallery piece it was too close to #027 QR in spirit — both are "machine-perfect,
human-illegible" encodings of the time string, only one is 1-D and the other 2-D.
The barcode did not add a new *experience* of time; it added a second serving of
the same idea. In the same conversation Cuneiform was also parked as another
"same time, different notation" piece — the pair confirmed that swapping
notation alone is not enough of a twist.

**If revisited.** Make the 1-D nature do real work. Ideas: let the bar
positions themselves visibly slide as seconds tick (rather than the whole strip
redrawing atomically each second); or use a barcode format where the width of
one specific bar continuously encodes a sub-second value, so the *bars breathe*
rather than snap.

## Cuneiform — 楔形文字钟（built, then parked）

**Concept.** Base-60 sexagesimal digits for H : M : S in Babylonian cuneiform —
tens as Winkelhakens (corner wedges) on the left, ones as vertical wedges on
the right, following the standard "up to 3 per row, extra rows below" pyramid
layout. This is not "a different font for the numbers"; the 60-minute hour we
still use every day inherits directly from this notation, so the twist was to
make that lineage literal.

**What was tried.** Built as `src/clocks/cuneiform/CuneiformClock.tsx` after
#031. Three digit slots for H / M / S, drawn as SVG triangles; late-Seleucid-
era two-oblique-wedge zero placeholder for empty positions; seconds column
tinted red for consistency with the digital family; small `BASE 60` footer.

**Why parked.** The layout was correct and read clearly, but the piece landed
as a "notation swap" — same three numbers as the digital clock, dressed in
older typography. Without a second twist that made the sexagesimal *structure*
do something (e.g. a shared H+M+S wedge count that reveals a pattern only base-60
would produce), it stayed a font choice more than a new representation of time.
Parked alongside Barcode as evidence that pure notation swaps are not enough.

**If revisited.** Give base-60 formal necessity: use a single accumulating
sexagesimal readout (like the day expressed as one long Babylonian number) so
the base itself does visible work, or lean into the *material* of impressed
clay — cursor-like fresh impressions that dry as their second passes, older
wedges cracking into the tablet.

## Split-flap — 翻页板钟（built, then parked）

**Concept.** The Solari airport/train departure board as a clock: `HH:MM:SS`
in six mechanical flip cards, each digit's card doing an authentic two-phase
flip — the old digit's top half falling forward around its bottom hinge, then
the new digit's bottom half rising into place around its top hinge — every
time its value changes.

**What was tried.** Built as `src/clocks/split-flap/variants.tsx` after #031.
First a straight baseline, then three variants exploring different dimensions:

- **Baseline** — 6 dark cards for HH:MM:SS with light dots between pairs;
  each cell flips only when its digit changes.
- **13a Vestaboard 词组板** — a 12-column × 2-row *letter* board that spells
  the time in English words (row 1 hour, e.g. `   TWELVE   `; row 2 minute,
  e.g. ` TWENTY FOUR`). Each letter cell can only flap *forward* through
  the alphabet `A…Z ⎵`, so when the minute rolls over each changed cell
  bursts through several letters at ~95 ms per flap before landing.
- **13b Cascade 波纹** — the same 6-cell HH:MM:SS grid, but every second
  triggers a left-to-right *wave* of flips at ~55 ms stagger, including
  "phantom flips" on cells whose digit did not change. Every tick becomes a
  coordinated 6-card ripple.
- **13c Solo 独牌** — the whole face is reduced to a single 260×320 flap
  card showing the two-digit seconds; one enormous thunk per second, with a
  small `SECONDS` label below.

**Why parked.** The two-phase flap mechanism was solid and the Vesta variant
in particular was pleasing, but as a family the four prototypes were still
mostly *"a digital clock in flap clothing"*: the medium changed but the
representation of time did not. Vesta was the closest to earning its own slot
(the *word* form is a genuine reframe), but even it felt like the letter cells
were carrying more visual weight than the underlying idea. Parked while a
sharper twist is found.

**If revisited.** Push Vesta hardest: full sentences rather than two padded
rows, and let the letter flaps become the point (e.g. a slowly composing line
of prose whose current word *is* the time). For Cascade and Solo, either drop
them or fold their motion/scale ideas into Vesta as one unified piece rather
than three tiles.



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

## Milkmaid — 倒牛奶的女仆加钟（archived）

**Concept.** Use Vermeer's *The Milkmaid* as the base image and place an antique
wall clock on the blank wall. The current archived version uses real image
assets only: the true painting as a background, a Gemini-generated clock body
with no hands, and a separate Gemini-generated hand image rotated with CSS.

**Archived files.** Saved in `archive/milkmaid/`:

- `MilkmaidClock.tsx` — last React implementation, not registered in the gallery
- `milkmaid.jpg` — true Vermeer source image used as background
- `milkmaid-clock-face.png` — handless antique clock body
- `milkmaid-clock-hand.png` — separate pointer image
- `milkmaid-clock-cutout.png` — earlier cutout attempt, kept for comparison

**Why not displayed now.** The implementation finally used the right structural
approach — image assets for all static parts, CSS rotation only for moving hands
— but the composite still needs careful art direction before it deserves a slot:
clock scale/placement, hand pivot/length, cast shadow, and material matching all
need another focused pass. Do not revive the old SVG-drawn clock versions.

**If revisited.** Start from the archived image-layer implementation, not from
scratch. Use image processing / manual editing to improve the clock-body alpha,
make the shadow belong to the wall, and align the separate pointer image to the
exact dial center. The final React surface should stay simple: background image,
clock body image, and rotated hand image layers.

## Ulysses — 尤利西斯意识流钟 (built, then parked)

**Concept.** A typographic stream-of-consciousness clock mapping the 24 hours of the day to the 18 chapters of James Joyce's *Ulysses* set on June 16-17, 1904. Time is experienced as continuous prose flow and monologue.

## Sisyphus — 西西弗斯巨石钟 (built, then parked)

**Concept.** A geometric and physical translation of Albert Camus' absurdism. Time is an accumulation of gravity, struggle, and effort that is destined to reset.

## Zeno's Arrow — “飞矢不动”钟 (built, then parked)

**Concept.** Based on Zeno's Arrow paradox of time and motion: time is a sequence of discrete motionless slices; movement is merely human sensory illusion.

## Borges — 分岔小径钟 (The Garden of Forking Paths) (built, then parked)

**Concept.** Time as an infinite bifurcating tree of parallel histories, choices, and coordinate tracks.

## Gravity Well — 重力井钟 (built, then parked - updated)

**Concept.** Time is space-time curvature caused by mass.

## Turing Tape — 图灵纸带钟 (built, then parked)

**Concept.** Time as a universal infinite Turing Machine executing states, instructions, and migrations.

## Voronoi — 细胞划分子钟 (built, then parked)

**Concept.** Time dynamically dividing and partitioning space into fluid, elastic cell compartments.

## Fourier Epicycle — 傅里叶周转圆钟 (Harmonograph) (built, then parked)

**Concept.** All complex periodic waves and time cycles are superpositions of nested circles.

## Klein Bottle — 克莱因瓶钟 (built, then parked)

**Concept.** Time as a non-orientable topological surface with no boundary, where inside and outside are inseparable.

## Peano Curve — 皮亚诺填充线钟 (built, then parked)

**Concept.** An order 3 space-filling curve mapping a 1-dimensional line to fill a 2-dimensional grid, exploring the occupation of time space.

## Huffman Tree — 哈夫曼逻辑树钟 (built, then parked)

**Concept.** A minimalist, prefix-free binary tree representing optimal data compression of current time values.

## Bloom Filter — 细胞布隆概率钟 (built, then parked)

**Concept.** Illustrating the probabilistic member checks of current time hashes.

## Levenshtein Distance — 编辑距离变化钟 (built, then parked)

**Concept.** Time progression is not a simple wipe, but an edit mutation of characters.

## Circadian — 生物钟 (built, then parked)

**Concept.** A counterpoint to #015 Sleep: read time by the *body's* state, not
by numbers. The day is the human circadian rhythm — core body temperature /
alertness — with a pre-dawn trough (~04:30, when the body is at its lowest), a
late-afternoon alertness peak, and the well-known post-lunch dip (~14:30). The
form should be required by the content: not 12 ticks but one smooth
physiological curve. The reading is "where am I on the body's day" — rising,
peaking, dipping, or down in the small-hours trough — with colour following the
state (cool indigo when low, warm amber when most awake).

**What was tried.** Built four forms after #031 Typewriter:

- `circadian` — the dial's whole *silhouette* is the body: a closed 24-hour
  curve whose radius equals the state, pinching almost to the centre at ~04:30
  and swelling toward the evening peak. A "now" light rides the curve.
- `circadian-curve` — a literal energy chart: hours 0–24 on the x-axis, the
  curve plotted as a line, night bands shaded, a vertical "you are here" marker.
- `circadian-sun` — the state as a sun riding over a horizon; below the horizon
  in the small hours = the trough / sleep. A dashed full-day trajectory.
- `circadian-dial` — still a round 24-hour clock (midnight top, numbers every
  3h, a straight hand to now) but the rim wave is the body.

**Why parked.** The premise is strong and genuinely emotional (it tells you not
*what* time it is but *how you should feel*), and #015 Sleep proves this family
can earn a slot. But the abstract silhouette version was hard to read, and the
three legible versions (chart / sun / dial) each drifted toward feeling like an
*infographic* rather than a clock — the chart most of all. The user judged the
whole batch not yet good enough and parked it.

**If revisited.** Decide whether this is a clock or a diagram, and commit. The
most promising directions were `circadian-sun` (most intuitive, most emotional —
the "inner sun setting" reading lands without explanation) and `circadian-dial`
(keeps real clock legibility). Avoid the bare silhouette and the literal line
chart. The body model is reusable: `circadian = -cos(2π(t-4.5)/24)` plus a
Gaussian post-lunch dip `-0.42·exp(-(t-14.5)²/2·1.1²)`, normalised across the
day; cool→warm colour lerp `[70,84,120] → [233,164,64]` by normalised state.

## Time-zone ideas — 时区系列 (parked, brainstorm)

A batch of *simple, clear, interesting* time-zone concepts. The shared thesis:
a time zone is not data, it is **separation and simultaneity** — someone is
asleep while you work, somewhere it is already tomorrow, noon never stops.
Keep each one to a single legible idea; resist turning them into a world-clock
dashboard. (Note: do **not** revive tide or sundial framings for these.)

1. **两地钟 — Two Cities.** Two plain faces side by side, "here" and a loved
   one's city. The real subject is the **overlap window** when you are both
   awake; the rest of the day one face is dimmed (they're asleep). Read the
   relationship, not the hour.

2. **日界线钟 — Date Line.** One Earth dial split into *today* and *tomorrow*.
   At any instant part of the planet has already crossed midnight, so the
   "tomorrow" slice grows across the day and resets. The quiet shock: it is
   always already tomorrow somewhere.

3. **正午奔跑钟 — Following Noon.** The subsolar point: noon is always
   *somewhere*, racing west at ~1670 km/h. A single mark circles a world ring
   showing where it is exactly 12:00 right now. Noon never stops; it just moves.

4. **晨昏线钟 — Terminator / Meanwhile.** The day–night line sweeps the dial.
   You don't read "my time" but "right now someone is at dawn, someone at
   midnight." Against the illusion that time is yours alone.

5. **偏移钟 — Offset (+8).** The whole clock is just your distance from UTC,
   shown big: `+8`. No hands, no face — only how far you stand from the world's
   agreed zero. A companion to #029 Zulu seen from the other side.

6. **怪时区钟 — The Odd Zones.** Celebrate the fractional offsets the world
   actually uses: India +5:30, Nepal +5:45, Newfoundland −3:30, Chatham +12:45.
   A clock whose hand can only land on these quirky half/quarter marks —
   trivia made into a face.

7. **午夜行进钟 — Midnight March.** A ring of the world's zones; the one
   currently striking 00:00 lights up, and the light marches around the planet
   once per day. A new day is constantly being born somewhere. (New-Year's-Eve
   variant: the wave of celebrations crossing the globe.)

8. **世界条带钟 — World Strip.** A horizontal strip showing *every* zone's
   local hour at once: at this instant it reads 14, 13, 12 … wrapping through
   the whole planet. The entire world's clock in one glance.

9. **故乡钟 — Home Time.** Abroad, but the clock stays on your *home* zone — the
   heart lags behind the body. A bold home hand and a faint local hand; the gap
   between them is homesickness / jet lag made visible.

10. **会面之窗钟 — The Meeting Window.** For people split across three zones: the
    only band where everyone's waking hours overlap. A narrow shifting strip
    that is the single hour you can all be together — coordination as the
    subject, not the clock.

**Strongest first:** 1 Two Cities, 3 Following Noon, 9 Home Time — each carries
a real feeling (togetherness / restlessness / longing) and is naturally a clock,
not a dashboard. 5 Offset and 6 Odd Zones are the cleanest "interesting fact"
pieces. Avoid letting 8 World Strip and 10 Meeting Window become infographics.

## Doomsday Clock — 末日钟 (parked, history/philosophy)

**Concept.** The real Bulletin of the Atomic Scientists clock (since 1947): a
symbolic clock where **midnight = global catastrophe / the end of civilization**,
and the only thing it shows is *how close humanity stands to it*. Created by
Manhattan Project scientists; the dial (only the last minutes before midnight,
designed by Martyl Langsdorf) has since widened its scope from nuclear weapons to
climate change, biotech, AI and disinformation. It does **not** tell the time of
day.

**The key point — it is not computed.** There is no formula. Each January the
Bulletin's Science and Security Board (with sponsors including Nobel laureates)
**deliberates and votes** on whether to move the hand nearer or further from
midnight relative to last year. The number is a collective expert *warning*, not
a measurement. So in this gallery it must be a **hard-coded historical constant**,
not anything derived from `Date.now()` — its "time" is a human judgement, which
is exactly its philosophical weight: people pushed the hand here; no natural law
forced it.

**Hand history (the whole range in 78 years).** 1947: 7 min · 1953: 2 min
(H-bomb tests) · 1991: **17 min** (farthest ever, end of Cold War) · 2020: 100
seconds (first time in seconds) · 2023: 90 s · **2025-01: 89 seconds (closest
ever)**. It barely moves, and lately only the wrong way.

**Why it belongs here / the tension.** Every other clock in the gallery faithfully
tells the time; the Doomsday Clock's twist is that it **refuses to**. It sits
almost frozen against midnight. That near-stillness is either its power (in a room
of ticking clocks, the one that won't move) or its weakness (it doesn't read as a
clock). It is also heavy and static — it needs one living detail to not be a
poster.

**If built.** Show only the hard-coded setting (`secondsToMidnight = 89`,
2025-01, source: Bulletin of the Atomic Scientists; updated by hand). Keep the
dial cropped to the final minutes before 12. Give it its one motion: a second
hand making the last approach toward midnight at the 89-second mark, **forever
closing in and never quite arriving** — "we have stood at the brink the whole
time without crossing it" as its only movement. Mood: grave, restrained, a
counterweight to the playful pieces.

## CAPTCHA — 验证码钟 (parked, representation)

**Concept.** The exact inverse of #027 QR. The QR clock is *machine-readable,
human-illegible*; the CAPTCHA clock is *human-readable, machine-illegible*. Same
time, distorted two opposite ways — a clean conceptual pair. The face shows the
current `HH:MM(:SS)` rendered as a classic warped-text CAPTCHA: per-character
rotation / skew / baseline jitter / overlap, an overall wavy warp, plus speckle
noise and a few crossing strike-lines.

**Use a *real* CAPTCHA generator, not a hand-faked look.** In the spirit of
#017 Game of Life ("nothing here is fake"), render the time with an actual
text-CAPTCHA library (e.g. `svg-captcha`) fed the time string, rather than
drawing a captcha-ish picture by hand. Note: reCAPTCHA / hCaptcha (the *services*)
are unusable — they are interactive anti-bot challenges, need a server, and won't
display our text.

**Build notes.**
- Determinism is mandatory: the library uses `Math.random`, which would jitter
  every frame and break SSR hydration. Seed it — temporarily swap `Math.random`
  for a seeded `mulberry32(timeValue)` around the generate call, then restore.
  Same second → same image; each new second "refreshes" the captcha.
- Risk: `svg-captcha` is Node-oriented and may not bundle cleanly to the browser
  (fonts / Buffer). Fallback: replicate the same pipeline in-house — real font →
  paths via `opentype.js` + seeded random bézier noise lines + speckle. Still a
  genuine generator, just ours and controllable.
- Readability is the red line: tune the displacement/rotation to "hard but
  readable" — too strong and it loses its only selling point (a human *can* read
  it).

**Cadence options.** Reseed every second for the full captcha-refresh feel, or
keep the warp field fixed per minute and let only the digits change (calmer).


## π Finder — π 寻字钟 (parked, math representation)

**Concept.** A finder over the digits of π. Every second the clock locates,
inside a 1500-digit window of π, the first occurrence of `HH`, then the first
occurrence of `MM` *after* that match ends, then the first `SS` *after* that.
Three pairs are highlighted in distinct colours (hour / minute / second); the
surrounding digits stay as a faint grey wash filling the whole face. The
"current time" is a deterministic three-stage cursor walk through a famous
irrational.

**Key calibration — how many digits cover a whole day.** With strict 2-digit
non-overlapping matches every HH:MM:SS in a day can be located within
**1359 digits of π**; the worst triple is 00:50:43 (HH "00" at 307, MM "50"
at 683, SS "43" at 1357). Relaxing the rule so single-digit values are also
acceptable (so HH=9 accepts either "9" or "09") does *not* lower the bound:
the new worst triple becomes 18:15:43 — all three values ≥ 10, so the
single-digit shortcut can't help. **Same 1359 either way.**

**Coverage across other famous constants** (same rule, 2-digit sequential
search; minimum digits needed to host every HH:MM:SS):

|   digits | constant                                  |
| -------: | ----------------------------------------- |
|    **792** | Champernowne 0.12345678910… (constructive — concatenation of ℕ) |
|     1041 | √5                                        |
|     1057 | eᵉ                                        |
|     1093 | e                                         |
|     1110 | π²                                        |
|     1124 | √3                                        |
|     1146 | log₁₀ 2                                   |
|     1196 | π·e                                       |
|     1347 | ζ(3) Apéry                                |
|     1356 | G Catalan                                 |
|   **1359** | π                                         |
|     1432 | φ golden ratio                            |
|     1437 | ln 10                                     |
|     1505 | √2                                        |
|     1569 | ln 2                                      |
|     1973 | γ Euler–Mascheroni                        |
|   **2966** | Copeland–Erdős 0.235711… (worst — sparse 2-digit coverage from primes) |

**What was tried.** Lived as `src/app/clock-ideas-30/` (a 30-clock scratchpad
that has since been deleted) and its sub-page `pi-variants/`. The variant
exploration covered 12 directions: cols 25 / 30 / 35 / 40, font size 1.0–
1.8× of cell height (controlling overlap), grey level for the unhighlighted
background, plus four highlight styles (coloured background block, ink-only
bold, underline, ellipse). A second pass added three "animated grow"
variants where the matched pair scales from 1× to 1.7× / 2.4× / 3.2× via a
bouncy `cubic-bezier(0.34, 1.56, 0.64, 1)` `font-size` transition over
~0.55 s, with the underlying faint digits fading out underneath.

**Why parked.** The rule itself is a satisfying *invariant*, and the 1359-
digit coverage fact is genuinely beautiful (we even computed Champernowne =
792 as a natural lower bound). But at gallery-tile size (~260 px) the 1500-
digit wash is either too dense (and the matched patches read like coloured
stains on noise) or too small (you can no longer see the digits as digits,
only as a grey texture with three coloured cells). The animation variants
help a lot — the grow-on-match motion is hard to look away from — but it
still feels like the mechanism is stronger than the form it inhabits.

**If revisited.** Either (a) give it its own full-page surface instead of
a tile, so the 1500-digit ground can breathe; (b) drop to Champernowne
(~800 digits, ~half the area) and let the constructive nature of the number
do real work in the reading; or (c) lean entirely into the animated grow:
let the background almost vanish and only the matched pair (with the
0.55 s elastic scale) carry the clock — a piece that only ever briefly
admits it is reading π.

**Reusable bits.** Three scripts left in `scripts/`:
`pi-coverage.py` (worst-case for any string of digits, strict 2-digit),
`pi-coverage-flex.py` (same but accepts single-digit for values 0–9),
`constants-coverage.py` (runs the search across 17 famous constants).

## Random Dot Stereogram — 随机点立体图钟 (built, then parked)

**Concept.** A SIRDS (single-image random-dot stereogram, the Magic Eye
trick) whose hidden depth map is the current `HH:MM:SS`. The viewer
defocuses (wall-eye) and the time floats out of the noise. Refreshes once
per second.

**What was tried.** Lived in `src/app/idea-preview/` and went through four
algorithm iterations:

- Naive forward-copy with `Math.random()` seed — pattern flickered every
  frame, focus lock kept breaking.
- Union-find SIRDS keyed on `hash(root, y)` — stable noise outside text
  but produced visible "text shadows" because background chains got
  rerouted at text boundaries.
- Thimbleby/Inglis/Witten `same[]` chain-walk algorithm (the 1994
  reference), with colour noise to hide artifacts — colour ended up
  *interfering* with reading the digits after fusion.
- Back to forward-copy with chunky 3×3 grayscale dots — dots too coarse,
  the texture dominated the whole image.
- Final pass: forward-copy, per-pixel B&W noise, `SEP=80`, `SCALE=18`
  — still no convincing 3D pop.

**Why parked.** B&W random-dot autostereograms are genuinely hard at
small canvas sizes. The fundamental tension: the text *must* leave a
visible signature in the noise (otherwise no parallax), but the same
signature reads as a "text shadow" before defocus. Real Magic Eye books
sidestep this by using rich repeating textures (dragons, flowers) rather
than random dots — texture pattern continuity hides depth artifacts.
Also, npm has zero maintained SIRDS libraries — it's a 90s algorithm with
no live JS ecosystem.

**If revisited.** Don't use random dots. Pick a repeating *texture*
(small pictograms, or a tiled noise pattern with mid-frequency structure)
and apply the depth shift to it. The texture's own continuity will mask
the text signature. Also consider switching to a static well-known SIRDS
gallery image and animating only the depth-map digit positions inside it.

**Reusable bits.** None worth keeping — the forward-copy and Thimbleby
implementations are short enough to re-write if the texture-based
direction is tried.

## Cat — 猫钟（built, then parked）

**Concept.** A skeuomorphic cartoon cat as a clock. The whole fluffy head
slowly rotates to point at the current hour; a soft short tail sweeps out
toward the current minute; a glowing red laser dot on the carpet is the
second hand. The cat's wide-open pupils continuously track the laser
relative to its own head rotation, so the eyes look convincingly alive
even though every part is driven by the wall clock.

**What was tried.** Built as `src/clocks/cat/CatClock.tsx` after #031
(Smile) and briefly registered as `#032`. The prototype used a 32 ms
`useWallClock` cadence for smooth motion, computed float hour/minute/second
angles, mapped head rotation to `hourAngle`, tail sweep to `minuteAngle`,
laser position to `secondAngle` on a large orbit around the carpet, and
computed pupil offsets as `secondAngle - hourAngle` (the laser's angle
*relative to the head*, so the pupils track properly through head
rotations). SVG drop-shadow and gaussian-glow filters added the fur
depth and the laser bloom.

**Why parked.** Set aside for now — not shipping in the current gallery.
Code is preserved in `archive/cat/CatClock.tsx`.

**If revisited.** The `useSmoothCatAngles` hook, the relative-angle pupil
math, and the laser-glow filter recipe are all reusable for any future
"animal follows a moving accent" clock.

## Twelve Clocks — 十二钟（built twice, parked twice）

**Concept.** A #001 face whose twelve hour marks aren't numerals but twelve
smaller copies of the same face; each smaller copy holds twelve of its own;
and so on. Every 5 seconds the camera zooms exponentially by 1/k about one
of the twelve children's accumulation points. Because that child is a
self-similar copy of the whole dial, the moment it fills the frame is
visually identical to the starting moment — the wrap is invisible and the
fall is infinite. Every dial on every level shows the real hour and minute.

**What was tried (twice).** First around #014 (`archive/twelve-clocks/
TwelveClocksClock.tsx`, "v2"), then again as briefly-#032 (`TwelveClocksClockV3.tsx`,
"v3"). v3 fixed everything v2 was accused of: it faded L0's hands aggressively
(`max(0, 1 − 2.5·u)`) so the parent didn't dominate at u→1; it used the dial's
12-fold rotational symmetry so all twelve dive destinations were geometrically
equivalent — same animation, different destination parameters — enabling clean
cycling through all twelve; it dropped the red second hand since "which child
is being dived into" is already the discrete seconds indicator (12 slots per
minute). Wrap was mathematically seamless, cycling worked, no visible pop.

**Why parked (both times).** Even with everything technically working, the
piece reads as "a clock that keeps interrupting itself every 5 seconds"
more than "a fractal telling the time". Reading hour/minute during mid-dive
frames requires effort: the visible "main" hands hand off from L0 to the
dive-target child, but the eye still has to relocate every window. And the
cycle direction is an abstraction the viewer has to infer, not read at a
glance. Beautiful concept, restless clock.

**If revisited.** The accumulation-point exponential-zoom trick
(`p = c/(1-k)`, `s = (1/k)^u`, seamless self-similar wrap with constant
perceived pan speed) is the reusable core — it's how any Droste dive should
be built. The 12-fold-symmetry insight that "all cycling destinations are
one animation with different parameters" is also worth keeping. What needs
to change is the framing: perhaps a slower cadence (one child per minute
rather than per 5s) so the viewer has time to settle into each mini-clock;
or ditching the fractal dive entirely and using nested dials as static
visual richness only (though a first version tried that and it read as "a
Droste illustration" rather than a working clock).

