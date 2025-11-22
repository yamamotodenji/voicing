import { useState, useCallback, useEffect } from 'react';
import { Voicing } from '../types/music';
import { generateSmoothVoicings } from '../utils/musicTheory';

// ボイシング生成を管理するカスタムフック
// コード進行からボイシングを生成するロジックをカプセル化します
export const useVoicingGenerator = () => {
    // ===== 状態管理 =====
    const [chordProgression, setChordProgression] = useState<string[]>([]);
    const [voicings, setVoicings] = useState<Voicing[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [voicingType, setVoicingType] = useState<'close' | 'open' | 'drop2' | 'drop3'>('close');

    // ボイシング生成関数
    // ユーザー入力または設定変更時に呼び出されます
    const generateVoicings = useCallback(async () => {
        if (chordProgression.length === 0) return;

        setIsLoading(true);

        try {
            // 音楽理論ユーティリティを使用してボイシングを計算
            // 計算コストが高い可能性があるため、将来的にはWeb Workerへの移行も検討可能です
            const generatedVoicings = generateSmoothVoicings(chordProgression, voicingType);
            setVoicings(generatedVoicings);
        } catch (error) {
            console.error('ボイシング生成エラー:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'ボイシングの生成に失敗しました。';
            alert(`エラー: ${errorMessage}\n\n無効なコード名が含まれている可能性があります。`);
        } finally {
            setIsLoading(false);
        }
    }, [chordProgression, voicingType]);

    // ボイシングタイプが変更されたら自動的に再生成
    // ユーザー体験を向上させるための自動更新ロジック
    useEffect(() => {
        if (chordProgression.length > 0 && voicings.length > 0) {
            generateVoicings();
        }
    }, [voicingType, generateVoicings]); // 依存配列に注意：必要な値が変わった時だけ実行

    return {
        chordProgression,
        voicings,
        isLoading,
        voicingType,
        setChordProgression,
        setVoicingType,
        generateVoicings
    };
};
