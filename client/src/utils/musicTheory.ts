// 音楽理論計算ユーティリティ
// コード解析、ボイシング生成、音程計算などの機能を提供

import { Note, Chord, Voicing, CHORD_QUALITIES, NOTE_NAMES } from '../types/music';

// ノート名から半音数を取得する関数
// 例: "C4" → 60, "F#3" → 54
export function noteToSemitone(noteName: string): number {
  // オクターブ番号を除去して音名のみを取得
  const note = noteName.replace(/[0-9]/g, ''); 
  // オクターブ番号を抽出（デフォルトは4）
  const octave = parseInt(noteName.replace(/[^0-9]/g, '')) || 4;
  // 音名から12音階でのインデックスを取得
  const noteIndex = NOTE_NAMES.indexOf(note);
  
  // 無効な音名の場合はエラーを投げる
  if (noteIndex === -1) {
    throw new Error(`無効なノート名: ${noteName}`);
  }
  
  // 半音数 = 音名インデックス + (オクターブ × 12)
  return noteIndex + (octave * 12);
}

// 半音数からノート情報を取得する関数
// 例: 60 → { name: "C", octave: 4, frequency: 261.63 }
export function semitoneToNote(semitone: number): Note {
  // MIDIノート番号60がC4に対応
  const octave = Math.floor(semitone / 12); // オクターブ番号を計算
  const noteIndex = semitone % 12;          // 12音階での位置を計算
  const noteName = NOTE_NAMES[noteIndex];   // 音名を取得
  
  return {
    name: noteName,
    octave: octave,
    // A4 = 440Hzを基準とした周波数計算
    frequency: 440 * Math.pow(2, (semitone - 69) / 12) 
  };
}

// コードシンボルを解析してChordオブジェクトに変換
// 例: "Cmaj7" → { root: "C", quality: "major7", extensions: [], bass: undefined }
export function parseChordSymbol(chordSymbol: string): Chord {
  const chord = chordSymbol.trim();
  
  // ルートノートを抽出（シャープ・フラット対応）
  let root = '';
  let remaining = chord;
  
  // シャープ・フラット付きの音名をチェック
  if (chord.startsWith('C#') || chord.startsWith('Db')) {
    root = chord.startsWith('C#') ? 'C#' : 'Db';
    remaining = chord.substring(2);
  } else if (chord.startsWith('D#') || chord.startsWith('Eb')) {
    root = chord.startsWith('D#') ? 'D#' : 'Eb';
    remaining = chord.substring(2);
  } else if (chord.startsWith('F#') || chord.startsWith('Gb')) {
    root = chord.startsWith('F#') ? 'F#' : 'Gb';
    remaining = chord.substring(2);
  } else if (chord.startsWith('G#') || chord.startsWith('Ab')) {
    root = chord.startsWith('G#') ? 'G#' : 'Ab';
    remaining = chord.substring(2);
  } else if (chord.startsWith('A#') || chord.startsWith('Bb')) {
    root = chord.startsWith('A#') ? 'A#' : 'Bb';
    remaining = chord.substring(2);
  } else {
    // ナチュラル音名の場合
    root = chord[0];
    remaining = chord.substring(1);
  }
  
  // コードクオリティを判定（優先順位順）
  let quality = 'major'; // デフォルトはメジャー
  const extensions: string[] = [];
  
  // 7thコードの判定（maj7 > m7 > 7の順）
  if (remaining.includes('maj7') || remaining.includes('M7')) {
    quality = 'major7';
    remaining = remaining.replace(/maj7|M7/g, '');
  } else if (remaining.includes('m7')) {
    quality = 'minor7';
    remaining = remaining.replace('m7', '');
  } else if (remaining.includes('7')) {
    quality = 'dominant';
    remaining = remaining.replace('7', '');
  } else if (remaining.includes('m')) {
    // 3和音のマイナー
    quality = 'minor';
    remaining = remaining.replace('m', '');
  } else if (remaining.includes('dim')) {
    quality = 'diminished';
    remaining = remaining.replace('dim', '');
  } else if (remaining.includes('aug')) {
    quality = 'augmented';
    remaining = remaining.replace('aug', '');
  } else if (remaining.includes('sus2')) {
    quality = 'sus2';
    remaining = remaining.replace('sus2', '');
  } else if (remaining.includes('sus4')) {
    quality = 'sus4';
    remaining = remaining.replace('sus4', '');
  }
  
  // テンション（9th, 11th, 13thなど）を抽出
  const tensionMatches = remaining.match(/(\d+)/g);
  if (tensionMatches) {
    extensions.push(...tensionMatches);
  }
  
  return {
    root,
    quality,
    extensions,
    bass: undefined
  };
}

// コードの構成音を生成する関数
// 例: { root: "C", quality: "major7" } → [C4, E4, G4, B4]
export function generateChordNotes(chord: Chord, octave: number = 4): Note[] {
  // ルート音の半音数を取得
  const rootSemitone = noteToSemitone(chord.root + octave);
  // コードクオリティに対応する音程を取得
  const intervals = CHORD_QUALITIES[chord.quality as keyof typeof CHORD_QUALITIES] || CHORD_QUALITIES.major;
  
  // 基本構成音を生成
  const notes: Note[] = intervals.map(interval => {
    const semitone = rootSemitone + interval;
    return semitoneToNote(semitone);
  });
  
  // テンション（9th, 11th, 13thなど）を追加
  chord.extensions.forEach(ext => {
    const tensionInterval = parseInt(ext);
    // 7度より上の音（テンション）の場合のみ追加
    if (tensionInterval > 7) {
      // オクターブオフセットを計算（9th=2オクターブ上、11th=2オクターブ上、13th=2オクターブ上）
      const octaveOffset = Math.floor((tensionInterval - 1) / 7) * 12;
      // オクターブ内での音程を計算
      const intervalInOctave = ((tensionInterval - 1) % 7) + 1;
      // テンション音の半音数を計算
      const tensionSemitone = rootSemitone + octaveOffset + intervalInOctave;
      notes.push(semitoneToNote(tensionSemitone));
    }
  });
  
  return notes;
}

// 音楽理論に基づいた4和音ボイシング生成
function createFourNoteVoicing(notes: Note[]): Note[] {
  if (notes.length >= 4) {
    return notes.slice(0, 4);
  }
  
  // 3和音の場合は音楽理論に基づいて4和音にする
  if (notes.length === 3) {
    const [root, third, fifth] = notes;
    
    // 音楽理論ルールに基づく重複パターン
    // 1. 根音を重複させる（原則）
    // 2. 次いで第5音を重複させる
    // 3. 導音の重複は避ける
    
    // オクターブ5を超えないように制限（より実用的な音域）
    const rootOctave = root.octave + 1;
    const adjustedRootOctave = rootOctave <= 5 ? rootOctave : 5;
    
    return [
      root, // 根音（バス）
      fifth, // 第5音
      third, // 第3音
      semitoneToNote(noteToSemitone(root.name + adjustedRootOctave)) // 根音（1オクターブ上、制限あり）
    ];
  }
  
  // 2和音以下の場合は根音を重複（オクターブ制限あり）
  const result = [...notes];
  while (result.length < 4) {
    const rootNote = result[0]; // 根音を重複
    const newOctave = rootNote.octave + 1;
    const adjustedOctave = newOctave <= 5 ? newOctave : 5; // オクターブ5を超えないように制限
    const duplicatedNote = semitoneToNote(noteToSemitone(rootNote.name + adjustedOctave));
    result.push(duplicatedNote);
  }
  return result.slice(0, 4);
}

// ボイシングを生成する関数
// コードの構成音を異なる配置（close, open, drop2, drop3）で配置
export function generateVoicing(chord: Chord, type: 'close' | 'open' | 'drop2' | 'drop3' = 'close', octave: number = 4): Voicing {
  // コードの構成音を取得
  const notes = generateChordNotes(chord, octave);
  
  switch (type) {
    case 'close':
      // クローズボイシング（密集配置）
      // 各音が隣接する音程で配置される
      return {
        notes: createFourNoteVoicing(notes),
        type: 'close',
        position: 0
      };
      
    case 'open':
      // オープンボイシング（開離配置）
      // 上三声の間隔を和音の構成音1つ分ずつ空けた配置
      const openNotes = createFourNoteVoicing(notes);
      if (openNotes.length >= 4) {
        // 適度な開離配置（オクターブ5を超えないように制限）
        const currentOctave = openNotes[3].octave;
        if (currentOctave < 5) {
          openNotes[3] = semitoneToNote(noteToSemitone(openNotes[3].name + (openNotes[3].octave + 1)));
        }
      }
      return {
        notes: openNotes,
        type: 'open',
        position: 0
      };
      
    case 'drop2':
      // Drop 2ボイシング
      // 2番目の音を1オクターブ下げる配置
      // 音楽理論的により自然な響きを提供
      const drop2Notes = createFourNoteVoicing(notes);
      if (drop2Notes.length >= 2) {
        drop2Notes[1] = semitoneToNote(noteToSemitone(drop2Notes[1].name + (drop2Notes[1].octave - 1)));
      }
      return {
        notes: drop2Notes,
        type: 'drop2',
        position: 0
      };
      
    case 'drop3':
      // Drop 3ボイシング
      // 3番目の音を1オクターブ下げる配置
      // より広い音域での響きを提供
      const drop3Notes = createFourNoteVoicing(notes);
      if (drop3Notes.length >= 3) {
        drop3Notes[2] = semitoneToNote(noteToSemitone(drop3Notes[2].name + (drop3Notes[2].octave - 1)));
      }
      return {
        notes: drop3Notes,
        type: 'drop3',
        position: 0
      };
      
    default:
      // デフォルトはクローズボイシング
      return {
        notes: createFourNoteVoicing(notes),
        type: 'close',
        position: 0
      };
  }
}

// 音楽理論に基づいたスムーズなボイスリーディングを生成
export function generateSmoothVoicings(chordProgression: string[], voicingType: 'close' | 'open' | 'drop2' | 'drop3' = 'close'): Voicing[] {
  const voicings: Voicing[] = [];
  
  for (let i = 0; i < chordProgression.length; i++) {
    const chord = parseChordSymbol(chordProgression[i]);
    const voicing = generateVoicing(chord, voicingType, 4);
    voicing.position = i + 1;
    voicings.push(voicing);
  }
  
  // 音楽理論に基づくスムーズなボイスリーディングの調整
  for (let i = 1; i < voicings.length; i++) {
    const prevVoicing = voicings[i - 1];
    const currentVoicing = voicings[i];
    
    // 1. 順次進行を優先（跳躍を避ける）
    // 2. バスと上三声を反行させる
    // 3. 連続8度・連続5度を避ける
    // 4. 並達8度・並達5度を避ける
    
    // 各声部の最適なオクターブを計算
    for (let j = 0; j < Math.min(prevVoicing.notes.length, currentVoicing.notes.length); j++) {
      const prevNote = prevVoicing.notes[j];
      const currentNote = currentVoicing.notes[j];
      
      // 前の音との距離を計算
      const prevSemitone = noteToSemitone(prevNote.name + prevNote.octave);
      const currentSemitone = noteToSemitone(currentNote.name + currentNote.octave);
      const interval = Math.abs(currentSemitone - prevSemitone);
      
      // 音楽理論ルールに基づく調整
      if (interval > 7) { // 完全5度を超える跳躍
        // オクターブを調整して順次進行に近づける
        const adjustedOctave = currentNote.octave + (currentSemitone > prevSemitone ? -1 : 1);
        
        // オクターブ5を超えないように制限
        if (adjustedOctave <= 5) {
          const adjustedSemitone = noteToSemitone(currentNote.name + adjustedOctave);
          const adjustedInterval = Math.abs(adjustedSemitone - prevSemitone);
          
          // 調整後の方が良い場合（より順次に近い）は適用
          if (adjustedInterval < interval && adjustedInterval <= 4) {
            currentVoicing.notes[j] = {
              ...currentNote,
              octave: adjustedOctave,
              frequency: 440 * Math.pow(2, (adjustedSemitone - 69) / 12)
            };
          }
        }
      }
    }
    
    // 連続8度・連続5度のチェックと修正
    for (let j = 0; j < currentVoicing.notes.length - 1; j++) {
      for (let k = j + 1; k < currentVoicing.notes.length; k++) {
        const note1 = currentVoicing.notes[j];
        const note2 = currentVoicing.notes[k];
        const prevNote1 = prevVoicing.notes[j];
        const prevNote2 = prevVoicing.notes[k];
        
        // 連続8度・連続5度のチェック
        const currentInterval = Math.abs(noteToSemitone(note1.name + note1.octave) - noteToSemitone(note2.name + note2.octave)) % 12;
        const prevInterval = Math.abs(noteToSemitone(prevNote1.name + prevNote1.octave) - noteToSemitone(prevNote2.name + prevNote2.octave)) % 12;
        
        // 連続8度（0度）または連続5度（7度）を避ける
        if ((prevInterval === 0 || prevInterval === 7) && (currentInterval === 0 || currentInterval === 7)) {
          // オクターブを調整して禁則を回避（オクターブ5を超えないように制限）
          const adjustedOctave = note2.octave + 1;
          if (adjustedOctave <= 5) {
            currentVoicing.notes[k] = {
              ...note2,
              octave: adjustedOctave,
              frequency: 440 * Math.pow(2, (noteToSemitone(note2.name + adjustedOctave) - 69) / 12)
            };
          }
        }
      }
    }
  }
  
  return voicings;
}
