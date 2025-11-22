import { useState, useCallback } from 'react';
import { Voicing } from '../types/music';
import { audioPlayer } from '../utils/audioPlayer';

// オーディオ再生機能を管理するカスタムフック
// App.tsxから再生ロジックを分離し、再利用性とテスト容易性を向上させます
export const useAudioPlayer = () => {
    // ===== 状態管理 =====
    // 再生状態
    const [isPlaying, setIsPlaying] = useState(false);
    // オーディオ初期化状態
    const [isAudioInitialized, setIsAudioInitialized] = useState(false);
    // テンポ (BPM)
    const [tempo, setTempo] = useState(120);
    // 音量 (0-24)
    const [volume, setVolume] = useState(12);

    // ===== アクション =====

    // オーディオの初期化
    // ブラウザのポリシーにより、ユーザー操作（クリック等）をトリガーとして実行する必要があります
    const initializeAudio = useCallback(async () => {
        try {
            await audioPlayer.initialize();
            setIsAudioInitialized(true);
            // 初期設定の適用
            audioPlayer.setVolume(volume - 50); // -50 to 0 の範囲に変換
            audioPlayer.setTempo(tempo);
        } catch (error) {
            console.error('オーディオ初期化エラー:', error);
            alert('オーディオの初期化に失敗しました。ブラウザの設定を確認してください。');
        }
    }, [volume, tempo]);

    // 単一ボイシングの再生
    const playVoicing = useCallback((voicing: Voicing) => {
        if (!isAudioInitialized) {
            alert('まずオーディオを初期化してください。');
            return;
        }
        audioPlayer.playVoicing(voicing, '2n');
    }, [isAudioInitialized]);

    // コード進行全体の再生
    const playProgression = useCallback((voicings: Voicing[]) => {
        if (!isAudioInitialized) {
            alert('まずオーディオを初期化してください。');
            return;
        }

        if (voicings.length === 0) return;

        setIsPlaying(true);
        audioPlayer.playProgression(voicings, tempo, () => {
            setIsPlaying(false);
        });
    }, [isAudioInitialized, tempo]);

    // 再生停止
    const stopPlayback = useCallback(() => {
        audioPlayer.stopAll();
        setIsPlaying(false);
    }, []);

    // テンポ変更
    const handleTempoChange = useCallback((newTempo: number) => {
        setTempo(newTempo);
        if (isAudioInitialized) {
            audioPlayer.setTempo(newTempo);
        }
    }, [isAudioInitialized]);

    // 音量変更
    const handleVolumeChange = useCallback((newVolume: number) => {
        setVolume(newVolume);
        if (isAudioInitialized) {
            audioPlayer.setVolume(newVolume - 50);
        }
    }, [isAudioInitialized]);

    return {
        isPlaying,
        isAudioInitialized,
        tempo,
        volume,
        initializeAudio,
        playVoicing,
        playProgression,
        stopPlayback,
        setTempo: handleTempoChange,
        setVolume: handleVolumeChange
    };
};
