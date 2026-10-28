// ---------------------------------------------------------------------------
// Music theory engine: pitch classes, key-correct note spelling, scales,
// diatonic chords, and movable barre-chord shapes.
// ---------------------------------------------------------------------------

const PC = { // note name -> pitch class (0-11)
  C: 0, 'B#': 0,
  'C#': 1, Db: 1,
  D: 2,
  'D#': 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, 'E#': 5,
  'F#': 6, Gb: 6,
  G: 7,
  'G#': 8, Ab: 8,
  A: 9,
  'A#': 10, Bb: 10,
  B: 11, Cb: 11,
};

function pitchClass(note) {
  return PC[note];
}

// The 12 major keys in circle-of-fifths order, starting at C, clockwise
// (each a perfect fifth above the last), with correctly spelled scale notes.
const CIRCLE_ORDER = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

const MAJOR_KEY_NOTES = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
};

const RELATIVE_MINOR = { // major key -> its relative minor's display name
  C: 'Am', G: 'Em', D: 'Bm', A: 'F#m', E: 'C#m', B: 'G#m',
  'F#': 'D#m', Db: 'Bbm', Ab: 'Fm', Eb: 'Cm', Bb: 'Gm', F: 'Dm',
};

// Camelot codes, aligned to CIRCLE_ORDER.
const CAMELOT_MAJOR = ['8B', '9B', '10B', '11B', '12B', '1B', '2B', '3B', '4B', '5B', '6B', '7B'];
const CAMELOT_MINOR = ['8A', '9A', '10A', '11A', '12A', '1A', '2A', '3A', '4A', '5A', '6A', '7A'];

function majorScaleNotes(majorRoot) {
  return MAJOR_KEY_NOTES[majorRoot];
}

// Natural minor scale, spelled correctly, derived by rotating its relative
// major's scale to start on the 6th degree (e.g. C major -> A natural minor).
function minorScaleNotes(minorRootDisplay) {
  // minorRootDisplay like "Am" -> find the major key whose relative minor matches
  const majorRoot = Object.keys(RELATIVE_MINOR).find(k => RELATIVE_MINOR[k] === minorRootDisplay);
  const majorNotes = MAJOR_KEY_NOTES[majorRoot];
  return [...majorNotes.slice(5), ...majorNotes.slice(0, 5)];
}

const MAJOR_DEGREE_QUALITIES = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const MAJOR_ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const MINOR_DEGREE_QUALITIES = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
const MINOR_ROMAN = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

const PENTATONIC_MAJOR_INTERVALS = [0, 2, 4, 7, 9];
const PENTATONIC_MINOR_INTERVALS = [0, 3, 5, 7, 10];
const BLUES_INTERVALS = [0, 3, 5, 6, 7, 10];

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function chromaticName(pc) {
  return SHARP_NAMES[((pc % 12) + 12) % 12];
}

// Diatonic 7th-chord qualities, degree-aligned with MAJOR_ROMAN / MINOR_ROMAN.
const MAJOR_DEGREE_QUALITIES_7TH = ['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'm7b5'];
const MINOR_DEGREE_QUALITIES_7TH = ['min7', 'm7b5', 'maj7', 'min7', 'min7', 'maj7', 'dom7'];

// Build diatonic chords for a key.
// mode: 'major' | 'minor'. root: display name of tonic, e.g. "G" or "F#m".
// extension: 'triad' | 'seventh'.
function diatonicChords(root, mode, extension = 'triad') {
  const scale = mode === 'major' ? majorScaleNotes(root) : minorScaleNotes(root);
  const romans = mode === 'major' ? MAJOR_ROMAN : MINOR_ROMAN;
  let qualities;
  if (extension === 'seventh') {
    qualities = mode === 'major' ? MAJOR_DEGREE_QUALITIES_7TH : MINOR_DEGREE_QUALITIES_7TH;
  } else {
    qualities = mode === 'major' ? MAJOR_DEGREE_QUALITIES : MINOR_DEGREE_QUALITIES;
  }
  return scale.map((note, i) => ({
    root: note,
    quality: qualities[i],
    roman: romans[i],
    degree: i,
  }));
}

// Common progressions, as indices into the 7 diatonic chords (0-based).
const MAJOR_PROGRESSIONS = [
  { name: 'Pop (I–V–vi–IV)', degrees: [0, 4, 5, 3] },
  { name: 'Classic Rock (I–IV–V)', degrees: [0, 3, 4] },
  { name: 'Emotional Pop (vi–IV–I–V)', degrees: [5, 3, 0, 4] },
  { name: "50s Progression (I–vi–IV–V)", degrees: [0, 5, 3, 4] },
  { name: 'Jazz Cadence (ii–V–I)', degrees: [1, 4, 0] },
  { name: 'Folk (I–IV–vi–V)', degrees: [0, 3, 5, 4] },
  { name: '12-Bar Blues (I–IV–V)', degrees: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4] },
];

const MINOR_PROGRESSIONS = [
  { name: 'Andalusian Cadence (i–VII–VI–V)', degrees: [0, 6, 5, 4] },
  { name: 'Epic Minor (i–VI–III–VII)', degrees: [0, 5, 2, 6] },
  { name: 'Simple Minor (i–iv–v)', degrees: [0, 3, 4] },
  { name: 'Minor Pop (i–iv–VII–III)', degrees: [0, 3, 6, 2] },
  { name: 'Minor Loop (i–VI–VII)', degrees: [0, 5, 6] },
];

// ---------------------------------------------------------------------------
// Movable barre-chord shapes.
// Strings are indexed 6..1 (low E to high e). Fret arrays are
// [string6, string5, string4, string3, string2, string1]; null = muted.
// ---------------------------------------------------------------------------

const OPEN_STRING_PC = [4, 9, 2, 7, 11, 4]; // E A D G B E

const SHAPES = {
  // isBarre: true shapes are fretted with the index finger laid flat across
  // the strings at the barre fret (other fingers add higher notes on top),
  // so a connecting barre line is physically accurate to draw.
  maj_E: { intervals: [0, 2, 2, 1, 0, 0], isBarre: true }, // root on string 6
  maj_A: { intervals: [null, 0, 2, 2, 2, 0], isBarre: true }, // root on string 5
  min_E: { intervals: [0, 2, 2, 0, 0, 0], isBarre: true },
  min_A: { intervals: [null, 0, 2, 2, 1, 0], isBarre: true },
  maj7_E: { intervals: [0, 2, 1, 1, 0, 0], isBarre: true },
  maj7_A: { intervals: [null, 0, 2, 1, 2, 0], isBarre: true },
  min7_E: { intervals: [0, 2, 0, 0, 0, 0], isBarre: true },
  min7_A: { intervals: [null, 0, 2, 0, 1, 0], isBarre: true },
  dom7_E: { intervals: [0, 2, 0, 1, 0, 0], isBarre: true },
  dom7_A: { intervals: [null, 0, 2, 0, 2, 0], isBarre: true },
  // Two independent finger presses landing on the same fret on non-adjacent
  // strings — not a physical barre, so no connecting line should be drawn.
  m7b5_A: { intervals: [null, 0, 1, 0, 1, null], isBarre: false },
};

// Which qualities have an E-shape/A-shape pair to choose the lower fret from,
// vs. only a single available movable shape.
const PAIRED_SHAPE_QUALITIES = {
  maj: ['maj_E', 'maj_A'],
  min: ['min_E', 'min_A'],
  maj7: ['maj7_E', 'maj7_A'],
  min7: ['min7_E', 'min7_A'],
  dom7: ['dom7_E', 'dom7_A'],
};
const SINGLE_SHAPE_QUALITIES = {
  m7b5: 'm7b5_A',
};

function fretsForShape(shapeKey, barreFret) {
  const shape = SHAPES[shapeKey];
  return shape.intervals.map(i => (i === null ? null : i + barreFret));
}

// Familiar open-position shapes that beginners learn first, used in place of
// the movable barre shape whenever one exists for the given root+quality.
const OPEN_CHORD_OVERRIDES = {
  C_maj: [null, 3, 2, 0, 1, 0],
  G_maj: [3, 2, 0, 0, 0, 3],
  D_maj: [null, null, 0, 2, 3, 2],
  Dm_min: [null, null, 0, 2, 3, 1],
};

// Compute a chord diagram for a given root note + quality
// ('maj' | 'min' | 'dim' | 'maj7' | 'min7' | 'dom7' | 'm7b5'), picking
// whichever movable shape sits in the lowest fret position (when there's a
// choice), or falling back to familiar open-position shapes where available.
function chordDiagram(rootNote, quality) {
  if (quality === 'dim') return null; // diminished triads: show as text, no diagram

  const overrideKey = `${rootNote}_${quality}`;
  if (OPEN_CHORD_OVERRIDES[overrideKey]) {
    return { frets: OPEN_CHORD_OVERRIDES[overrideKey], barreFret: 0, shape: 'open', isBarre: false };
  }

  const rootPc = pitchClass(rootNote);

  if (SINGLE_SHAPE_QUALITIES[quality]) {
    const shapeKey = SINGLE_SHAPE_QUALITIES[quality];
    const barreFret = ((rootPc - OPEN_STRING_PC[1]) + 12) % 12; // A-string-rooted
    return {
      frets: fretsForShape(shapeKey, barreFret),
      barreFret,
      shape: 'A-shape',
      isBarre: SHAPES[shapeKey].isBarre,
    };
  }

  const [eShapeKey, aShapeKey] = PAIRED_SHAPE_QUALITIES[quality];
  const eBarre = ((rootPc - OPEN_STRING_PC[0]) + 12) % 12;
  const aBarre = ((rootPc - OPEN_STRING_PC[1]) + 12) % 12;
  const useE = eBarre <= aBarre;
  const shapeKey = useE ? eShapeKey : aShapeKey;
  const barreFret = useE ? eBarre : aBarre;

  return {
    frets: fretsForShape(shapeKey, barreFret),
    barreFret,
    shape: useE ? 'E-shape' : 'A-shape',
    isBarre: SHAPES[shapeKey].isBarre,
  };
}

function scaleIntervalSet(rootNote, type) {
  const rootPc = pitchClass(rootNote);
  let intervals;
  if (type === 'majorPenta') intervals = PENTATONIC_MAJOR_INTERVALS;
  else if (type === 'minorPenta') intervals = PENTATONIC_MINOR_INTERVALS;
  else if (type === 'blues') intervals = BLUES_INTERVALS;
  else intervals = [0, 2, 4, 5, 7, 9, 11]; // fallback, unused directly
  return new Set(intervals.map(iv => (rootPc + iv) % 12));
}
