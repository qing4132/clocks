import type { LabExperiment } from "../types";
import { continuationEntries } from "./continuations.catalog";
import { furtherEntries } from "./further.catalog";

const entries = [
  {
    id: 1094,
    slug: "open-rim",
    nameEn: "Open Rim",
    description: "Everything remains where it belongs, except the second hand has become a small opening in the rim.",
    mechanism: "An eight-degree opening follows the second around the original 96-unit rim. Hour and minute hands remain untouched.",
    reading: "Read hour and minute normally. The tiny red point at the center of the opening is the second.",
  },
  {
    id: 1095,
    slug: "inward",
    nameEn: "Inward",
    description: "The hands belong to the edge now. The center no longer holds the clock together.",
    mechanism: "Each original hand is anchored to its correct position on the rim and extends inward with its unchanged full length and weight.",
    reading: "Read the rim attachment, rather than the inward tip. The short thick hand is hour, the longer black hand minute, and the red hand second.",
  },
  {
    id: 1096,
    slug: "hand-in-hand",
    nameEn: "Hand in Hand",
    description: "The minute hand starts where the hour hand ends, making one quiet articulated gesture.",
    mechanism: "The hour tip remains at radius 50. A single hinged minute stroke joins it to the ordinary minute tip at radius 74.",
    reading: "The elbow reads the hour and the free end reads the minute, both against the familiar face. The red second hand is unchanged.",
  },
  {
    id: 1097,
    slug: "courtesy",
    nameEn: "Courtesy",
    description: "As the two black hands approach one another, they bow gently in opposite directions.",
    mechanism: "The body of each hand bends by their angular proximity. Both tips and both tails stay on their exact original bearings.",
    reading: "Read all three tips exactly as on 001. Only the space between the black hands changes.",
  },
  {
    id: 1098,
    slug: "wandering-pivot",
    nameEn: "Wandering Pivot",
    description: "The hour and minute tips stay true while their shared red center quietly wanders.",
    mechanism: "The second hand contracts into the shared pivot, which circles at radius 20 once per minute. Both black tips remain at their original positions.",
    reading: "Read the two black endpoints against the familiar dial. The red pivot's bearing from the face center reads seconds.",
  },
  {
    id: 1099,
    slug: "two-sides",
    nameEn: "Two Sides",
    description: "The second hand is the boundary between the front and the reverse of one clock.",
    mechanism: "A single half-plane follows the red second hand. Marks and black hands reverse ink on the dark side without moving or duplicating their bearings.",
    reading: "Read the clock normally. Every line stays continuous as it crosses between paper and ink.",
  },
  {
    id: 1100,
    slug: "crosswise",
    nameEn: "Crosswise",
    description: "The hands no longer point out. They lie crosswise at the places their tips used to reach.",
    mechanism: "Each needle becomes a straight chord perpendicular to its original bearing, centered on its original tip. The thicknesses and colors remain 001's.",
    reading: "Read the midpoint of the long thick chord as hour, the thinner black chord as minute, and the red chord as second.",
  },
  {
    id: 1101,
    slug: "still-hour",
    nameEn: "Still Hour",
    description: "The slowest hand is perfectly still. The clock quietly moves around it.",
    mechanism: "One common rotation subtracts the hour bearing from all marks and hands. The hour hand remains upright, and every relative reading is preserved.",
    reading: "Read the numbers under each hand normally. All twelve numerals remain upright while their common scale slowly revolves.",
  },
  {
    id: 1102,
    slug: "borrowed-numeral",
    nameEn: "Borrowed Numeral",
    description: "The current hour steps out of the numbered ring and takes the place of its own hand.",
    mechanism: "Eleven hour numerals stay on the original scale. The twelfth moves to the exact hour-hand tip, leaving its former place empty until the next hour.",
    reading: "The displaced numeral is the hour. Its position includes progress through that hour; the ordinary minute and second hands remain.",
  },
  {
    id: 1103,
    slug: "cutout",
    nameEn: "Cutout",
    description: "The black hands are absent. Time is the shape of the paper they have taken away.",
    mechanism: "The exact original hour and minute strokes, including their tails and common hub, are subtracted from the face. Only the cut edges catch a small shadow.",
    reading: "Read the two empty hand silhouettes as usual. The red second hand passes above the open center.",
  },
  ...continuationEntries,
  ...furtherEntries,
];

export const backTo001Studies: LabExperiment[] = entries.map((entry) => ({
  ...entry,
  slug: `back-to-001-${entry.id}-${entry.slug}`,
  position: entry.id,
  batch: 15,
  face: "none",
  status: "001 / one changed relationship",
}));