import React from 'react';
import styled from 'styled-components';
import { Voicing } from '../types/music';

const PianoRollContainer = styled.div`
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #fff;
  font-weight: 600;
`;

const PianoRollWrapper = styled.div`
  display: flex;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  min-height: 400px;
  max-height: 600px;
`;

const ScrollableContainer = styled.div`
  overflow-y: auto;
  overflow-x: auto;
  max-height: 600px;
  width: 100%;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2a2a2a;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #777;
  }
`;

const PianoKeyboard = styled.div`
  width: 80px;
  background: #2a2a2a;
  border-right: 2px solid #555;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const PianoKey = styled.div<{ isBlack: boolean; isHighlighted: boolean }>`
  height: 20px;
  background: ${props => props.isBlack ? '#1a1a1a' : props.isHighlighted ? '#4a90e2' : '#f0f0f0'};
  border-bottom: 1px solid ${props => props.isBlack ? '#333' : '#ddd'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${props => props.isBlack ? '#fff' : props.isHighlighted ? '#fff' : '#333'};
  position: relative;
  
  ${props => props.isBlack && `
    height: 12px;
    margin-top: -6px;
    z-index: 2;
    border-radius: 0 0 3px 3px;
  `}
`;

const NoteLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
`;

const TimelineContainer = styled.div`
  flex: 1;
  position: relative;
  background: #2a2a2a;
  min-width: 400px;
`;

const Timeline = styled.div`
  height: 30px;
  background: #333;
  border-bottom: 2px solid #555;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TimeLabel = styled.div`
  margin-right: 20px;
  color: #ccc;
`;

const GridContainer = styled.div`
  position: relative;
  height: calc(100% - 30px);
  background: 
    repeating-linear-gradient(
      to right,
      transparent,
      transparent 19px,
      #444 20px
    ),
    repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 19px,
      #444 20px
    );
`;

const NoteBlock = styled.div<{ 
  noteIndex: number; 
  chordIndex: number; 
  duration: number;
  color: string;
}>`
  position: absolute;
  height: 18px;
  width: ${props => props.duration * 20}px;
  left: ${props => props.chordIndex * 80 + 10}px;
  top: ${props => props.noteIndex * 20 + 1}px;
  background: ${props => props.color};
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 3;
`;

const NoteText = styled.div`
  font-size: 0.5rem;
  font-weight: 700;
  color: white;
  text-align: center;
  line-height: 1;
`;

const Legend = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #ccc;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${props => props.color};
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

interface PianoRollProps {
  voicings: Voicing[];
}

const PianoRoll: React.FC<PianoRollProps> = ({ voicings }) => {
  // ピアノの鍵盤配列（C1からC7まで、より広い範囲）
  const octaves = [1, 2, 3, 4, 5, 6, 7];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
  
  // コードカラー（各コードに異なる色を割り当て）
  const chordColors = [
    '#ff6b6b', // 赤
    '#4ecdc4', // 青緑
    '#45b7d1', // 青
    '#96ceb4', // 緑
    '#feca57', // 黄
    '#ff9ff3', // ピンク
    '#54a0ff', // 青
    '#5f27cd', // 紫
  ];

  // 全音階を生成（C6からC2まで、高い音から低い音へ）
  const allNotes: Array<{ name: string; octave: number; isBlack: boolean }> = [];
  [...octaves].reverse().forEach(octave => {
    [...noteNames].reverse().forEach(noteName => {
      allNotes.push({
        name: noteName,
        octave: octave,
        isBlack: blackKeys.includes(noteName)
      });
    });
  });

  // ボイシングの音をマップに変換
  const noteMap = new Map<string, { chordIndex: number; noteIndex: number }>();
  
  voicings.forEach((voicing, chordIndex) => {
    voicing.notes.forEach((note, noteIndex) => {
      const key = `${note.name}${note.octave}`;
      noteMap.set(key, {
        chordIndex: chordIndex,
        noteIndex: noteIndex
      });
    });
  });

  // 音の存在チェック
  const hasNote = (noteName: string, octave: number) => {
    const key = `${noteName}${octave}`;
    return noteMap.has(key);
  };

  // 音の情報取得
  const getNoteInfo = (noteName: string, octave: number) => {
    const key = `${noteName}${octave}`;
    return noteMap.get(key);
  };

  // デバッグ情報
  console.log('Voicings:', voicings);
  console.log('Note map:', Array.from(noteMap.entries()));

  if (voicings.length === 0) {
    return (
      <PianoRollContainer>
        <Title>🎹 ピアノロール</Title>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
          ボイシングを生成してください
        </div>
      </PianoRollContainer>
    );
  }

  return (
    <PianoRollContainer>
      <Title>🎹 ピアノロール</Title>
      
      <ScrollableContainer>
        <PianoRollWrapper>
          <PianoKeyboard>
            {allNotes.map((note, index) => {
              const isHighlighted = hasNote(note.name, note.octave);
              return (
                <PianoKey
                  key={`${note.name}${note.octave}`}
                  isBlack={note.isBlack}
                  isHighlighted={isHighlighted}
                >
                  {!note.isBlack && (
                    <NoteLabel>
                      {note.name}{note.octave}
                    </NoteLabel>
                  )}
                </PianoKey>
              );
            })}
          </PianoKeyboard>
          
          <TimelineContainer>
            <Timeline>
              <TimeLabel>Time</TimeLabel>
              {voicings.map((_, index) => (
                <div key={index} style={{ marginRight: '60px', color: '#ccc' }}>
                  {index + 1}
                </div>
              ))}
            </Timeline>
            
            <GridContainer>
              {allNotes.map((note, noteIndex) => {
                const noteInfo = getNoteInfo(note.name, note.octave);
                if (!noteInfo) return null;
                
                const chordIndex = noteInfo.chordIndex;
                const color = chordColors[chordIndex % chordColors.length];
                
                return (
                  <NoteBlock
                    key={`${note.name}${note.octave}`}
                    noteIndex={noteIndex}
                    chordIndex={chordIndex}
                    duration={1} // 1拍分の長さ
                    color={color}
                  >
                    <NoteText>
                      {note.name}{note.octave}
                    </NoteText>
                  </NoteBlock>
                );
              })}
            </GridContainer>
          </TimelineContainer>
        </PianoRollWrapper>
      </ScrollableContainer>
      
      <Legend>
        <LegendItem>
          <LegendColor color="#ff6b6b" />
          <span>コード 1</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#4ecdc4" />
          <span>コード 2</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#45b7d1" />
          <span>コード 3</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#96ceb4" />
          <span>コード 4</span>
        </LegendItem>
        <LegendItem>
          <div style={{ width: '16px', height: '16px', background: '#1a1a1a', borderRadius: '2px' }} />
          <span>黒鍵</span>
        </LegendItem>
        <LegendItem>
          <div style={{ width: '16px', height: '16px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '2px' }} />
          <span>白鍵</span>
        </LegendItem>
      </Legend>
    </PianoRollContainer>
  );
};

export default PianoRoll;
