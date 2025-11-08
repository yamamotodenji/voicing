import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChordInput from './components/ChordInput';
import VoicingDisplay from './components/VoicingDisplay';
import ControlPanel from './components/ControlPanel';
import PianoRoll from './components/PianoRoll';
import { Voicing } from './types/music';
import { generateSmoothVoicings } from './utils/musicTheory';
import { audioPlayer } from './utils/audioPlayer';

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

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 300;
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

function App() {
  const [chordProgression, setChordProgression] = useState<string[]>([]);
  const [voicings, setVoicings] = useState<Voicing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  
  // コントロールパネルの状態
  const [voicingType, setVoicingType] = useState<'close' | 'open' | 'drop2' | 'drop3'>('close');
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(12);

  // オーディオプレイヤーの初期化
  const handleInitializeAudio = async () => {
    try {
      await audioPlayer.initialize();
      setIsAudioInitialized(true);
      audioPlayer.setVolume(volume - 50); // -50 to 0 range
      audioPlayer.setTempo(tempo);
    } catch (error) {
      console.error('オーディオ初期化エラー:', error);
      alert('オーディオの初期化に失敗しました。ブラウザの設定を確認してください。');
    }
  };

  // ボイシング生成
  const handleGenerateVoicing = async () => {
    if (chordProgression.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // 実際のAPIコールの代わりに、クライアント側でボイシング生成
      const generatedVoicings = generateSmoothVoicings(chordProgression, voicingType);
      setVoicings(generatedVoicings);
    } catch (error) {
      console.error('ボイシング生成エラー:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'ボイシングの生成に失敗しました。';
      alert(`エラー: ${errorMessage}\n\n無効なコード名が含まれている可能性があります。\nC#, Db, D#, Eb, F#, Gb, G#, Ab, A#, Bb などの形式で入力してください。`);
    } finally {
      setIsLoading(false);
    }
  };

  // 単一ボイシングの再生
  const handlePlayVoicing = (voicing: Voicing) => {
    if (!isAudioInitialized) {
      alert('まずオーディオを初期化してください。');
      return;
    }
    
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

  // ボイシングタイプ変更時に再生成
  useEffect(() => {
    if (chordProgression.length > 0 && voicings.length > 0) {
      handleGenerateVoicing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voicingType]);

  return (
    <AppContainer>
      <MainContent>
        <Header>
          <Title>🎹 ボイシングジェネレーター</Title>
          <Subtitle>コード進行から美しいボイシングを自動生成</Subtitle>
        </Header>

        <ContentGrid>
          <LeftColumn>
            <ChordInput
              onChordProgressionChange={setChordProgression}
              onGenerateVoicing={handleGenerateVoicing}
              isLoading={isLoading}
            />
            <ControlPanel
              voicingType={voicingType}
              onVoicingTypeChange={setVoicingType}
              tempo={tempo}
              onTempoChange={handleTempoChange}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              onInitializeAudio={handleInitializeAudio}
              isAudioInitialized={isAudioInitialized}
            />
          </LeftColumn>

          <RightColumn>
            <VoicingDisplay
              voicings={voicings}
              onPlayVoicing={handlePlayVoicing}
              onPlayProgression={handlePlayProgression}
              onStopPlayback={handleStopPlayback}
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
