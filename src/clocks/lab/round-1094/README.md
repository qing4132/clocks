# Back to 001 / #1094-1123

Thirty Lab studies starting from Classic Round, following the rejection of
New Forms (#1084-1093). The user preferred the first ten and requested two
successive additions of ten on 2026-09-08. These are candidates, not selected
gallery works.

The starting point is 001's 96-unit face, sixty marks, twelve Georgia numerals,
ink/paper/red palette, and original hand weights. Each study changes one
relationship within that familiar clock. There is no new notation to learn,
no interaction requirement, and no additional numerical dashboard.

| ID | Name | Changed Relationship |
| --- | --- | --- |
| 1094 | Open Rim | The second hand becomes a small opening in the rim; hour and minute stay unchanged. |
| 1095 | Inward | The original full hand lengths hang from their correct bearings on the rim. Read their attachments. |
| 1096 | Hand in Hand | The minute stroke starts at the hour tip. Read the elbow as hour and the free end as minute. |
| 1097 | Courtesy | The black hands bow away from one another as they meet; their tips remain accurate. |
| 1098 | Wandering Pivot | The red second becomes a moving common pivot; black endpoints retain their original positions. |
| 1099 | Two Sides | The second hand separates paper and ink; every mark reverses contrast across it. |
| 1100 | Crosswise | Each hand lies perpendicular to its old bearing, with its midpoint at the original tip. |
| 1101 | Still Hour | One shared rotation leaves the hour hand still while preserving all hand-to-scale relationships. |
| 1102 | Borrowed Numeral | The current hour numeral leaves its place on the rim and becomes the hour-hand tip. |
| 1103 | Cutout | The original black hands and hub are subtracted from the paper; their openings tell the time. |

## Continuations / #1104-1113

Appended in the same Lab tab without replacing, renaming, or reordering the
first ten studies. The continuation catalog and geometry are separate so the
earlier implementations remain unchanged.

| ID | Name | Changed Relationship |
| --- | --- | --- |
| 1104 | Loop | The black hands close into rings; each farthest bearing is its original hand tip. |
| 1105 | Split Pin | Hour and minute have independent fixed supports but retain their exact endpoints. |
| 1106 | Right Angle | The black hands reach their usual tips by taking perpendicular paths. |
| 1107 | Regard | All sixty ticks turn toward the minute tip, which remains as a point without a shaft. |
| 1108 | Common Stem | One shared root branches continuously into the hour and minute endpoints. |
| 1109 | Distant | Only the terminal strokes remain, leaving the center entirely empty. |
| 1110 | Interspace | The clockwise interval between the hour and minute opens paper inside an ink-dark face. |
| 1111 | Inboard | The scale moves inward while the original long hands enter an otherwise empty outer field. |
| 1112 | Parting | Each numeral briefly parts along its radial line to admit the second hand. |
| 1113 | Round Trip | A red point travels from hour tip to minute tip and back along the two black hands. |

Round Trip deliberately expresses the passage of a minute rather than a unique
static second reading: the point reaches the minute tip at thirty seconds and
returns to the hour tip at the minute boundary. Hour and minute readings remain
ordinary. Interspace uses a clockwise interval, so its opening wraps at a
meeting of the hands rather than silently switching to the smaller sector.

## Further Studies / #1114-1123

The third group is appended without changing the previous twenty. Lab uses
its existing pagination: the first page is #1094-1113 and the second page is
#1114-1123. The further catalog, geometry, and renderers are separate from
the earlier groups.

| ID | Name | Changed Relationship |
| --- | --- | --- |
| 1114 | Plumb | Vertical strokes hang from the original hour and minute tips to the lower inner rim. Read their upper bearings. |
| 1115 | Span | One line joins the two original tips; the solid end is hour and the open end is minute. |
| 1116 | Bypass | The black hands curve around an empty center before continuing to their original tips. |
| 1117 | Fault | The second hand occupies a four-unit crack between two jointly translated halves of the complete face. |
| 1118 | Neighbors | Only the numerals immediately flanking the hour remain visible, with continuous handover. |
| 1119 | Carrier | The hour and minute roots ride on the red second hand while their tips retain their usual bearings. |
| 1120 | Counterpoise | Thin counterweights balance the original forward hands, with open rings identifying the non-reading ends. |
| 1121 | Cancellation | The exact overlap of the two black hands becomes transparent; terminal bearings preserve both readings. |
| 1122 | Handover | Two neighboring minute ticks exchange inward reach while their sixty outer anchors stay fixed. |
| 1123 | Crescent | Tapered half-circle hands reach full weight at their original hour and minute tips. |

Fault moves each clipped half as a whole, preserving its internal relationship
between hands and marks; its two-unit offsets stay within the original
viewBox. Handover retains the ordinary minute divisions but interpolates the
reading through their relative lengths rather than a single rotating tip.
Cancellation keeps its hour and minute terminals visible even when both
bearings coincide. Hidden Neighbors numerals are intentionally retained in
the SVG with zero opacity; visual checks must examine the actual rendering.

## Implementation

- The original Classic Round component and formal registry are unchanged.
- The existing Lab `ClassicFace` renderer supplies the common face anatomy.
- Time comes from `useWallClock(40)`. Unlike 001's jumping seconds, these studies
  use continuous bearings so their new relationships can be observed in motion.
- Every state is derived from the current local time. Pausing, scrubbing,
  remounting, and crossing midnight do not depend on previous frames.
- Server placeholders show the familiar face without guessed hands.
- SVG masks, clips, and filters have per-instance React IDs.

## Verification

From the repository root:

```sh
node --test src/clocks/lab/round-1094/*.test.mjs
npx eslint src/clocks/lab/round-1094 src/app/lab/page.dev.tsx src/app/lab/LabGallery.tsx
npm run build
```

Tests cover rim bearings, inward lengths, fixed endpoints through bending,
the moving pivot, chord midpoints, the shared rotating reference frame,
original hand dimensions, complete component rendering at meetings and
rollovers, hourly numeral replacement, replay, placeholders, and SVG isolation.
Continuation tests additionally cover loop tangency, independent supports,
right-angle paths, tick convergence, the continuous shared root, interval
wrapping, tangential numeral parting, and the out-and-back second cycle.
Further tests cover vertical supports, distinct spanning endpoints, hollow
hub arcs, face-half translations, hour-neighbor coverage, moving supports,
counterweight symmetry, minute-tick handover, and tapered arc endpoints.
The component tests cover all thirty studies and lock the first twenty names
and positions against accidental reordering.

Use Lab to inspect 00:00:00, 01:05:27.280, 06:30:00, 10:08:36, 11:59:59.960,
and 12:00:00 on desktop and mobile. In particular, inspect Cutout's actual
rendered edges rather than only checking that its SVG mask exists.
For the continuation batch, also inspect Parting at 10:08:35 and the second
rollover, Interspace at hand meetings, and Inboard at 320 CSS-pixel width.
On the second page, check Cancellation near 12:00:15, Neighbors at 10:08:36,
Handover across 11:59:59.960 to 12:00:00, and both pagination controls at
320, 390, 768, and 1440 CSS-pixel widths.