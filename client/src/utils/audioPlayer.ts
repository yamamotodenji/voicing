import * as Tone from 'tone';
import { Voicing } from '../types/music';

class AudioPlayer {
  private synth: Tone.PolySynth;
  private isInitialized = false;

  constructor() {
    // オルガン音色のポリシンセサイザーを作成（最大8音同時発音）
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

    // 音量を調整（デフォルトは控えめに）
    this.synth.volume.value = -24;
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


  // 全ての音を停止
  stopAll(): void {
    this.synth.releaseAll();
    Tone.Transport.stop();
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
