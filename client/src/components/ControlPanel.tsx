import React from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
`;


const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4a90e2;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4a90e2;
    cursor: pointer;
    border: none;
  }
`;

const ValueDisplay = styled.span`
  min-width: 40px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
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

  &.active {
    background: #4a90e2;
    color: white;
    border-color: #4a90e2;
  }
`;

interface ControlPanelProps {
  voicingType: 'close' | 'open' | 'drop2' | 'drop3';
  onVoicingTypeChange: (type: 'close' | 'open' | 'drop2' | 'drop3') => void;
  instrument: 'piano' | 'synth' | 'organ' | 'strings';
  onInstrumentChange: (instrument: 'piano' | 'synth' | 'organ' | 'strings') => void;
  tempo: number;
  onTempoChange: (tempo: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onInitializeAudio: () => void;
  isAudioInitialized: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  voicingType,
  onVoicingTypeChange,
  instrument,
  onInstrumentChange,
  tempo,
  onTempoChange,
  volume,
  onVolumeChange,
  onInitializeAudio,
  isAudioInitialized
}) => {
  const voicingTypes = [
    { value: 'close', label: 'クローズド' },
    { value: 'open', label: 'オープン' },
    { value: 'drop2', label: 'Drop 2' },
    { value: 'drop3', label: 'Drop 3' }
  ] as const;

  const instruments = [
    { value: 'piano', label: 'ピアノ' },
    { value: 'synth', label: 'シンセ' },
    { value: 'organ', label: 'オルガン' },
    { value: 'strings', label: 'ストリングス' }
  ] as const;

  return (
    <Panel>
      <Title>コントロールパネル</Title>
      
      <ControlGroup>
        <Label>ボイシングタイプ</Label>
        <ButtonGroup>
          {voicingTypes.map((type) => (
            <Button
              key={type.value}
              className={voicingType === type.value ? 'active' : ''}
              onClick={() => onVoicingTypeChange(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </ButtonGroup>
      </ControlGroup>

      <ControlGroup>
        <Label>楽器音色</Label>
        <ButtonGroup>
          {instruments.map((inst) => (
            <Button
              key={inst.value}
              className={instrument === inst.value ? 'active' : ''}
              onClick={() => onInstrumentChange(inst.value)}
            >
              {inst.label}
            </Button>
          ))}
        </ButtonGroup>
      </ControlGroup>

      <ControlGroup>
        <Label>テンポ: {tempo} BPM</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="60"
            max="200"
            value={tempo}
            onChange={(e) => onTempoChange(parseInt(e.target.value))}
          />
          <ValueDisplay>{tempo}</ValueDisplay>
        </SliderContainer>
      </ControlGroup>

      <ControlGroup>
        <Label>音量: {volume}%</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          />
          <ValueDisplay>{volume}%</ValueDisplay>
        </SliderContainer>
      </ControlGroup>

      <ControlGroup>
        <Button
          onClick={onInitializeAudio}
          disabled={isAudioInitialized}
          style={{
            background: isAudioInitialized ? '#28a745' : '#4a90e2',
            color: 'white',
            border: 'none'
          }}
        >
          {isAudioInitialized ? 'オーディオ初期化済み' : 'オーディオを初期化'}
        </Button>
      </ControlGroup>
    </Panel>
  );
};

export default ControlPanel;
