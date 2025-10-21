// メインアプリケーションコンポーネント
// ボイシングジェネレーターの全体を統合し、ユーザーインターフェースを提供
//
// Reactアプリケーションの中心となるコンポーネントで、以下の役割を担う：
// 1. 全体の状態管理（useState）
// 2. 子コンポーネント間のデータフロー制御
// 3. ユーザーインタラクションの処理
// 4. オーディオ再生の制御
// 5. 音楽理論計算の統合

import React, { useState, useEffect } from 'react';
// React: UIライブラリ（コンポーネント作成の基盤）
// useState: コンポーネントの状態を管理するHook
// useEffect: 副作用（データ取得、DOM操作など）を処理するHook

import styled from 'styled-components';
// styled-components: CSS-in-JSライブラリ
// JavaScriptでCSSを書くことで、動的なスタイリングが可能

// ===== コンポーネントのインポート =====
// 各コンポーネントは単一責任の原則に従って分離されている
import ChordInput from './components/ChordInput';        // コード入力コンポーネント
import VoicingDisplay from './components/VoicingDisplay'; // ボイシング表示コンポーネント
import ControlPanel from './components/ControlPanel';    // コントロールパネル
import PianoRoll from './components/PianoRoll';          // ピアノロール表示

// ===== 型定義とユーティリティのインポート =====
import { Voicing } from './types/music';                 // ボイシングの型定義
import { generateSmoothVoicings } from './utils/musicTheory'; // 音楽理論計算
import { audioPlayer } from './utils/audioPlayer';       // オーディオ再生

// ===== スタイルコンポーネント定義 =====
// styled-componentsを使用してCSS-in-JSでスタイリング
//
// styled-componentsの特徴：
// 1. テンプレートリテラル（バッククォート）でCSSを記述
// 2. JavaScriptの変数や関数をCSS内で使用可能
// 3. コンポーネント単位でスタイルを分離
// 4. 動的なスタイリングが容易
// 5. CSS Modulesのような名前空間の競合を回避

// アプリケーション全体のコンテナ
// styled.divはdiv要素にスタイルを適用したReactコンポーネントを作成
const AppContainer = styled.div`
  min-height: 100vh;  // 最小高さを画面全体（viewport height）に設定
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); // 135度のグラデーション背景
  padding: 2rem;      // 内側の余白（全方向に2rem）
`;

// メインコンテンツエリア
// コンテンツの最大幅を制限して読みやすさを向上
const MainContent = styled.div`
  max-width: 1200px;  // 最大幅を1200pxに制限
  margin: 0 auto;     // 上下0、左右autoで中央寄せ
`;

// ヘッダー部分
// アプリケーションのタイトルとサブタイトルを配置
const Header = styled.header`
  text-align: center; // テキストを中央揃え
  margin-bottom: 3rem; // 下の余白を3rem設定
`;

// メインタイトル
// アプリケーションの名前を大きく表示
const Title = styled.h1`
  font-size: 3rem;    // 大きなフォントサイズ（48px相当）
  color: white;       // 白色でテキストを表示
  margin: 0 0 1rem 0; // 上0、右0、下1rem、左0のマージン
  font-weight: 700;   // 太字（bold）
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); // テキストシャドウ（立体感）
`;

// サブタイトル
// アプリケーションの説明文
const Subtitle = styled.p`
  font-size: 1.2rem;  // 中サイズのフォント（19.2px相当）
  color: rgba(255, 255, 255, 0.9); // 半透明の白色（透明度0.9）
  margin: 0;          // マージンなし
  font-weight: 300;   // 細字（light）
`;

// コンテンツグリッド（2列レイアウト）
// CSS Gridを使用してレスポンシブなレイアウトを実現
const ContentGrid = styled.div`
  display: grid;                    // CSS Gridレイアウトを有効化
  grid-template-columns: 1fr 1fr;   // 2列の等幅（1fr = 1 fraction）
  gap: 2rem;                        // グリッドアイテム間の間隔
  margin-bottom: 2rem;              // 下の余白

  // レスポンシブデザイン（モバイル対応）
  // メディアクエリで画面幅768px以下でのスタイルを定義
  @media (max-width: 768px) {
    grid-template-columns: 1fr;     // モバイルでは1列レイアウト
  }
`;

const PianoRollSection = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 2rem;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: white;
  font-size: 1.1rem;
  margin-top: 1rem;
`;

// ===== メインアプリケーションコンポーネント =====
function App() {
  // ===== 状態管理（React Hooks） =====
  // useStateはReactの基本Hookで、コンポーネントの状態を管理
  // 構文: const [状態変数, 状態更新関数] = useState(初期値)
  // 状態が変更されると、コンポーネントが再レンダリングされる
  
  // コード進行の状態
  // ユーザーが入力したコード進行（文字列の配列）
  const [chordProgression, setChordProgression] = useState<string[]>([]);
  
  // 生成されたボイシングの状態
  // 音楽理論に基づいて生成されたボイシングの配列
  const [voicings, setVoicings] = useState<Voicing[]>([]);
  
  // ローディング状態
  // ボイシング生成中かどうかを示すフラグ
  const [isLoading, setIsLoading] = useState(false);
  
  // 再生状態
  // コード進行が再生中かどうかを示すフラグ
  const [isPlaying, setIsPlaying] = useState(false);
  
  // オーディオ初期化状態
  // Web Audio APIが初期化済みかどうかを示すフラグ
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  
  // ===== コントロールパネルの状態 =====
  // ボイシングタイプ（close, open, drop2, drop3の4種類）
  const [voicingType, setVoicingType] = useState<'close' | 'open' | 'drop2' | 'drop3'>('close');
  const [tempo, setTempo] = useState(120);  // BPM（Beats Per Minute）
  const [volume, setVolume] = useState(12); // 音量（0-24の範囲）

  // ===== イベントハンドラー関数 =====
  // ユーザーのアクションに応じて状態を更新し、適切な処理を実行
  
  // オーディオプレイヤーの初期化関数
  // ブラウザのWeb Audio APIを有効化し、ユーザーインタラクション後に音声再生を可能にする
  const handleInitializeAudio = async () => {
    try {
      // Tone.jsのオーディオコンテキストを開始
      // ブラウザのセキュリティ制限により、ユーザーインタラクションが必要
      await audioPlayer.initialize();
      setIsAudioInitialized(true); // 初期化完了フラグを設定
      // 音量を設定（-50から0の範囲に変換）
      audioPlayer.setVolume(volume - 50);
      // テンポを設定
      audioPlayer.setTempo(tempo);
    } catch (error) {
      console.error('オーディオ初期化エラー:', error);
      alert('オーディオの初期化に失敗しました。ブラウザの設定を確認してください。');
    }
  };

  // ボイシング生成関数
  // 入力されたコード進行から音楽理論に基づいたスムーズなボイシングを生成
  const handleGenerateVoicing = async () => {
    // コード進行が空の場合は処理を中断
    if (chordProgression.length === 0) return;
    
    setIsLoading(true); // ローディング状態を開始
    
    try {
      // クライアント側でボイシング生成（APIコールの代わり）
      // generateSmoothVoicings関数で音楽理論に基づいたボイスリーディングを適用
      const generatedVoicings = generateSmoothVoicings(chordProgression, voicingType);
      setVoicings(generatedVoicings); // 生成されたボイシングを状態に設定
    } catch (error) {
      console.error('ボイシング生成エラー:', error);
      alert('ボイシングの生成に失敗しました。');
    } finally {
      setIsLoading(false); // ローディング状態を終了（成功・失敗に関わらず実行）
    }
  };

  // 単一ボイシングの再生関数
  // 選択されたボイシングを即座に再生
  const handlePlayVoicing = (voicing: Voicing) => {
    // オーディオが初期化されていない場合は警告を表示
    if (!isAudioInitialized) {
      alert('まずオーディオを初期化してください。');
      return;
    }
    
    // ボイシングを2分音符の長さで再生
    audioPlayer.playVoicing(voicing, '2n');
  };

  // コード進行全体の再生
  const handlePlayProgression = () => {
    if (!isAudioInitialized) {
      alert('まずオーディオを初期化してください。');
      return;
    }
    
    if (voicings.length === 0) return;
    
    setIsPlaying(true);
    audioPlayer.playProgression(voicings, tempo);
    
    // 再生完了後に状態をリセット
    setTimeout(() => {
      setIsPlaying(false);
    }, (voicings.length * 2 * 60 / tempo) * 1000);
  };

  // 再生停止
  const handleStopPlayback = () => {
    audioPlayer.stopAll();
    setIsPlaying(false);
  };


  // テンポ変更
  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    if (isAudioInitialized) {
      audioPlayer.setTempo(newTempo);
    }
  };

  // 音量変更
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (isAudioInitialized) {
      audioPlayer.setVolume(newVolume - 50); // -50 to 0 range
    }
  };

  // ===== useEffectフック（副作用の処理） =====
  // ボイシングタイプ変更時に再生成
  // 依存配列[voicingType]の値が変更された時に実行される
  useEffect(() => {
    // コード進行とボイシングが存在する場合のみ再生成
    if (chordProgression.length > 0 && voicings.length > 0) {
      handleGenerateVoicing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // ESLintの警告を無効化（handleGenerateVoicingは依存配列に含めない）
  }, [voicingType]);

  // ===== JSXレンダリング =====
  // return文でJSXを返すことで、コンポーネントのUIを定義
  return (
    <AppContainer>
      <MainContent>
        {/* ヘッダー部分 */}
        <Header>
          <Title>ボイシングジェネレーター</Title>
        </Header>

        {/* メインコンテンツグリッド（2列レイアウト） */}
        <ContentGrid>
          {/* 左列：入力とコントロール */}
          <LeftColumn>
            {/* コード入力コンポーネント */}
            <ChordInput
              onChordProgressionChange={setChordProgression} // コード進行変更時のコールバック
              onGenerateVoicing={handleGenerateVoicing}      // ボイシング生成のコールバック
              isLoading={isLoading}                          // ローディング状態を渡す
            />
            {/* コントロールパネルコンポーネント */}
            <ControlPanel
              voicingType={voicingType}                      // 現在のボイシングタイプ
              onVoicingTypeChange={setVoicingType}           // ボイシングタイプ変更のコールバック
              tempo={tempo}                                  // 現在のテンポ
              onTempoChange={handleTempoChange}              // テンポ変更のコールバック
              volume={volume}                                // 現在の音量
              onVolumeChange={handleVolumeChange}            // 音量変更のコールバック
              onInitializeAudio={handleInitializeAudio}      // オーディオ初期化のコールバック
              isAudioInitialized={isAudioInitialized}        // オーディオ初期化状態
            />
          </LeftColumn>

          {/* 右列：ボイシング表示 */}
          <RightColumn>
            {/* ボイシング表示コンポーネント */}
            <VoicingDisplay
              voicings={voicings}                            // 生成されたボイシングの配列
              onPlayVoicing={handlePlayVoicing}              // 単一ボイシング再生のコールバック
              onPlayProgression={handlePlayProgression}      // コード進行再生のコールバック
              onStopPlayback={handleStopPlayback}            // 再生停止のコールバック
              isPlaying={isPlaying}                          // 再生状態
            />
          </RightColumn>
        </ContentGrid>

        {/* ピアノロールセクション（全幅） */}
        <PianoRollSection>
          <PianoRoll voicings={voicings} />
        </PianoRollSection>

        {/* 条件付きレンダリング：ローディングオーバーレイ */}
        {isLoading && (
          <LoadingOverlay>
            <div style={{ textAlign: 'center' }}>
              <LoadingSpinner />
              <LoadingText>ボイシングを生成中...</LoadingText>
            </div>
          </LoadingOverlay>
        )}
      </MainContent>
    </AppContainer>
  );
}

// デフォルトエクスポート
// 他のファイルでimport App from './App'として使用可能
export default App;
