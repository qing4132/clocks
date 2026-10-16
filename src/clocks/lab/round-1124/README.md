# Perception / #1124-1131

Eight psychedelic time studies, available in the Perception tab in `/lab`.
They are review candidates only. The formal registry and the earlier thirty
Back to 001 studies are unchanged.

| ID | Study | Reading and Behavior |
| --- | --- | --- |
| 1124 | Impossible Weave | The ink, blue, and red ring tips read hour, minute, and second. Distinct intersections use cyclic over/under ordering. |
| 1125 | Reversible Depth | An unchanged ambiguous wireframe surrounds ordinary hands and marks. The code does not animate a front/back reversal. |
| 1126 | Phantom Color | Short pink and long blue inducing regions indicate hour and minute; the red rim mark indicates seconds. The suggested hand interiors remain white. |
| 1127 | Morphogenesis | Local HH:MM is formed within an advected cellular field. Seconds move the texture without a separate crisp text layer. |
| 1128 | Caustic | Local HH:MM gathers from intersecting light ridges; their internal motion follows wall time. |
| 1129 | Stress Spectrum | Read the conventional hands over wavelength-dependent fringes controlled by hour/minute geometry. |
| 1130 | Nested Time | Large local 24-hour digits consist of repeated current-minute numerals. A red column passes through the microtype each minute. |
| 1131 | Blind Spot | Yellow hour/minute hands remain fully drawn over a slowly rotating distractor grid. A rose rim mark reads seconds. |

## Perceptual Claims

- Reversible Depth, Phantom Color, and Blind Spot are experimental stimuli.
  Reversal, apparent color filling, and perceptual disappearance depend on the
  observer, viewing distance, display, and attention. Their presence in Lab is
  not a claim that these effects were established for every viewer.
- Phantom Color paints only inducing strokes, never a filled or blurred hand.
- Blind Spot always paints both yellow hands and endpoints above the distractor
  field at full opacity. It does not hide, blink, fade, or occlude them.
- Impossible Weave uses a cyclic local depth rule. Its title is not a theorem
  that no three-dimensional interlacing can realize the pictured crossings.

## Fields and Time

- A seeded Gray-Scott solver generates the reusable reaction-diffusion texture
  for Morphogenesis. Each visible frame then advects this texture and combines
  it with the current time's glyph field. It does not run an unbounded,
  history-dependent simulation while the clock is mounted.
- Caustic is an art-directed light-ridge model, not the output of a physically
  inverse-designed lens or fluid surface.
- Stress Spectrum uses an analytic tensor-inspired field and wavelength phases.
  It is not a calibrated photoelastic stress measurement or finite-element
  solution.
- Canvas time glyphs act as inputs to pixel generation, not a visible text
  overlay. The stress dial alone adds conventional readable marks and hands.
- The SVG studies use `useWallClock(50)`; pixel fields use `useWallClock(100)`.
  All derive their state from the existing Lab-controlled local time. The
  color-field phase is continuous across hour boundaries.
- A fixed 240-pixel field buffer limits work on small gallery previews; the
  existing ClockPreview mounts only nearby visible works. No workers, extra
  timers, servers, external media, or new dependencies are needed.
- Empty server placeholders prevent an invented local-time first frame.
  SVG definitions have per-instance React IDs.

## Verification

From the repository root:

```sh
node --test src/clocks/lab/round-1124/*.test.mjs
npx eslint src/clocks/lab/round-1124 src/app/lab/page.dev.tsx src/app/lab/LabGallery.tsx
npm run build
```

The tests cover exact ring endpoints and crossings, coincident hands,
repeatable reaction-diffusion patterns, nonblank pixel fields, glyph influence,
hour-boundary phase continuity, all eight controlled component readings,
hour/minute scale changes, unfilled phantom interiors, always-drawn targets,
static depth scaffolding, server placeholders, and repeated SVG instances.

Browser review should include 00:00:00, 01:05:27.300, 09:59:59.900, 10:00:00,
12:00:00, 14:37:20, and 23:59:59.900; use 320, 390, 768, and 1440 CSS-pixel
widths. Check actual canvas pixels and replay, not only accessible labels.
Inspect the two-scale microtype at full size as well as the gallery thumbnail.