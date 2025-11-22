// メインアプリケーションコンポーネント
// ボイシングジェネレーターの全体を統合し、ユーザーインターフェースを提供
//
// リファクタリング後の変更点：
// ロジックをカスタムフック（useAudioPlayer, useVoicingGenerator）に分離し、
// このコンポーネントは主にUIの構成とレイアウトに集中するようにしました。

import React from 'react';
import styled from 'styled-components';

// ===== コンポーネントのインポート =====
import ChordInput from './components/ChordInput';
import VoicingDisplay from './components/VoicingDisplay';
import ControlPanel from './components/ControlPanel';
import PianoRoll from './components/PianoRoll';

// ===== カスタムフックのインポート =====
// ロジックを分離して再利用可能にしたもの
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useVoicingGenerator } from './hooks/useVoicingGenerator';

// ===== スタイルコンポーネント定義 =====
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: white;
  margin: 0 0 1rem 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
  // ===== カスタムフックの使用 =====
  // 複雑なロジックを隠蔽し、必要なデータと関数のみを取得します

  // ボイシング生成ロジック
  const {
    voicings,
    isLoading,
    voicingType,
    setChordProgression,
    setVoicingType,
    generateVoicings
  } = useVoicingGenerator();

  // オーディオ再生ロジック
  const {
    isPlaying,
    isAudioInitialized,
    tempo,
    volume,
    initializeAudio,
    playVoicing,
    playProgression,
    stopPlayback,
    setTempo,
    setVolume
  } = useAudioPlayer();

  // ===== JSXレンダリング =====
  return (
    <AppContainer>
      <MainContent>
        <Header>
          <Title>ボイシングジェネレーター</Title>
        </Header>

        <ContentGrid>
          <LeftColumn>
            {/* コード入力と生成 */}
            <ChordInput
              onChordProgressionChange={setChordProgression}
              onGenerateVoicing={generateVoicings}
              isLoading={isLoading}
            />
            {/* 再生設定とコントロール */}
            <ControlPanel
              voicingType={voicingType}
              onVoicingTypeChange={setVoicingType}
              tempo={tempo}
              onTempoChange={setTempo}
              volume={volume}
              onVolumeChange={setVolume}
              onInitializeAudio={initializeAudio}
              isAudioInitialized={isAudioInitialized}
            />
          </LeftColumn>

          <RightColumn>
            {/* 生成結果の表示と再生 */}
            <VoicingDisplay
              voicings={voicings}
              onPlayVoicing={playVoicing}
              onPlayProgression={() => playProgression(voicings)}
              onStopPlayback={stopPlayback}
              isPlaying={isPlaying}
            />
          </RightColumn>
        </ContentGrid>

        <PianoRollSection>
          <PianoRoll voicings={voicings} />
        </PianoRollSection>

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

export default App;
