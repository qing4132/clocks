# Open 200 / #1132-1331

Two hundred new Lab studies, created at the user's request for an unrestricted
batch. They are exploratory studies, not additions to the formal gallery and
not claims of worldwide originality. Existing works, including Back to 001
and Perception, are preserved.

Open the **Open 200** tab in `/lab`. The existing gallery displays twenty works
per page, for ten pages. All works use the shared local wall clock, including
the Lab date/time controls, pause, speed, scrubbing, and reset.

## Page Index

| Page | IDs | Structures |
| --- | --- | --- |
| 1 | 1132-1151 | Typography and analog dials |
| 2 | 1152-1171 | Tracks and radial constructions |
| 3 | 1172-1191 | Counted tiles and instruments |
| 4 | 1192-1211 | Curves and paper structures |
| 5 | 1212-1231 | Signals and calendars |
| 6 | 1232-1251 | Binary words and arithmetic expressions |
| 7 | 1252-1271 | Orbits and architectural structures |
| 8 | 1272-1291 | Waves and contours |
| 9 | 1292-1311 | Lattices and optical treatments |
| 10 | 1312-1331 | Motion and remaining intervals |

Each family contains ten constructions. Within a family, implementations vary
geometry, composition, positioning, or representation, not only palette. The
complete names, IDs, slugs, and reading notes are in `catalog.ts`.

## Reading and Scope

- Most studies either provide the exact local time as figures or retain a
  directly readable conventional, counted, or weighted scale. Some use figures
  as an exact reference alongside less precise geometric motion.
- Units are ordered hour, minute, second unless the face supplies a different
  explicit arrangement. Ink, accent, and warm accent generally distinguish them.
- Binary words use six positions, most-significant first. Gray Reflection uses
  Gray code and retains numeric reference values.
- Arithmetic expressions recover the displayed units; `*`, `/`, `%`, and `^`
  mean multiplication, division, remainder, and exponentiation respectively.
- Calendar structures use the selected local calendar date, actual month
  lengths, leap-year rules, and Monday-first week positions.
- Interval faces distinguish current time from the labeled remaining span.
  Midnight uses a local `Date` boundary, so daylight-saving days are not assumed
  to contain twenty-four elapsed hours. The next whole-hour boundary is tested
  across both one-hour and half-hour clock changes.
- Titles such as Planetary Gear, Column Shadows, and Polarizer Clock describe
  graphic studies, not physical simulations or astronomical measurements.
- No sound, camera, sensor permission, external network request, or viewer input
  is required for a clock to run.

## Implementation

- `catalog.ts`: exactly 200 entries, 20 families, 10 constructions per family.
- `OpenClock.tsx`: a fully typed renderer map and one shared-clock subscription
  per mounted preview, at 100 ms cadence.
- `shared.tsx`: small geometry, typography, palette, dial, and readout helpers.
- The ten paired renderer files each implement twenty related studies.
- Rendering depends on the selected `Date`, not accumulated frame state.
  Revisiting a timestamp reproduces the same picture.
- The server and initial client render remain empty until local time is ready.
- Per-instance React IDs isolate masks and clips when a work appears twice.
- The gallery's existing pagination and `ClockPreview` visibility mounting keep
  the entire batch from animating at once. No additional timers, workers,
  dependencies, or background services were added.

## Verification

Run from the repository root:

```sh
node --test src/clocks/lab/open-200/*.test.mjs
npx eslint src/clocks/lab/open-200 src/app/lab/page.dev.tsx src/app/lab/LabGallery.tsx
npm run build
```

The tests verify:

- Exact count, unique names/slugs, consecutive IDs, and renderer coverage.
- All 200 actual components at midnight, hand meetings, and unit boundaries.
- Finite SVG attributes, nonnegative sizes, and nonempty artwork.
- Deterministic replay and distinct drawing markup with palette attributes
  removed from the comparison.
- Exact arithmetic and binary reconstruction, Gray decoding, and calendar rules.
- Local-boundary countdowns in New York and Lord Howe daylight-saving changes.
- Duplicate-instance mask/clip isolation.
- Regression checks for translated text coordinates, unique diagonal counts,
  and the three time-bearing hands in Twin Pivots.

Browser QA covers all ten pages and all 200 works at desktop and mobile widths,
with whole-page screenshots to inspect the actual artwork in addition to DOM
bounds. Conveyor Time intentionally clips its neighboring numbers outside its
window; those invisible text bounds are not an overflow defect.

No work is promoted, committed, or published by creating this batch. The formal
registry remains unchanged.