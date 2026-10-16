import type { LabExperiment } from "../types";

export const FAMILIES = [
  "type", "dials", "tracks", "radial", "tiles", "instruments", "curves", "paper", "signals", "calendar",
  "binary", "arithmetic", "orbits", "architecture", "waves", "contours", "lattices", "optics", "motion", "intervals",
] as const;

export type Family = typeof FAMILIES[number];
export type OpenStudy = LabExperiment & { family: Family; variant: number };

const titles: Record<Family, readonly string[]> = {
  type: ["Column Time", "Baseline", "Time Index", "Inline Seconds", "Vertical Colon", "Fractional Type", "Four Corners", "Three Weights", "Time Ledger", "Type Apertures"],
  dials: ["Sector Numerals", "Detached Scales", "Twin Pivots", "Open Meridian", "Nested Squared", "Oblique Dial", "Cardinal Only", "Offset Seconds", "Hour Windows", "Concentric Hands"],
  tracks: ["Running Track", "Triangular Circuit", "Diamond Route", "Hexagon Course", "Serpentine Hours", "Stairway Seconds", "Open Arch", "Switchback", "Rounded Loop", "Day Spiral"],
  radial: ["Radial Comb", "Three Fans", "Petal Count", "Crown Marks", "Split Circumference", "Hour Rays", "Twelve Blades", "Radial Windows", "Spoke Sweep", "Turn Counter"],
  tiles: ["Minute Mosaic", "Domino Digits", "Five by Twelve", "Stacked Tens", "Hour Cubicles", "Negative Cell", "Diagonal Count", "Checker Pulse", "Quarter Blocks", "Tally Wall"],
  instruments: ["Three Needles", "Balance Readout", "Dial Calipers", "Level Tubes", "Pointer Sliders", "Time Vernier Pair", "Tachometer Minute", "Hour Gauge", "Instrument Cross", "Travel Indicator"],
  curves: ["Quadratic Hands", "Sine Ribbon", "Bezier Fork", "Arc Bridge", "Infinity Sweep", "Heartline", "Parabolic Sweep", "Rose Coordinate", "Lemniscate Minutes", "Curve Envelope"],
  paper: ["Turning Leaf", "Three Folds", "Ticket Time", "Cut Paper", "Tabbed Hours", "Page Edges", "Paper Roll", "Folded Digits", "Corner Reveal", "Pleated Day"],
  signals: ["Pulse Rails", "Three Frequencies", "Dot Dash Time", "Signal Matrix", "Scan Columns", "Waveform Numbers", "Packet Clock", "Beacon Ring", "Frequency Bands", "Carrier Phase"],
  calendar: ["Month Field", "Year Ribbon", "Week Hand", "Date Spine", "Daylight Ledger", "Ordinal Day", "Month Spiral", "Year Mosaic", "Week Columns", "Calendar Pendulum"],
  binary: ["Bit Columns", "Bit Rings", "Binary Stair", "Gray Reflection", "Bit Constellation", "Binary Weights", "Bit Flowers", "Bit Cutouts", "Bit Cascade", "Bit Brackets"],
  arithmetic: ["Sum Clock", "Product Clock", "Difference Clock", "Division Clock", "Power Clock", "Complement Pairs", "Balanced Equation", "Integer Fractions", "Remainder Clock", "Expanded Decimal"],
  orbits: ["Epicycle Pair", "Barycenter", "Three Ellipses", "Orbit Transfer", "Nested Satellites", "Orbital Triangle", "Binary Stars", "Planetary Gear", "Apsidal Time", "Orbit Lanes"],
  architecture: ["Clock Facade", "Time Tower", "Three Bridges", "Arcade Hours", "Column Shadows", "Rising Floors", "Window Digits", "Roofline", "Courtyard", "Terrace Clock"],
  waves: ["Standing Wave", "Phase Crossing", "Wave Bundles", "Waterline Digits", "Ripple Sources", "Wave Ruler", "Frequency Weave", "Minute Current", "Amplitude Hands", "Wave Packet"],
  contours: ["Topographic Time", "Nested Pebbles", "Hour Isobars", "Contour Numerals", "Three Basins", "Contour Cut", "Hour Peninsula", "Minute Plateau", "Contour Drift", "Isochrone Field"],
  lattices: ["Triangular Mesh", "Time Trellis", "Polar Mesh", "Dot Coordinates", "Crossing Threads", "Hex Mesh", "Rotated Grid", "Time Loom", "Lattice Aperture", "Mesh Contours"],
  optics: ["Prism Numerals", "Striped Lens", "Offset Print", "Prismatic Hands", "Lens Strip", "Spectral Cut", "Polarizer Clock", "Halftone Hours", "Edge Light", "Color Registration"],
  motion: ["Rolling Numerals", "Orbiting Type", "Rocking Digits", "Spring Scale", "Pendular Minute", "Conveyor Time", "Lift Digits", "Elastic Strokes", "Traveling Dots", "Falling Seconds"],
  intervals: ["Minute Remaining", "Hour Remaining", "Day Remaining", "Quarter Turn", "Five Minute Span", "Minute Sandwich", "Hour Brackets", "Day Split", "Second Chamber", "Next Boundary"],
};

const readings: Record<Family, string> = {
  type: "Read the local hour, minute, and second from the typographic arrangement.",
  dials: "Use the marked hour and minute bearings; the warm accent denotes seconds.",
  tracks: "Track positions follow local hours, minutes, and seconds; nearby figures give the exact values.",
  radial: "Read hour/minute/second from the three distinct radial structures and their value marks.",
  tiles: "Count visibly grouped cells or read the accompanying numeric values; cell changes follow local time.",
  instruments: "Read the calibrated scales or their numeric indicators for local hour, minute, and second.",
  curves: "The curves carry time-bearing endpoints and explicitly calibrated progress; the figures retain exact readings.",
  paper: "Read the current local time on the cut, folded, or layered paper structure.",
  signals: "Numeric groups retain the current local time while the signal structure follows each unit's phase.",
  calendar: "Read local calendar values with local time; month lengths and leap years use the selected date.",
  binary: "Read bits most-significant first, using the visible weights or numeric check values.",
  arithmetic: "Evaluate each displayed expression to recover the local hour, minute, and second.",
  orbits: "Orbit positions follow time fractions; endpoint labels give unambiguous local values.",
  architecture: "Read local time in the structural heights, openings, and calibrated markers.",
  waves: "Numeric time stays explicit; wave position, phase, or amplitude corresponds to the actual units.",
  contours: "Contour shapes are driven by the hour, minute, and second, with explicit local-time labels.",
  lattices: "Read the highlighted coordinates and their values inside the time-driven mesh.",
  optics: "Read the local time through the specified color, line, or optical treatment.",
  motion: "The active digits or markers are the current local time; all motion is derived from it.",
  intervals: "Read the current time and the precisely labeled remaining span to the next local boundary.",
};

export const openStudies: OpenStudy[] = FAMILIES.flatMap((family, familyIndex) => titles[family].map((nameEn, variant) => {
  const id = 1132 + familyIndex * 10 + variant;
  return {
    id,
    slug: `open-${id}-${nameEn.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`,
    nameEn,
    description: `${nameEn}: a ${family} study of the current local time.`,
    mechanism: `${family} / construction ${variant + 1}. All geometry is derived from the shared wall clock and can be paused or replayed in Lab.`,
    reading: readings[family],
    status: "Open 200 / unselected Lab study",
    position: id,
    batch: 17,
    face: "none",
    family,
    variant,
  };
}));