import React, { useState } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Label = styled.label`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #357abd;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ChordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ChordTag = styled.span`
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #333;
  border: 1px solid #ddd;
`;

const RemoveButton = styled.button`
  margin-left: 0.5rem;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    color: #ff4444;
  }
`;

interface ChordInputProps {
  onChordProgressionChange: (chords: string[]) => void;
  onGenerateVoicing: () => void;
  isLoading: boolean;
}

const ChordInput: React.FC<ChordInputProps> = ({
  onChordProgressionChange,
  onGenerateVoicing,
  isLoading
}) => {
  const [inputValue, setInputValue] = useState('');
  const [chordProgression, setChordProgression] = useState<string[]>([]);

  const handleAddChord = () => {
    const chord = inputValue.trim();
    if (chord && !chordProgression.includes(chord)) {
      const newProgression = [...chordProgression, chord];
      setChordProgression(newProgression);
      onChordProgressionChange(newProgression);
      setInputValue('');
    }
  };

  const handleRemoveChord = (index: number) => {
    const newProgression = chordProgression.filter((_, i) => i !== index);
    setChordProgression(newProgression);
    onChordProgressionChange(newProgression);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddChord();
    }
  };

  const handleClearAll = () => {
    setChordProgression([]);
    onChordProgressionChange([]);
  };

  return (
    <InputContainer>
      <Label htmlFor="chord-input">コード進行を入力してください</Label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Input
          id="chord-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="例: C, Am, F, G"
          disabled={isLoading}
        />
        <Button onClick={handleAddChord} disabled={isLoading || !inputValue.trim()}>
          追加
        </Button>
      </div>
      
      {chordProgression.length > 0 && (
        <>
          <ChordList>
            {chordProgression.map((chord, index) => (
              <ChordTag key={index}>
                {chord}
                <RemoveButton onClick={() => handleRemoveChord(index)}>
                  ×
                </RemoveButton>
              </ChordTag>
            ))}
          </ChordList>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={onGenerateVoicing} disabled={isLoading}>
              {isLoading ? '生成中...' : 'ボイシング生成'}
            </Button>
            <Button onClick={handleClearAll} disabled={isLoading} style={{ background: '#ff4444' }}>
              クリア
            </Button>
          </div>
        </>
      )}
    </InputContainer>
  );
};

export default ChordInput;
