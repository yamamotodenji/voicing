export interface Note {
  name: string;
  octave: number;
  frequency: number;
}

export interface Chord {
  root: string;
  quality: string;
  extensions: string[];
  bass?: string;
}

export interface Voicing {
  notes: Note[];
  type: 'close' | 'open' | 'drop2' | 'drop3';
  position: number;
}

export interface ChordProgression {
  chords: string[];
  key: string;
  timeSignature: string;
}

export interface VoicingResult {
  chord: string;
  voicing: Voicing;
  position: number;
}

// 音楽理論の定数
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// コードクオリティの定義
export const CHORD_QUALITIES = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dominant: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  minorMajor7: [0, 3, 7, 11],
  diminished: [0, 3, 6],
  diminished7: [0, 3, 6, 9],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  '69': [0, 4, 7, 9, 14],
  m69: [0, 3, 7, 9, 14],
  '9': [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  '11': [0, 4, 7, 10, 14, 17],
  m11: [0, 3, 7, 10, 14, 17],
  maj11: [0, 4, 7, 11, 14, 17],
  '13': [0, 4, 7, 10, 14, 17, 21],
  m13: [0, 3, 7, 10, 14, 17, 21],
  maj13: [0, 4, 7, 11, 14, 17, 21]
};
