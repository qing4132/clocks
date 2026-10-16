# Ink 200 / #1332-1531

Two hundred additional Lab studies, created after feedback that Open 200 did
not fit the gallery's established visual language. This batch returns to the
exact Classic Round paper, ink, red, and Georgia typography. Structures vary
through hands, marks, apertures, lettering, geometry, paths, and time scales;
there are no alternate palettes, gradients, or blur effects.

These are candidates for review, not selected works or claims of worldwide
originality. Open 200 and the earlier retained batches remain available. The
formal registry still contains 34 works.

## Browsing

Open the last batch tab in `/lab`, labeled with the Chinese name for Ink 200.
There are ten pages of twenty works. Each new card has an individual short
Chinese explanation, displayed on pointer hover or keyboard focus. Escape
dismisses it until the next pointer entry or focus entry. The card and tooltip
are connected through `aria-describedby`.

The existing Lab date, exact time, pause, scrubbing, stepping, speed, and reset
controls apply to every study. Viewing or hovering is not required for the
clocks themselves to run.

## Page Index

| Page | IDs | Structures |
| --- | --- | --- |
| 1 | 1332-1351 | Needles and hinged hands |
| 2 | 1352-1371 | Tick marks and outer rims |
| 3 | 1372-1391 | Windows and typographic layouts |
| 4 | 1392-1411 | Stencil lettering and dial numerals |
| 5 | 1412-1431 | Negative space and second markers |
| 6 | 1432-1451 | Cadence and linear rulers |
| 7 | 1452-1471 | Distances, angles, and paired dials |
| 8 | 1472-1491 | Shaped dials and arc hands |
| 9 | 1492-1511 | Continuous routes and counted marks |
| 10 | 1512-1531 | Civil calendar and remaining intervals |

## Reading Notes

- Conventional faces retain the ordinary twelve-hour direction. Typographic
  hour values and counted day scales use local 24-hour time unless a dial
  explicitly carries a twelve-hour scale.
- Shaped dials apply the same mapping to the rim, marks, numeral positions,
  and hand endpoints. Bent and curved hands are read at their outer ends.
- Cadence studies deliberately hold or step selected hands. Five Minute Gate
  includes the minutes left over after the last five-minute mark.
- Counted minute marks represent completed minutes, with zero filled marks at
  minute zero. Hour Tokens uses five-hour and one-hour marks; Tens And Ones
  separates decimal minute digits. The second ladder also starts at zero.
- Day Halves uses fixed 06:00 and 18:00 divisions, not measured sunrise or
  sunset. Week Ring is Monday-first, numbered 1 through 7. Month Edge uses the
  selected month's actual length, including leap-year and century rules.
- Remaining-interval faces intentionally show a countdown instead of, or
  alongside, current time. Midnight and day balance use actual local date
  boundaries, including 23-hour, 25-hour, and half-hour daylight-saving days.
  Remaining seconds round up; completed elapsed seconds round down.
- Some distance or route studies retain figures as an exact reference while
  the geometry gives a continuous but approximate reading.

## Implementation

- `catalog.ts` defines all 200 unique entries and Chinese hints, in batch 18.
- `InkClock.tsx` has an exhaustive twenty-family renderer map and subscribes
  to the existing shared wall clock at 100 ms cadence.
- `shared.tsx` keeps the original hand dimensions and typography together.
  `geometry.ts` provides bounded mappings, routes, and counting helpers.
- Local interval arithmetic reuses the tested helpers from
  `../open-200/motion-intervals.tsx`; none of that batch's visual themes are used.
- Rendering depends on the selected wall-clock time, not accumulated frame
  state. Server and initial client artwork stay empty until local time exists.
- React instance IDs isolate masks and clips. Existing `ClockPreview` mounting
  and twenty-item pagination prevent all 200 works from running at once.
- No dependencies, additional clock timers, background tasks, or original
  gallery changes were introduced.

## Verification

Run from the repository root:

```sh
node --test src/clocks/lab/ink-200/*.test.mjs
npx eslint src/clocks/lab/ink-200 src/app/lab/page.dev.tsx src/app/lab/LabGallery.tsx
npm run build
```

The 18 tests cover complete renderer and identifier coverage, unique Chinese
hints, exact palette and font constraints, finite nonempty SVGs, deterministic
replay, duplicate-instance definitions, route boundaries, shaped-dial bearing
consistency, all minute/hour counts, second steps, overlapping dial hand order,
leap years, local midnight, repeated hours, and final-second rounding.

The combined Back to 001, Perception, Open 200, and Ink 200 suite has 71 passing
tests. Production TypeScript checking and all 40 static routes pass.

Browser verification mounted all 200 works at 1440px desktop and 320px mobile
widths. It checked individual Chinese hints, keyboard focus, Escape dismissal,
nonblank rasterized artwork, text and card bounds, and late-night readings.
Ten visual sheets of the mounted SVG artwork were reviewed, followed by focused
checks of the corrected designs. No candidates were promoted or deployed.