# Relation Studies / #1545-1547

Three Lab-only candidates in batch 22. Previous works remain available and
unchanged; no formal selection or deployment is implied.

| ID | Name | Reading |
| --- | --- | --- |
| 1545 | Interstices | White gaps between black plates form HH:MM. |
| 1546 | Cross Section | The computed intersection of folded sheets with one fixed plane forms HHMM. |
| 1547 | Mirror Join | Reflected upper strokes join physical lower strokes to form HHMM. |

All three use local time from the shared wall clock and respond to the existing
Lab controls. Each card has a Chinese hover/focus hint, dismissible with Escape.
No viewer interaction is required for a clock to run.

## Interstices

The face contains a paper backing, fixed black plates, and 28 black shutters.
Moving the shutters opens or closes the gaps between the plates. There is no
white digit text, digit image, or numeral mask. Small overlap between adjacent
black surfaces prevents antialiasing from exposing a line at a closed joint.

At a minute change, only changed gaps move over 800 ms. During this brief
transition the shape is between the old and new readings; the accessible label
already reports the current time. Unchanged gaps remain stationary. A red dot
below the digits indicates seconds. The component updates at 20 ms cadence.

## Cross Section

Each active stroke belongs to an independently bent sheet represented by
triangle geometry. Its endpoints change position and orientation through five
depth layers. The surrounding layers are not a straight extrusion of a complete
numeral. Their motion comes from the selected time and replays deterministically.

A generic triangle/plane intersection routine derives the cut segments from
the actual meshes. Those segments are drawn as thin red cylinders at the cut;
there is no separately generated numeral texture or text overlay. The paper
plane and translucent sheets are a sectional illustration: transparency and
red highlighting help expose the cut, rather than simulate a physical glowing
cross-section. The lower-edge red point records seconds. Rendering uses the
existing 100 ms wall-clock cadence.

## Mirror Join

A 45-degree mirror reflects physical rods behind an upper hood. Their virtual
images form only the upper parts of the four digits; directly visible lower
rods form the rest. The source rods are not placed as complete digit shapes on
a flat surface. The hood blocks the direct front view while leaving the actual
source-to-mirror paths clear. A red point below the assembled reading shows
seconds.

Three.js Reflector renders the reflected scene from a real reflected camera.
No numeral image is pasted onto the mirror. The optical layout uses one fixed
front-facing orthographic viewpoint; arbitrary camera movement would break the
registration between real strokes and virtual strokes. The mirror material
tints the reflection slightly, and the scene is an idealized optical study,
not a claim of a mechanically buildable clock.

The orthographic reflector uses zero clip bias so the mirror backing does not
leak into its view. The rim sits beyond the readable mirror area, preventing
its reflection from becoming an extra horizontal stroke.

## Verification

```sh
node --test src/clocks/lab/round-1545/relations.test.mjs
npx eslint src/clocks/lab/round-1545 src/app/lab/page.dev.tsx src/app/lab/LabGallery.tsx
npm run build
```

Eleven focused tests cover all 1,440 local minute readings for gaps, mesh cuts,
and reflections; gap transitions; non-extruded sheet geometry; actual rendered
cut transforms; physical hood visibility; the reflector's oblique clipping;
distinct identifiers; and SSR placeholders. The combined Lab suite has 114
passing tests, and production compilation exports all 40 static routes.

Browser checks cover 54 combinations of time, design, and desktop/390px/320px
widths. All 1,512 sampled stroke positions match the actual SVG/WebGL readings;
Chinese hints, focus, Escape, and bounds pass. A visible run crosses 09:59 into
10:00 and verifies shutter motion, changing mesh/reflection pixels, and forward
time. Desktop and mobile screenshots were inspected after mirror fixes.

The two spatial studies require WebGL. Renderer resources, reflection targets,
geometries, materials, and resize observers are disposed when a preview unmounts.
No new dependencies or local preview services were installed for this batch.
The existing 3100 service was reused. Git-dependent portal synchronization
remains deferred because of the previously observed Xcode license blocker.
No commit or publication was performed.