// ---------------------------------------------------------------------------
// Tiny Web Audio synth — oscillators with a plucky envelope, no sample
// files. Good enough to hear what a note or chord sounds like.
// ---------------------------------------------------------------------------

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Standard guitar tuning, open-string frequencies (Hz): E2 A2 D3 G3 B3 E4.
const OPEN_STRING_FREQ = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];

function fretFrequency(stringIndex, fret) {
  return OPEN_STRING_FREQ[stringIndex] * Math.pow(2, fret / 12);
}

// A4 = 440Hz reference; pc 9 = A.
function pitchClassFrequency(pc, octave = 4) {
  const semitoneFromA4 = (pc - 9) + (octave - 4) * 12;
  return 440 * Math.pow(2, semitoneFromA4 / 12);
}

function playTone(freq, startTime, duration = 0.9, gainPeak = 0.16) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// Play a single scale-degree note.
function playNote(pc, octave = 4) {
  const ctx = getAudioContext();
  playTone(pitchClassFrequency(pc, octave), ctx.currentTime);
}

// Play a real fretted voicing (frets[] indexed string6..1; null = muted),
// lightly strummed low to high.
function playChordFrets(frets) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  let strumIndex = 0;
  frets.forEach((fret, s) => {
    if (fret === null) return;
    const freq = fretFrequency(s, fret);
    playTone(freq, now + strumIndex * 0.03, 1.1, 0.14);
    strumIndex++;
  });
}

// Fallback chord playback (no fretted diagram available): just the chord
// tones as a quick block, one octave apart where needed to avoid mud.
function playChordTones(pcs) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  pcs.forEach((pc, i) => {
    playTone(pitchClassFrequency(pc, 3), now + i * 0.03, 1.1, 0.14);
  });
}

// Play a pentatonic box as an ascending run, low to high in pitch.
function playPentatonicBox(box) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const notes = [];
  box.frets.forEach((pair, s) => {
    pair.forEach(fret => notes.push(fretFrequency(s, fret)));
  });
  notes.sort((a, b) => a - b);
  notes.forEach((freq, i) => playTone(freq, now + i * 0.12, 0.5, 0.15));
}
