// オーディオ再生ユーティリティ
// Tone.jsライブラリを使用してWeb Audio APIを簡単に操作

import * as Tone from 'tone';
import { Voicing } from '../types/music';

// オーディオプレイヤークラス
// 音楽理論で生成されたボイシングを実際に音として再生する機能を提供
class AudioPlayer {
  // ポリシンセサイザー（複数の音を同時に発音可能）
  private synth: Tone.PolySynth;
  // オーディオコンテキストの初期化状態を管理
  private isInitialized = false;

  constructor() {
    // オルガン音色のポリシンセサイザーを作成（最大8音同時発音）
    this.synth = new Tone.PolySynth(Tone.Synth, {
      // オシレーター設定（音色の種類）
      oscillator: {
        type: 'square'  // 矩形波（オルガンに近い音色）
      },
      // エンベロープ設定（音の立ち上がり・減衰の制御）
      envelope: {
        attack: 0.01,   // アタック時間（音が立ち上がる時間）
        decay: 0.1,     // ディケイ時間（ピークからサステインレベルまで）
        sustain: 0.8,   // サステインレベル（継続音の音量）
        release: 0.5    // リリース時間（音が消える時間）
      }
    }).toDestination(); // 出力先を設定

    // 音量を調整（デフォルトは控えめに）
    // dB値で設定（-24dB = 約1/4の音量）
    this.synth.volume.value = -24;
  }

  // オーディオコンテキストを初期化
  // ブラウザのオーディオAPIを有効化（ユーザーインタラクションが必要）
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Tone.jsのオーディオコンテキストを開始
      await Tone.start();
      this.isInitialized = true;
      console.log('オーディオプレイヤーが初期化されました');
    } catch (error) {
      console.error('オーディオ初期化エラー:', error);
      throw error;
    }
  }

  // ボイシングを再生する関数
  // 例: playVoicing(voicing, '2n') → 2分音符の長さで再生
  playVoicing(voicing: Voicing, duration: string = '2n'): void {
    if (!this.isInitialized) {
      console.warn('オーディオプレイヤーが初期化されていません');
      return;
    }

    // ノートオブジェクトをTone.js形式の文字列に変換
    // 例: [{name: "C", octave: 4}] → ["C4"]
    const noteStrings = voicing.notes.map(note => `${note.name}${note.octave}`);
    // 複数の音を同時に発音
    this.synth.triggerAttackRelease(noteStrings, duration);
  }

  // コード進行を順次再生する関数
  // 各ボイシングを指定したテンポで順番に再生
  async playProgression(voicings: Voicing[], tempo: number = 120): Promise<void> {
    if (!this.isInitialized) {
      console.warn('オーディオプレイヤーが初期化されていません');
      return;
    }

    // テンポを設定（BPM = Beats Per Minute）
    Tone.Transport.bpm.value = tempo;

    // 各ボイシングを順次再生
    for (let i = 0; i < voicings.length; i++) {
      const voicing = voicings[i];
      // 時間を指定（2分音符間隔で配置）
      const time = `+${i * 2}n`; // +0n, +2n, +4n, +6n...
      
      // ノートを文字列形式に変換
      const noteStrings = voicing.notes.map(note => `${note.name}${note.octave}`);
      // 指定した時間に再生をスケジュール
      this.synth.triggerAttackRelease(noteStrings, '2n', time);
    }
  }

  // 全ての音を停止する関数
  stopAll(): void {
    // 現在発音中の音をすべて停止
    this.synth.releaseAll();
    // トランスポート（再生スケジュール）を停止
    Tone.Transport.stop();
  }

  // 音量を調整する関数
  // 引数: 音量（dB値、負の値で指定）
  setVolume(volume: number): void {
    this.synth.volume.value = volume;
  }

  // テンポを設定する関数
  // 引数: BPM（Beats Per Minute）
  setTempo(tempo: number): void {
    Tone.Transport.bpm.value = tempo;
  }
}

// シングルトンインスタンス
// アプリケーション全体で1つのオーディオプレイヤーインスタンスを共有
export const audioPlayer = new AudioPlayer();
