# Guitar Theory Companion — PRD

Oct 28, 2026 · @Ant

## Overview

Guitar Theory Companion is a free reference site for early-intermediate guitarists who already know open chords and want to understand the theory behind what they're playing. Pick a key on an interactive circle-of-fifths (or Camelot) wheel and instantly see that key's scales, diatonic chords, and common chord progressions, each with a playable fretboard or chord diagram. It's a look-it-up-and-go tool, not a course.

## Goals & success metrics

Success isn't "I use it" — it's **other players finding it useful enough to come back to and share**.

- Signal: unprompted use by people outside the immediate circle (a bandmate, a forum link, a friend bookmarking it).
- Signal: repeat visits to the same browser (trackable later via lightweight analytics, not built in V1).
- Anti-goal: optimizing for feature count over whether a given feature actually gets used.

## Target audience

Early-intermediate guitarists: comfortable with basic open chords and simple strumming, but shaky on *why* those chords go together. They've hit the ceiling of "learn songs by tab" and want to understand keys, scales, and chord theory well enough to start writing or improvising — without sitting through a full course.

## Core user loop

This is a **reference tool**, not a destination people linger in by default:

1. Arrive with a specific question ("what chords go with G major?", "what's the minor pentatonic in D?").
2. Select the key on the wheel.
3. Scan the scale/chord/progression answer, glance at the diagram.
4. Leave — often back to their instrument.

Speed and clarity of that single lookup matter more than session length or feature depth.

## Scope

| Feature | Status | Notes |
| --- | --- | --- |
| Circle of fifths wheel | Built (V1) | Interactive, 24 segments (12 major + 12 relative minor) |
| Camelot wheel toggle | Built (V1) | Same wheel, DJ-notation labels |
| Scales (major, natural minor, pentatonics, blues) | Built (V1) | Note chips + fretboard diagram |
| Diatonic chords | Built (V1) | Triads with chord diagrams (open-shape where familiar, movable barre otherwise) |
| Chord progressions | Built (V1) | Common progressions per key, major and minor |
| 7th chords & extensions | Built (V1.1) | maj7/min7/dom7 etc. — more useful past basic triads, especially for jazz/R&B-leaning players |
| Pentatonic shapes | Built (V1.1) | 5 minor-pentatonic box shapes, derived from the scale's own interval math (not memorized tab); click a shape to hear it as an ascending run |
| Audio playback | Built (V1.1) | Web Audio synth, no sample files — every note chip, fretboard dot, chord card, and pentatonic shape is clickable to hear |
| Song examples per progression | Built (V1.1) | 5 well-known songs listed under each progression, major and minor |
| Section explainer text | Built (V1.1) | Short usage blurb under each panel heading, explaining what it's for and how to use it |
| Save / bookmark keys | Next | Local-only (browser storage), no accounts — decided |
| Accounts / cross-device sync | Deferred | Only if local-only bookmarking proves insufficient |

## Non-goals

Explicitly not building, even if they'd be cool:

- **Ear training / quizzes** — no "name this interval" style interactive exercises.
- **Multi-instrument support** — guitar only. Not generalizing to piano, bass, ukulele.
- **Tab or notation rendering** — not a tab viewer or sheet-music tool.
- **Accounts/backend infrastructure** — not until local-only storage proves insufficient (see Open Questions).

## Feature breakdown

**Circle of fifths / Camelot wheel** — 24-segment SVG wheel (outer ring = 12 major keys, inner ring = relative minors). Click any segment to select that key and mode. A toggle switches the label set between standard note names (circle of fifths) and DJ Camelot codes (e.g. "8B"), same underlying wheel.

**Scales** — For the selected key: major scale or natural minor (whichever matches the selected mode), plus major pentatonic, minor pentatonic, and blues scale, always available regardless of mode. Notes shown as chips (root highlighted) and plotted on a 12-fret fretboard diagram across all six strings.

**Diatonic chords** — All seven triads of the selected key (I–vii° or i–VII), each with a roman-numeral label, chord name, and a chord diagram. Diagrams use real open-position shapes where guitarists would actually learn them (C, G, D, Dm, plus any chord that's naturally open E/A/Em/Am), and movable barre shapes (E-shape/A-shape) everywhere else, picking whichever sits at the lowest fret. Diminished chords show as text only (no stock diagram).

**Chord progressions** — A curated list of common progressions per key (different sets for major vs. minor), selectable by name (e.g. "Pop (I–V–vi–IV)"), rendering the actual chords for the current key in sequence with diagrams.

**7th chords & extensions** — maj7, min7, dom7 and half-diminished (m7♭5) chord tones and fretted shapes, layered onto the existing diatonic-chord engine. Surfaces as a "Triads / 7th Chords" toggle on the Diatonic Chords panel, applied consistently to progressions too.

**Pentatonic shapes** — The 5 standard minor-pentatonic box positions, computed directly from the scale's interval structure (not hand-copied tab) so they're correct for any key. Click a shape to hear it played as an ascending run.

**Audio playback** — A small Web Audio synth (oscillators + a plucky envelope, no sample files) wired into every clickable element: note chips, fretboard dots, diatonic/progression chord cards (using the real fretted voicing), and pentatonic shapes.

**Song examples per progression** — Each of the 12 common progressions (7 major, 5 minor) lists 5 well-known songs commonly cited as using it, as a starting point for ear-training rather than a claim of exact transcription.

**Section explainer text** — A short blurb under each panel's heading explaining what the section is and how to use it, aimed at the early-intermediate audience who may not know the jargon yet.

**Save / bookmark (next)** — Let a user mark keys, scales, or progressions to return to quickly. Implementation approach is an open question (see below).

## Platform & design

Desktop-first: most practice happens at a desk with the site open alongside a guitar. Layout, wheel size, and fretboard width are tuned for desktop/laptop screens first; mobile should remain usable (no broken layout) but isn't the optimization target for V1.

Visual style: dark theme suited to a practice-room environment — low glare, high contrast on the diagrams, accent colors reserved for the selected key and root notes so the eye finds the answer fast.

## Technical notes

- Static site: plain HTML/CSS/vanilla JS, no build step, no framework.
- `theory.js` holds the music-theory engine (pitch classes, key-correct scale spelling, diatonic chord generation, Camelot mapping, movable chord-shape math); `app.js` is pure rendering/state on top of it.
- Hosted on GitHub Pages, repo `AntM1-LFC/guitar-learning`.
- No backend, no database, no auth in V1 — everything computed client-side from the theory engine.

## Timeline

Shippable V1 shipped 2026-10-28, within that working session: wheel, scales, diatonic chords, progressions, hosted live on GitHub Pages. Fast-follows landed the same day: 7th chords, the 5 pentatonic box shapes, click-to-hear audio on every note/chord/shape, 5 example songs per progression, and short usage blurbs on each panel. Save/bookmark and deeper mobile polish remain open.

## Open questions

- [ ] \~\~Save/bookmark approach\~\~ — decided: local-only (browser storage), no accounts for V1.
- [ ] How much mobile polish is enough for "usable but not optimized"? Needs a concrete bar before it's built.
- [ ] \~\~Where do 7th-chord diagrams fit visually\~\~ — decided: a "Triads / 7th Chords" toggle on the existing Diatonic Chords panel, applied to progressions too.
