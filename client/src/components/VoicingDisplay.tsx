import React from 'react';
import styled from 'styled-components';
import { Voicing } from '../types/music';

const VoicingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const VoicingCard = styled.div`
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const VoicingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ChordName = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 700;
`;

const VoicingType = styled.span`
  background: #4a90e2;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const NotesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const NoteCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  text-align: center;
  min-width: 80px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #e9ecef;
  }
`;

const NoteName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const NoteOctave = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const Frequency = styled.div`
  font-size: 0.7rem;
  color: #999;
  margin-top: 0.25rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #4a90e2;
  }

  &.play {
    background: #4a90e2;
    color: white;
    border-color: #4a90e2;

    &:hover {
      background: #357abd;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

interface VoicingDisplayProps {
  voicings: Voicing[];
  onPlayVoicing: (voicing: Voicing) => void;
  onPlayProgression: () => void;
  onStopPlayback: () => void;
  isPlaying: boolean;
}

const VoicingDisplay: React.FC<VoicingDisplayProps> = ({
  voicings,
  onPlayVoicing,
  onPlayProgression,
  onStopPlayback,
  isPlaying
}) => {
  if (voicings.length === 0) {
    return (
      <EmptyState>
        コード進行を入力してボイシングを生成してください
      </EmptyState>
    );
  }

  return (
    <VoicingContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
          生成されたボイシング
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ControlButton
            onClick={onPlayProgression}
            disabled={isPlaying}
            className="play"
          >
            {isPlaying ? '再生中...' : '全再生'}
          </ControlButton>
          <ControlButton onClick={onStopPlayback}>
            停止
          </ControlButton>
        </div>
      </div>

      {voicings.map((voicing, index) => (
        <VoicingCard key={index}>
          <VoicingHeader>
            <ChordName>コード {voicing.position}</ChordName>
            <VoicingType>{voicing.type}</VoicingType>
          </VoicingHeader>
          
          <NotesContainer>
            {voicing.notes.map((note, noteIndex) => (
              <NoteCard key={noteIndex}>
                <NoteName>{note.name}</NoteName>
                <NoteOctave>オクターブ {note.octave}</NoteOctave>
                <Frequency>{note.frequency.toFixed(1)} Hz</Frequency>
              </NoteCard>
            ))}
          </NotesContainer>
          
          <ControlsContainer>
            <ControlButton
              onClick={() => onPlayVoicing(voicing)}
              className="play"
            >
              再生
            </ControlButton>
          </ControlsContainer>
        </VoicingCard>
      ))}
    </VoicingContainer>
  );
};

export default VoicingDisplay;
