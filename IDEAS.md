# Ideas parked for later

Designs and structural decisions we've discussed but deliberately *haven't*
built yet. Unlike `archive/`, these were never prototyped — they're waiting
until the gallery grows enough to need them. Revisit when adding many more
clocks or rethinking how the gallery is presented.

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

