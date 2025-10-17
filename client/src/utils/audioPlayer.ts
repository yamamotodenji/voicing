import * as Tone from 'tone';
import { Note, Voicing } from '../types/music';

class AudioPlayer {
  private synth: Tone.PolySynth;
  private isInitialized = false;

  constructor() {
    // ポリシンセサイザーを作成（最大8音同時発音）
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.3,
        release: 1.0
      }
    }).toDestination();

    // 音量を調整
    this.synth.volume.value = -12;
  }

  // オーディオコンテキストを初期化
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await Tone.start();
      this.isInitialized = true;
      console.log('オーディオプレイヤーが初期化されました');
    } catch (error) {
      console.error('オーディオ初期化エラー:', error);
      throw error;
    }
  }

  // 単一のノートを再生
  playNote(note: Note, duration: string = '4n'): void {
    if (!this.isInitialized) {
      console.warn('オーディオプレイヤーが初期化されていません');
      return;
    }

    const noteString = `${note.name}${note.octave}`;
    this.synth.triggerAttackRelease(noteString, duration);
  }

  // ボイシングを再生
  playVoicing(voicing: Voicing, duration: string = '2n'): void {
    if (!this.isInitialized) {
      console.warn('オーディオプレイヤーが初期化されていません');
      return;
    }

    const noteStrings = voicing.notes.map(note => `${note.name}${note.octave}`);
    this.synth.triggerAttackRelease(noteStrings, duration);
  }

  // コード進行を順次再生
  async playProgression(voicings: Voicing[], tempo: number = 120): Promise<void> {
    if (!this.isInitialized) {
      console.warn('オーディオプレイヤーが初期化されていません');
      return;
    }

    // テンポを設定
    Tone.Transport.bpm.value = tempo;

    // 各ボイシングを順次再生
    for (let i = 0; i < voicings.length; i++) {
      const voicing = voicings[i];
      const time = `+${i * 2}n`; // 2分音符間隔
      
      const noteStrings = voicing.notes.map(note => `${note.name}${note.octave}`);
      this.synth.triggerAttackRelease(noteStrings, '2n', time);
    }
  }

  // コード進行をループ再生
  startLoop(voicings: Voicing[], tempo: number = 120): void {
    if (!this.isInitialized) {
      console.warn('オーディオプレイヤーが初期化されていません');
      return;
    }

    Tone.Transport.bpm.value = tempo;
    Tone.Transport.cancel();

    // ループパターンを作成
    const pattern = new Tone.Pattern((time, note) => {
      this.synth.triggerAttackRelease(note, '2n', time);
    }, voicings.map(v => v.notes.map(note => `${note.name}${note.octave}`)), 'up');

    pattern.interval = '2n';
    pattern.start(0);
    Tone.Transport.start();
  }

  // ループを停止
  stopLoop(): void {
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }

  // 全ての音を停止
  stopAll(): void {
    this.synth.releaseAll();
    Tone.Transport.stop();
  }

  // 楽器音色を変更
  setInstrument(type: 'piano' | 'synth' | 'organ' | 'strings'): void {
    this.synth.dispose();
    
    switch (type) {
      case 'piano':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'sine'
          },
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.3,
            release: 1.0
          }
        }).toDestination();
        break;
        
      case 'synth':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'sawtooth'
          },
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.3,
            release: 1.0
          }
        }).toDestination();
        break;
        
      case 'organ':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'square'
          },
          envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.8,
            release: 0.5
          }
        }).toDestination();
        break;
        
      case 'strings':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'triangle'
          },
          envelope: {
            attack: 0.5,
            decay: 0.2,
            sustain: 0.7,
            release: 2.0
          }
        }).toDestination();
        break;
    }
    
    this.synth.volume.value = -12;
  }

  // 音量を調整
  setVolume(volume: number): void {
    this.synth.volume.value = volume;
  }

  // テンポを設定
  setTempo(tempo: number): void {
    Tone.Transport.bpm.value = tempo;
  }
}

// シングルトンインスタンス
export const audioPlayer = new AudioPlayer();
