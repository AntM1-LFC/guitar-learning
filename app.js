// ---------------------------------------------------------------------------
// App state & rendering
// ---------------------------------------------------------------------------

const state = {
      keyIndex: 0,        // index into CIRCLE_ORDER
      mode: 'major',       // 'major' | 'minor'
      wheelLabels: 'cof',  // 'cof' | 'camelot'
      scaleType: 'diatonic', // 'diatonic' | 'majorPenta' | 'minorPenta' | 'blues'
      activeProgression: 0,
      chordExtension: 'triad', // 'triad' | 'seventh'
};

function majorTonicNote() {
      return CIRCLE_ORDER[state.keyIndex];
}
function minorTonicDisplay() {
      return RELATIVE_MINOR[majorTonicNote()]; // e.g. "Am"
}
function minorTonicNote() {
      return minorTonicDisplay().slice(0, -1); // strip trailing "m"
}
function currentTonicNote() {
      return state.mode === 'major' ? majorTonicNote() : minorTonicNote();
}
function currentTonicDisplay() {
      return state.mode === 'major' ? majorTonicNote() : minorTonicDisplay();
}

// --- Wheel ------------------------------------------------------------

const WHEEL_CX = 220, WHEEL_CY = 220;
const OUTER_R = 210, OUTER_R_IN = 140, INNER_R = 140, INNER_R_IN = 80;

function polar(cx, cy, r, angleDeg) {
      const rad = (angleDeg - 90) * Math.PI / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutWedgePath(cx, cy, rOuter, rInner, startAngle, endAngle) {
      const p1 = polar(cx, cy, rOuter, startAngle);
      const p2 = polar(cx, cy, rOuter, endAngle);
      const p3 = polar(cx, cy, rInner, endAngle);
      const p4 = polar(cx, cy, rInner, startAngle);
      const large = endAngle - startAngle > 180 ? 1 : 0;
      return [
              `M ${p1.x} ${p1.y}`,
              `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}`,
              `L ${p3.x} ${p3.y}`,
              `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}`,
              'Z',
            ].join(' ');
}

function renderWheel() {
      const svg = document.getElementById('wheel');
      svg.innerHTML = '';
      const ns = 'http://www.w3.org/2000/svg';
      const slice = 30;

  for (let i = 0; i < 12; i++) {
          const start = i * slice - slice / 2;
          const end = start + slice;
          const mid = (start + end) / 2;

        // Outer ring = major keys
        const outerPath = document.createElementNS(ns, 'path');
          outerPath.setAttribute('d', donutWedgePath(WHEEL_CX, WHEEL_CY, OUTER_R, OUTER_R_IN, start, end));
          const isSelOuter = state.mode === 'major' && i === state.keyIndex;
          outerPath.setAttribute('class', 'wedge outer' + (isSelOuter ? ' selected' : ''));
          outerPath.addEventListener('click', () => selectKey(i, 'major'));
          svg.appendChild(outerPath);

        const outerLabelPos = polar(WHEEL_CX, WHEEL_CY, (OUTER_R + OUTER_R_IN) / 2, mid);
          const outerText = document.createElementNS(ns, 'text');
          outerText.setAttribute('x', outerLabelPos.x);
          outerText.setAttribute('y', outerLabelPos.y);
          outerText.setAttribute('class', 'wedge-label outer-label' + (isSelOuter ? ' selected' : ''));
          outerText.textContent = state.wheelLabels === 'cof' ? CIRCLE_ORDER[i] : CAMELOT_MAJOR[i];
          svg.appendChild(outerText);

        // Inner ring = relative minors
        const innerPath = document.createElementNS(ns, 'path');
          innerPath.setAttribute('d', donutWedgePath(WHEEL_CX, WHEEL_CY, INNER_R, INNER_R_IN, start, end));
          const isSelInner = state.mode === 'minor' && i === state.keyIndex;
          innerPath.setAttribute('class', 'wedge inner' + (isSelInner ? ' selected' : ''));
          innerPath.addEventListener('click', () => selectKey(i, 'minor'));
          svg.appendChild(innerPath);

        const innerLabelPos = polar(WHEEL_CX, WHEEL_CY, (INNER_R + INNER_R_IN) / 2, mid);
          const innerText = document.createElementNS(ns, 'text');
          innerText.setAttribute('x', innerLabelPos.x);
          innerText.setAttribute('y', innerLabelPos.y);
          innerText.setAttribute('class', 'wedge-label inner-label' + (isSelInner ? ' selected' : ''));
          innerText.textContent = state.wheelLabels === 'cof' ? RELATIVE_MINOR[CIRCLE_ORDER[i]] : CAMELOT_MINOR[i];
          svg.appendChild(innerText);
  }
}

function selectKey(index, mode) {
      state.keyIndex = index;
      state.mode = mode;
      renderAll();
}

// --- Key readout --------------------------------------------------------

function renderKeyReadout() {
      const big = document.getElementById('key-readout-big');
      const sub = document.getElementById('key-readout-sub');
      const modeLabel = state.mode === 'major' ? 'Major' : 'Minor';
      big.textContent = `${currentTonicDisplay().replace('m', '')} ${modeLabel}`;

  const camelot = state.mode === 'major' ? CAMELOT_MAJOR[state.keyIndex] : CAMELOT_MINOR[state.keyIndex];
      const relative = state.mode === 'major'
        ? `relative: ${minorTonicDisplay()}`
              : `relative: ${majorTonicNote()} Major`;
      sub.textContent = `${relative} · Camelot ${camelot}`;

  document.getElementById('set-major').classList.toggle('active', state.mode === 'major');
      document.getElementById('set-minor').classList.toggle('active', state.mode === 'minor');
}

// --- Scales ---------------------------------------------------------------

const SCALE_TABS = [
    { key: 'diatonic', label: () => (state.mode === 'major' ? 'Major Scale' : 'Natural Minor Scale') },
    { key: 'majorPenta', label: () => 'Major Pentatonic' },
    { key: 'minorPenta', label: () => 'Minor Pentatonic' },
    { key: 'blues', label: () => 'Blues Scale' },
    ];

function renderScaleTabs() {
      const wrap = document.getElementById('scale-tabs');
      wrap.innerHTML = '';
      SCALE_TABS.forEach(tab => {
              const btn = document.createElement('button');
              btn.className = 'toggle-btn small' + (state.scaleType === tab.key ? ' active' : '');
              btn.textContent = tab.label();
              btn.addEventListener('click', () => { state.scaleType = tab.key; renderAll(); });
              wrap.appendChild(btn);
      });
}

function currentScaleNotesAndSet() {
      if (state.scaleType === 'diatonic') {
              const notes = state.mode === 'major' ? majorScaleNotes(majorTonicNote()) : minorScaleNotes(minorTonicDisplay());
              return { notes, pcSet: new Set(notes.map(pitchClass)), rootPc: pitchClass(currentTonicNote()) };
      }
      if (state.scaleType === 'majorPenta') {
              const root = majorTonicNote();
              return { notes: null, pcSet: scaleIntervalSet(root, 'majorPenta'), rootPc: pitchClass(root) };
      }
      if (state.scaleType === 'minorPenta') {
              const root = minorTonicNote();
              return { notes: null, pcSet: scaleIntervalSet(root, 'minorPenta'), rootPc: pitchClass(root) };
      }
      // blues
  const root = minorTonicNote();
      return { notes: null, pcSet: scaleIntervalSet(root, 'blues'), rootPc: pitchClass(root) };
}

function renderScaleNotes() {
      const el = document.getElementById('scale-notes');
      const { notes, pcSet, rootPc } = currentScaleNotesAndSet();
      const display = notes ? notes : [...pcSet].sort((a, b) => {
              const da = (a - rootPc + 12) % 12, db = (b - rootPc + 12) % 12;
              return da - db;
      }).map(chromaticName);

  el.innerHTML = '';
      display.forEach(n => {
              const pc = pitchClass(n) !== undefined ? pitchClass(n) : SHARP_NAMES.indexOf(n);
              const chip = document.createElement('span');
              chip.className = 'note-chip' + (pc === rootPc ? ' root' : '');
              chip.textContent = n;
              el.appendChild(chip);
      });
}

function renderFretboard() {
      const svg = document.getElementById('fretboard');
      svg.innerHTML = '';
      const ns = 'http://www.w3.org/2000/svg';
      const { pcSet, rootPc } = currentScaleNotesAndSet();

  const frets = 12;
      const leftPad = 40, rightPad = 20, topPad = 20, bottomPad = 20;
      const width = 900 - leftPad - rightPad;
      const height = 220 - topPad - bottomPad;
      const fretW = width / frets;
      const stringGap = height / 5;

  // Fret lines
  for (let f = 0; f <= frets; f++) {
          const x = leftPad + f * fretW;
          const line = document.createElementNS(ns, 'line');
          line.setAttribute('x1', x); line.setAttribute('x2', x);
          line.setAttribute('y1', topPad); line.setAttribute('y2', topPad + height);
          line.setAttribute('class', f === 0 ? 'nut' : 'fret-line');
          svg.appendChild(line);
  }
      // Inlay markers
  [3, 5, 7, 9].forEach(f => {
          const cx = leftPad + (f - 0.5) * fretW;
          const dot = document.createElementNS(ns, 'circle');
          dot.setAttribute('cx', cx); dot.setAttribute('cy', topPad + height + 10); dot.setAttribute('r', 3);
          dot.setAttribute('class', 'inlay');
          svg.appendChild(dot);
  });

  // Strings (row 0 = low E at top)
  for (let s = 0; s < 6; s++) {
          const y = topPad + s * stringGap;
          const line = document.createElementNS(ns, 'line');
          line.setAttribute('x1', leftPad); line.setAttribute('x2', leftPad + width);
          line.setAttribute('y1', y); line.setAttribute('y2', y);
          line.setAttribute('class', 'string-line');
          svg.appendChild(line);

        for (let f = 0; f <= frets; f++) {
                  const pc = (OPEN_STRING_PC[s] + f) % 12;
                  if (!pcSet.has(pc)) continue;
                  const x = f === 0 ? leftPad - 14 : leftPad + (f - 0.5) * fretW;
                  const dot = document.createElementNS(ns, 'circle');
                  dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 9);
                  dot.setAttribute('class', 'note-dot' + (pc === rootPc ? ' root' : ''));
                  svg.appendChild(dot);

            const label = document.createElementNS(ns, 'text');
                  label.setAttribute('x', x); label.setAttribute('y', y + 3.5);
                  label.setAttribute('class', 'note-dot-label');
                  label.textContent = chromaticName(pc);
                  svg.appendChild(label);
        }
  }
}

// --- Pentatonic shapes ---------------------------------------------------

function pentaBoxSvg(box, rootPc) {
      const ns = 'http://www.w3.org/2000/svg';
      const allFrets = box.frets.flat();
      const minFret = Math.min(...allFrets);
      const maxFret = Math.max(...allFrets);
      const cells = maxFret - minFret;

  const w = 140, h = 170;
      const leftPad = 20, topPad = 26, rightPad = 10, bottomPad = 10;
      const gridW = w - leftPad - rightPad, gridH = h - topPad - bottomPad;
      const stringGap = gridW / 5;
      const fretGap = gridH / cells;

  const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('class', 'pentabox-diagram');

  const posLabel = document.createElementNS(ns, 'text');
      posLabel.setAttribute('x', 2);
      posLabel.setAttribute('y', topPad - 10);
      posLabel.setAttribute('class', 'fret-num');
      posLabel.textContent = minFret === 0 ? 'open' : (minFret + 1) + 'fr';
      svg.appendChild(posLabel);

  for (let s = 0; s < 6; s++) {
          const x = leftPad + s * stringGap;
          const line = document.createElementNS(ns, 'line');
          line.setAttribute('x1', x); line.setAttribute('x2', x);
          line.setAttribute('y1', topPad); line.setAttribute('y2', topPad + gridH);
          line.setAttribute('class', 'chord-string');
          svg.appendChild(line);
  }
      for (let fr = 0; fr <= cells; fr++) {
              const y = topPad + fr * fretGap;
              const line = document.createElementNS(ns, 'line');
              line.setAttribute('x1', leftPad); line.setAttribute('x2', leftPad + gridW);
              line.setAttribute('y1', y); line.setAttribute('y2', y);
              line.setAttribute('class', (fr === 0 && minFret === 0) ? 'chord-nut' : 'chord-fret');
              svg.appendChild(line);
      }

  box.frets.forEach((pair, s) => {
          const x = leftPad + s * stringGap;
          pair.forEach(fret => {
                    const rowIndex = fret - minFret;
                    const y = topPad + (rowIndex + 0.5) * fretGap;
                    const pc = (OPEN_STRING_PC[s] + fret) % 12;
                    const dot = document.createElementNS(ns, 'circle');
                    dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 7);
                    dot.setAttribute('class', 'penta-dot' + (pc === rootPc ? ' root' : ''));
                    svg.appendChild(dot);
          });
  });

  return svg;
}

function renderPentatonicShapes() {
      const wrap = document.getElementById('pentatonic-shapes');
      wrap.innerHTML = '';
      const root = minorTonicNote();
      const rootPc = pitchClass(root);
      const boxes = pentatonicBoxShapes(root);

  boxes.forEach(box => {
          const card = document.createElement('div');
          card.className = 'pentabox-card';

                    const label = document.createElement('div');
          label.className = 'pentabox-label';
          label.textContent = `Shape ${box.number}`;
          card.appendChild(label);

                    card.appendChild(pentaBoxSvg(box, rootPc));
          wrap.appendChild(card);
  });
}

// --- Chords -----------------------------------------------------------

const QUALITY_SUFFIX = {
      maj: '', min: 'm', dim: '°',
      maj7: 'maj7', min7: 'm7', dom7: '7', m7b5: 'm7♭5',
};

function chordName(chord) {
      return `${chord.root}${QUALITY_SUFFIX[chord.quality]}`;
}

function chordDiagramSvg(chord, size = 'normal') {
      const diagram = chordDiagram(chord.root, chord.quality);
      const w = size === 'small' ? 90 : 130, h = size === 'small' ? 100 : 145;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('class', 'chord-diagram');

  if (!diagram) {
          const text = document.createElementNS(ns, 'text');
          text.setAttribute('x', w / 2); text.setAttribute('y', h / 2);
          text.setAttribute('class', 'dim-note');
          text.textContent = 'dim — no shape';
          svg.appendChild(text);
          return svg;
  }

  const frets = diagram.frets;
      const showFrets = 4;
      const leftPad = 18, topPad = 24, rightPad = 10, bottomPad = 10;
      const gridW = w - leftPad - rightPad, gridH = h - topPad - bottomPad;
      const stringGap = gridW / 5;
      const fretGap = gridH / showFrets;

  // fret base = lowest non-null fret value (could be 0 for open chords)
  const playedFrets = frets.filter(f => f !== null);
      const minFret = Math.min(...playedFrets);
      const base = minFret === 0 ? 0 : minFret - 1;

  // position label if not starting at open position
  if (base > 0) {
          const label = document.createElementNS(ns, 'text');
          label.setAttribute('x', 2); label.setAttribute('y', topPad + fretGap * 0.7);
          label.setAttribute('class', 'fret-num');
          label.textContent = (base + 1) + 'fr';
          svg.appendChild(label);
  }

  // strings (vertical) 6..1 left to right
  for (let s = 0; s < 6; s++) {
          const x = leftPad + s * stringGap;
          const line = document.createElementNS(ns, 'line');
          line.setAttribute('x1', x); line.setAttribute('x2', x);
          line.setAttribute('y1', topPad); line.setAttribute('y2', topPad + gridH);
          line.setAttribute('class', 'chord-string');
          svg.appendChild(line);

        // open/mute marker above nut
        const f = frets[s];
          const markerY = topPad - 8;
          const marker = document.createElementNS(ns, 'text');
          marker.setAttribute('x', x); marker.setAttribute('y', markerY);
          marker.setAttribute('class', 'chord-marker');
          marker.textContent = f === null ? '×' : (f === 0 ? 'o' : '');
          svg.appendChild(marker);
  }

  // frets (horizontal)
  for (let fr = 0; fr <= showFrets; fr++) {
          const y = topPad + fr * fretGap;
          const line = document.createElementNS(ns, 'line');
          line.setAttribute('x1', leftPad); line.setAttribute('x2', leftPad + gridW);
          line.setAttribute('y1', y); line.setAttribute('y2', y);
          line.setAttribute('class', (fr === 0 && base === 0) ? 'chord-nut' : 'chord-fret');
          svg.appendChild(line);
  }

  // barre, if applicable (a true single-finger barre across the fret)
  if (diagram.barreFret > 0 && diagram.isBarre) {
          const fretsOnBarre = frets.map((f, i) => (f === diagram.barreFret ? i : -1)).filter(i => i >= 0);
          if (fretsOnBarre.length > 1) {
                    const rowIndex = diagram.barreFret - base;
                    const y = topPad + (rowIndex - 0.5) * fretGap;
                    const x1 = leftPad + Math.min(...fretsOnBarre) * stringGap;
                    const x2 = leftPad + Math.max(...fretsOnBarre) * stringGap;
                    const bar = document.createElementNS(ns, 'line');
                    bar.setAttribute('x1', x1); bar.setAttribute('x2', x2);
                    bar.setAttribute('y1', y); bar.setAttribute('y2', y);
                    bar.setAttribute('class', 'chord-barre');
                    svg.appendChild(bar);
          }
  }

  // finger dots
  frets.forEach((f, s) => {
          if (f === null || f === 0) return;
          const rowIndex = f - base;
          const x = leftPad + s * stringGap;
          const y = topPad + (rowIndex - 0.5) * fretGap;
          const dot = document.createElementNS(ns, 'circle');
          dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 7);
          dot.setAttribute('class', 'chord-dot');
          svg.appendChild(dot);
  });

  return svg;
}

function renderChordExtensionToggle() {
      const wrap = document.getElementById('chord-extension-toggle');
      wrap.innerHTML = '';
      [['triad', 'Triads'], ['seventh', '7th Chords']].forEach(([key, label]) => {
              const btn = document.createElement('button');
              btn.className = 'toggle-btn small' + (state.chordExtension === key ? ' active' : '');
              btn.textContent = label;
              btn.addEventListener('click', () => { state.chordExtension = key; renderDiatonicChords(); renderProgressionDetail(); });
              wrap.appendChild(btn);
      });
}

function renderDiatonicChords() {
      const wrap = document.getElementById('diatonic-chords');
      wrap.innerHTML = '';
      const chords = diatonicChords(currentTonicDisplay(), state.mode, state.chordExtension);

  chords.forEach(chord => {
          const card = document.createElement('div');
          card.className = 'chord-card';

                     const roman = document.createElement('div');
          roman.className = 'chord-roman';
          roman.textContent = chord.roman;
          card.appendChild(roman);

                     const name = document.createElement('div');
          name.className = 'chord-name';
          name.textContent = chordName(chord);
          card.appendChild(name);

                     card.appendChild(chordDiagramSvg(chord));
          wrap.appendChild(card);
  });
}

// --- Progressions -------------------------------------------------------

function renderProgressionList() {
      const wrap = document.getElementById('progression-list');
      wrap.innerHTML = '';
      const list = state.mode === 'major' ? MAJOR_PROGRESSIONS : MINOR_PROGRESSIONS;

  list.forEach((prog, i) => {
          const btn = document.createElement('button');
          btn.className = 'progression-btn' + (state.activeProgression === i ? ' active' : '');
          btn.textContent = prog.name;
          btn.addEventListener('click', () => { state.activeProgression = i; renderProgressionDetail(); highlightActiveProgButton(); });
          wrap.appendChild(btn);
  });
      renderProgressionDetail();
}

function highlightActiveProgButton() {
      const wrap = document.getElementById('progression-list');
      [...wrap.children].forEach((btn, i) => btn.classList.toggle('active', i === state.activeProgression));
}

function renderProgressionDetail() {
      const wrap = document.getElementById('progression-detail');
      wrap.innerHTML = '';
      const list = state.mode === 'major' ? MAJOR_PROGRESSIONS : MINOR_PROGRESSIONS;
      const prog = list[Math.min(state.activeProgression, list.length - 1)];
      if (!prog) return;
      const chords = diatonicChords(currentTonicDisplay(), state.mode, state.chordExtension);

  const row = document.createElement('div');
      row.className = 'progression-chords';
      prog.degrees.forEach(d => {
              const chord = chords[d];
              const card = document.createElement('div');
              card.className = 'chord-card small';
              const roman = document.createElement('div');
              roman.className = 'chord-roman';
              roman.textContent = chord.roman;
              card.appendChild(roman);
              const name = document.createElement('div');
              name.className = 'chord-name';
              name.textContent = chordName(chord);
              card.appendChild(name);
              card.appendChild(chordDiagramSvg(chord, 'small'));
              row.appendChild(card);
      });
      wrap.appendChild(row);
}

// --- Wire up static controls --------------------------------------------

document.getElementById('mode-cof').addEventListener('click', () => {
      state.wheelLabels = 'cof';
      document.getElementById('mode-cof').classList.add('active');
      document.getElementById('mode-camelot').classList.remove('active');
      renderWheel();
      renderKeyReadout();
});
document.getElementById('mode-camelot').addEventListener('click', () => {
      state.wheelLabels = 'camelot';
      document.getElementById('mode-camelot').classList.add('active');
      document.getElementById('mode-cof').classList.remove('active');
      renderWheel();
      renderKeyReadout();
});
document.getElementById('set-major').addEventListener('click', () => {
      if (state.mode === 'major') return;
      state.mode = 'major';
      renderAll();
});
document.getElementById('set-minor').addEventListener('click', () => {
      if (state.mode === 'minor') return;
      state.mode = 'minor';
      renderAll();
});

function renderAll() {
      renderWheel();
      renderKeyReadout();
      renderScaleTabs();
      renderScaleNotes();
      renderFretboard();
      renderPentatonicShapes();
      renderChordExtensionToggle();
      renderDiatonicChords();
      state.activeProgression = 0;
      renderProgressionList();
}

renderAll();
