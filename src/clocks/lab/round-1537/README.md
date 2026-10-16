# New Studies / #1537-1544

Four initial Lab candidates and four presentation variants, not additions to the formal gallery.
Earlier clocks and the rejected Amoeba alternatives remain untouched.

| ID | Name | Mechanism |
| --- | --- | --- |
| 1537 | Reassembly | The same 28 rigid strokes translate and rotate into the next HH:MM. |
| 1538 | Dual Projection | One three-dimensional volume casts the hour and minute onto perpendicular receiving surfaces. |
| 1539 | Single Sign | One Cistercian-style composite numeral encodes the four digits of HHMM. |
| 1540 | Triple Projection | A different shared volume casts framed hour, minute, and second numerals onto two upright surfaces and a horizontal floor. |

All studies use the existing Lab date/time, pause, speed, and replay controls.
Each card has a Chinese hover/focus explanation, dismissible with Escape.
The first four remain in batch 20; the projection presentation variants have
their own final batch 21 tab in `/lab`. No new route or formal registry entry was
created, and no viewer interaction is required for the clocks to run.

## Reassembly

Each digit owns seven equal-length strokes. Inactive strokes overlap active
ones, rather than disappearing or shrinking. When a digit does not change,
all seven of its strokes remain in place. The existing digital family's
segment definitions are reused without changing that family's appearance.

Reconfiguration takes the first 1.8 seconds of the new minute. During that
brief transition the glyphs are in between readings; they should not be treated
as an instantly settled display. The accessible label reports the current time.
Start at `09:59:59` and resume to inspect a complete four-digit rearrangement.

## Dual Projection

Seven rows of two 5-by-7 numeral masks define the construction. At each row,
the solid contains exactly the Cartesian product of the occupied hour columns
and minute columns. Every row in both masks is occupied, so orthographic
projection of the resulting cuboids recovers both masks exactly.

Three.js renders the actual cuboids and two directional-light shadow maps.
The receiving surfaces contain no numeral textures, text, or separately drawn
time digits. Left shadow is the hour, right shadow is the minute; the front
red point indicates seconds. Geometry and shadow maps update on minute changes;
the existing shared wall clock drives the seconds marker.

The digital sculpture may contain disconnected components. This is an exact
projection construction, not a claim that the object is a printable connected
mechanism. WebGL is required. The component releases its renderer, geometries,
materials, shadow maps, and resize observer when the preview unmounts.

## Single Sign

The upper-right and upper-left quadrants encode minute units and tens; the
lower-right and lower-left quadrants encode hour units and tens. Each quadrant
uses the conventional vertical Cistercian digit construction, with a triangular
five. The red point moves down the stave once per minute.

This adapts an existing numeral system, not an invented notation. An omitted
quadrant contributes zero. A completely empty stave at `00:00` is a clock-specific
extension; historical Cistercian notation did not define a standalone zero.
Reading requires learning the digit forms, unlike the projection and reassembly clocks.

Reference: [Cistercian numeral forms](https://en.wikipedia.org/wiki/Cistercian_numerals#Form).

## Triple Projection

This is a separate #1540 implementation. The #1538 component, scene, and volume
generator remain byte-for-byte unchanged; only its numeral mask is reused.

Three 15-by-15 masks include the original digits, a clear margin, and a common
frame. Their extruded intersection creates one set of cuboids. The common frame
guarantees that every intended shadow pixel has a compatible occupied ray in
both other projections. Removing the frame would invalidate that guarantee.
Frame cells are physically thinner than the numeral cells.

Three directional lights project the actual volume: hour on the left, minute on
the right, and second on the floor below. The floor mask's depth orientation is
reversed in the volume so its shadow reads upright from the chosen viewpoint.
The bottom shadow material is tinted red to distinguish seconds; this is a
display treatment, not a simulation of colored-light optics. All numerals and
frames come from real shadow maps, with no text or numeral image overlays.

The existing wall clock drives the new component once per second. Cuboids and
shadow maps rebuild only when the displayed time changes; the fixed camera and
receiving surfaces stay in place. No per-frame loop or extra timer is added.
Pausing and replaying use the same selected local time. Like #1538, it requires
WebGL and does not claim to be a connected, mechanically buildable sculpture.

## Projection Presentation Variants

The #1540 component, scene, and volume generator stay unchanged. These four
studies call its exact `tripleProjectionVolume` and `tripleBlockBounds` functions.
Only material, lighting intensity, receiving-panel construction, and the viewing
camera differ. The volume is the only shadow caster in each scene; the housing
cannot introduce extra marks into any numeral projection.

| ID | Name | Presentation |
| --- | --- | --- |
| 1541 | Corner Room | Three connected surfaces form a room; unequal illumination and a graphite core emphasize the depth. |
| 1542 | Porcelain | Opaque white material, self-shadowed recesses, thick separate plates, and mild perspective. |
| 1543 | Vermilion Core | Red solid, thin white receiving plates, and a higher viewpoint. |
| 1544 | Gallery Plinth | Silver-gray solid with stronger facet contrast, thick dark backing, and a solid floor plinth. |

All retain the same hour-left, minute-right, second-below layout, three real
directional-light shadows, fixed framed digits, and once-per-second rebuilding.
No beveling, transparent shadow proxy, post-rendered digits, or extra animation
is used. The perspective cameras and receiving distances are chosen so the
entire fixed volume envelope cannot obscure the reading-area corners. Thick
panel corners are checked against the camera frustum. Camera framing does not
change with the time.

The independent renderer adds self-shadowing to the actual opaque solid and
lit matte paper surfaces. It releases every geometry, material, shadow map,
renderer, and resize observer when an offscreen preview unmounts. The original
preview visibility management and shared wall clock remain in use.

## Verification

```sh
node --test src/clocks/lab/round-1537/studies.test.mjs
npx eslint src/clocks/lab/round-1537 src/app/lab/page.dev.tsx src/app/lab/LabGallery.tsx
npm run build
```

Fifteen focused tests cover fixed stroke count and length, all 1,440 minute
transitions, midnight continuity, both exact projections for all 1,440 local
times, all three projections from the actual compressed #1540 cuboids for all
86,400 time combinations, unique composite glyphs, SSR placeholders, and
append-only identifiers. The added presentation checks compare every instance
transform with #1540, confirm a single shared caster, and verify panel framing
and reading-area visibility in all four cameras.
The six related study batches have 103 passing tests; production compilation
and all 40 static routes pass.

The first three candidates' browser checks cover 54 time/viewport combinations at 1440px, 390px, and 320px,
18 WebGL raster checks with visible ink on both projection surfaces, Chinese
tooltips, Escape dismissal, and real playback from `09:59` into `10:00`.
The added #1540 has 18 corresponding render checks, sampling 12,150 WebGL cells
across all three receiving surfaces, including the thin frames and clear margins.
Those tests include `11:11:08`, which conflicts without a shared frame, and
successive seconds with unchanged hour/minute shadows. All sampled cells match.
Desktop/mobile screenshots and Chinese hover/focus/Escape checks pass. A visible
browser run crosses midnight with one geometry update each second and no missed
reading; the largest observed update interval in that run was 1001 ms.
Screenshots were inspected on desktop and mobile. No preview server was started;
the existing local service was reused.

The four presentation variants have 60 rendering checks at 1440px, 390px, and
320px, covering 40,500 projected grid samples. Numeral and clear-margin samples
match directly; twenty thin red frame samples at narrow widths require a
one-pixel neighborhood because the slanted border lies between pixel centers.
All four Chinese hints, focus, and Escape states pass. A simultaneous visible
run crosses midnight with all four scenes updating once each second; its largest
observed interval is 1002 ms. Desktop comparison images and mobile screenshots
were inspected for material depth, overlap, and legibility.

Dependency audit reports eight existing-package advisories, including a critical
Next.js advisory; none names Three.js or its added type dependencies. No unrelated
dependency upgrades were applied. Git status checking is blocked by the machine's
Xcode license prompt, so Git-dependent portal activity synchronization was skipped
to avoid an inaccurate inventory. No commit or deployment was performed.