import type { LabExperiment } from "../types";

const entries = [
  {
    id: 1124,
    slug: "impossible-weave",
    nameEn: "Impossible Weave",
    description: "Three time-bearing bands disagree about which one is on top.",
    mechanism: "Hour passes over minute, minute over second, and second over hour at their distinct intersections. The local depth rules form a cycle instead of one global stacking order.",
    reading: "Read the terminal bearing of the ink hour ring, blue minute ring, and red second ring against the ordinary dial.",
  },
  {
    id: 1125,
    slug: "reversible-depth",
    nameEn: "Reversible Depth",
    description: "An unchanged wireframe can be seen as projecting outward or receding inward.",
    mechanism: "Two equally weighted polygonal faces and their connecting edges leave the depth order ambiguous. The program never flips the object or changes its shading to force a reversal.",
    reading: "Read the three conventional hands on the near-numbered plane. Perceptual depth reversal is viewer-dependent and is not guaranteed.",
  },
  {
    id: 1126,
    slug: "phantom-color",
    nameEn: "Phantom Color",
    description: "Colored fragments suggest a tinted hand inside a field that is actually still white.",
    mechanism: "Only the inducing cross-strokes receive color. The interiors of the hour and minute regions are never filled, blurred, or given a translucent overlay. This is an experimental neon-color-spreading stimulus.",
    reading: "The shorter pink region indicates hour and the longer blue region minute; the rim accent reads seconds. The strength of the perceived fill varies between viewers.",
  },
  {
    id: 1127,
    slug: "morphogenesis",
    nameEn: "Morphogenesis",
    description: "Acid-green time grows out of a slowly moving field of cobalt cellular ink.",
    mechanism: "A seeded Gray-Scott reaction-diffusion texture is advected by the wall clock. The current glyph field controls its deformation and color structure; no crisp text is painted over the result.",
    reading: "Read local HH:MM directly from the cellular letterforms. Their interior flow follows seconds; replaying a time reproduces the same field.",
  },
  {
    id: 1128,
    slug: "caustic",
    nameEn: "Caustic",
    description: "Fine threads of light gather into the current time inside a dark, water-like field.",
    mechanism: "Several smoothly advected light-ridge fields are focused by the current glyph mask. This is an art-directed caustic image, not a claim of a physically inverse-designed optical surface.",
    reading: "Read local HH:MM from the luminous structure. Continuous light motion expresses seconds without strobing or replacing the time with random imagery.",
  },
  {
    id: 1129,
    slug: "stress-spectrum",
    nameEn: "Stress Spectrum",
    description: "Colored stress fringes gather and reconnect around the two time-bearing black hands.",
    mechanism: "An analytic tensor field driven by the hour and minute tips produces wavelength-dependent interference bands inspired by photoelasticity. It is a visual model, not a calibrated mechanics solver.",
    reading: "Read the conventional hour, minute, and red second hands. The internal color field follows their actual geometry.",
  },
  {
    id: 1130,
    slug: "nested-time",
    nameEn: "Nested Time",
    description: "At one scale the image is the hour; at another, every small figure is the current minute.",
    mechanism: "The two large hour glyphs are composed entirely of repeated minute numerals. A narrow red column travels through the microtype once per minute.",
    reading: "Read the large local 24-hour number for hours and the small repeated number for minutes. There are only two scales, without recursive zoom or interaction.",
  },
  {
    id: 1131,
    slug: "blind-spot",
    nameEn: "Blind Spot",
    description: "Slow yellow hands sit over a moving blue field; a target may temporarily disappear from perception.",
    mechanism: "The yellow hands and endpoints are always rendered at full opacity above the moving distractor field. Nothing programmatically hides or blinks them. This is a motion-induced-blindness experiment with viewer-dependent results.",
    reading: "Read the conventional yellow hour and minute hands, and the rose second mark at the edge. Perceptual disappearance is not guaranteed and is not required to read the clock.",
  },
];

export const perceptionStudies: LabExperiment[] = entries.map((entry) => ({
  ...entry,
  slug: `perception-${entry.id}-${entry.slug}`,
  position: entry.id,
  batch: 16,
  face: "none",
  status: "perception study / local review",
}));