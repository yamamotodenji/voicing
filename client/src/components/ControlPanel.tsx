// ===== コントロールパネルコンポーネント =====
// ボイシングタイプ、テンポ、音量などの設定を制御するUI
//
// このコンポーネントの役割：
// 1. ボイシングタイプの選択（close, open, drop2, drop3）
// 2. テンポ（BPM）の調整
// 3. 音量の調整
// 4. オーディオ初期化の制御
// 5. 親コンポーネントへの設定変更通知

import React from 'react';
// React: UIライブラリ（コンポーネント作成の基盤）

import styled from 'styled-components';
// styled-components: CSS-in-JSライブラリ
// コンポーネント単位でスタイルを分離し、動的なスタイリングを実現

// ===== スタイルコンポーネント定義 =====
// 各UI要素に対応するstyled-componentsを定義

// パネルコンテナ
// コントロールパネル全体の背景とレイアウト
const Panel = styled.div`
  background: white;                              // 白色の背景
  border: 2px solid #e1e5e9;                     // 薄いグレーの境界線
  border-radius: 12px;                           // 角の丸み
  padding: 1.5rem;                               // 内側の余白
  margin-bottom: 2rem;                           // 下の余白
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);     // 影効果（立体感）
`;

// タイトル
// パネルの見出し
const Title = styled.h3`
  margin: 0 0 1rem 0;                            // マージン設定
  font-size: 1.2rem;                             // フォントサイズ
  color: #333;                                   // ダークグレーの文字色
  font-weight: 600;                              // 太字
`;

// コントロールグループ
// 各設定項目をグループ化するコンテナ
const ControlGroup = styled.div`
  display: flex;                                 // Flexboxレイアウト
  flex-direction: column;                        // 縦方向に要素を配置
  gap: 1rem;                                     // 子要素間の間隔
  margin-bottom: 1.5rem;                         // 下の余白

  // 最後の要素は下の余白を削除
  &:last-child {
    margin-bottom: 0;
  }
`;

// ラベル
// 各コントロールの説明ラベル
const Label = styled.label`
  font-size: 0.9rem;                             // 小さめのフォントサイズ
  font-weight: 600;                              // 太字
  color: #555;                                   // ミディアムグレーの文字色
  margin-bottom: 0.5rem;                         // 下の余白
`;

// スライダーコンテナ
// スライダーと値表示を横並びにするコンテナ
const SliderContainer = styled.div`
  display: flex;                                 // Flexboxレイアウト
  align-items: center;                           // 垂直方向の中央揃え
  gap: 0.5rem;                                   // 要素間の間隔
`;

// スライダー
// 範囲入力（range input）のカスタムスタイル
const Slider = styled.input`
  flex: 1;                                       // 残りのスペースを全て使用
  height: 6px;                                   // スライダーの高さ
  border-radius: 3px;                            // 角の丸み
  background: #ddd;                              // スライダーの背景色
  outline: none;                                 // フォーカス時のアウトラインを削除
  cursor: pointer;                               // ポインターカーソル

  // Webkitブラウザ（Chrome、Safari）のスライダーハンドル
  &::-webkit-slider-thumb {
    appearance: none;                            // デフォルトのスタイルを削除
    width: 18px;                                 // ハンドルの幅
    height: 18px;                                // ハンドルの高さ
    border-radius: 50%;                          // 円形のハンドル
    background: #4a90e2;                         // 青色の背景
    cursor: pointer;                             // ポインターカーソル
  }

  // Firefoxブラウザのスライダーハンドル
  &::-moz-range-thumb {
    width: 18px;                                 // ハンドルの幅
    height: 18px;                                // ハンドルの高さ
    border-radius: 50%;                          // 円形のハンドル
    background: #4a90e2;                         // 青色の背景
    cursor: pointer;                             // ポインターカーソル
    border: none;                                // 境界線なし
  }
`;

// 値表示
// スライダーの現在値を表示するテキスト
const ValueDisplay = styled.span`
  min-width: 40px;                               // 最小幅を設定
  text-align: center;                            // 中央揃え
  font-size: 0.9rem;                             // フォントサイズ
  color: #666;                                   // グレーの文字色
  font-weight: 600;                              // 太字
`;

// ボタングループ
// 複数のボタンを横並びにするコンテナ
const ButtonGroup = styled.div`
  display: flex;                                 // Flexboxレイアウト
  gap: 0.5rem;                                   // ボタン間の間隔
  flex-wrap: wrap;                               // はみ出したら折り返し
`;

// ボタン
// 各種アクション用のボタン
const Button = styled.button`
  padding: 0.5rem 1rem;                          // 内側の余白
  border: 1px solid #ddd;                        // 薄いグレーの境界線
  background: white;                             // 白色の背景
  border-radius: 6px;                            // 角の丸み
  font-size: 0.9rem;                             // フォントサイズ
  cursor: pointer;                               // ポインターカーソル
  transition: all 0.2s ease;                     // 全プロパティの変化アニメーション

  // ホバー時のスタイル
  &:hover {
    background: #f8f9fa;                         // 薄いグレーの背景
    border-color: #4a90e2;                       // 青色の境界線
  }

  // アクティブ状態のスタイル
  &.active {
    background: #4a90e2;                         // 青色の背景
    color: white;                                // 白色の文字
    border-color: #4a90e2;                       // 青色の境界線
  }
`;

// ===== 型定義 =====
// コンポーネントのpropsの型を定義
interface ControlPanelProps {
  voicingType: 'close' | 'open' | 'drop2' | 'drop3';  // 現在のボイシングタイプ
  onVoicingTypeChange: (type: 'close' | 'open' | 'drop2' | 'drop3') => void; // ボイシングタイプ変更のコールバック
  tempo: number;                                      // 現在のテンポ（BPM）
  onTempoChange: (tempo: number) => void;            // テンポ変更のコールバック
  volume: number;                                     // 現在の音量（0-100）
  onVolumeChange: (volume: number) => void;          // 音量変更のコールバック
  onInitializeAudio: () => void;                     // オーディオ初期化のコールバック
  isAudioInitialized: boolean;                       // オーディオ初期化状態
}

// ===== メインコンポーネント関数 =====
// React.FC<ControlPanelProps>: 関数コンポーネントの型定義
// ジェネリクスでpropsの型を指定
const ControlPanel: React.FC<ControlPanelProps> = ({
  voicingType,              // 親コンポーネントから受け取る現在のボイシングタイプ
  onVoicingTypeChange,      // 親コンポーネントから受け取るコールバック関数
  tempo,                    // 親コンポーネントから受け取る現在のテンポ
  onTempoChange,            // 親コンポーネントから受け取るコールバック関数
  volume,                   // 親コンポーネントから受け取る現在の音量
  onVolumeChange,           // 親コンポーネントから受け取るコールバック関数
  onInitializeAudio,        // 親コンポーネントから受け取るコールバック関数
  isAudioInitialized        // 親コンポーネントから受け取るオーディオ初期化状態
}) => {
  // ===== 定数定義 =====
  // ボイシングタイプの選択肢を定義
  // as const で型を厳密に指定（リテラル型として扱う）
  const voicingTypes = [
    { value: 'close', label: 'クローズド' },   // クローズドボイシング
    { value: 'open', label: 'オープン' },       // オープンボイシング
    { value: 'drop2', label: 'Drop 2' },       // Drop 2ボイシング
    { value: 'drop3', label: 'Drop 3' }        // Drop 3ボイシング
  ] as const;


  // ===== JSXレンダリング =====
  // コンポーネントのUIを定義
  return (
    <Panel>
      {/* パネルのタイトル */}
      <Title>コントロールパネル</Title>
      
      {/* ボイシングタイプ選択セクション */}
      <ControlGroup>
        {/* ボイシングタイプのラベル */}
        <Label>ボイシングタイプ</Label>
        {/* ボイシングタイプ選択ボタングループ */}
        <ButtonGroup>
          {/* 各ボイシングタイプのボタンを動的に生成 */}
          {voicingTypes.map((type) => (
            <Button
              key={type.value}                                    // Reactのkey属性（一意の識別子）
              className={voicingType === type.value ? 'active' : ''} // 現在選択されているタイプに'active'クラスを適用
              onClick={() => onVoicingTypeChange(type.value)}     // クリック時に親コンポーネントに変更を通知
            >
              {type.label}                                        {/* ボタンに表示するラベル */}
            </Button>
          ))}
        </ButtonGroup>
      </ControlGroup>

      {/* テンポ調整セクション */}
      <ControlGroup>
        {/* テンポのラベル（現在値を表示） */}
        <Label>テンポ: {tempo} BPM</Label>
        {/* テンポスライダーと値表示のコンテナ */}
        <SliderContainer>
          {/* テンポ調整用のスライダー */}
          <Slider
            type="range"                                          // 範囲入力タイプ
            min="60"                                             // 最小値（60 BPM）
            max="200"                                            // 最大値（200 BPM）
            value={tempo}                                        // 現在のテンポ値
            onChange={(e) => onTempoChange(parseInt(e.target.value))} // 値変更時のハンドラー（文字列を数値に変換）
          />
          {/* 現在のテンポ値を表示 */}
          <ValueDisplay>{tempo}</ValueDisplay>
        </SliderContainer>
      </ControlGroup>

      {/* 音量調整セクション */}
      <ControlGroup>
        {/* 音量のラベル（現在値を表示） */}
        <Label>音量: {volume}%</Label>
        {/* 音量スライダーと値表示のコンテナ */}
        <SliderContainer>
          {/* 音量調整用のスライダー */}
          <Slider
            type="range"                                          // 範囲入力タイプ
            min="0"                                              // 最小値（0%）
            max="100"                                            // 最大値（100%）
            value={volume}                                       // 現在の音量値
            onChange={(e) => onVolumeChange(parseInt(e.target.value))} // 値変更時のハンドラー（文字列を数値に変換）
          />
          {/* 現在の音量値を表示 */}
          <ValueDisplay>{volume}%</ValueDisplay>
        </SliderContainer>
      </ControlGroup>

      {/* オーディオ初期化セクション */}
      <ControlGroup>
        {/* オーディオ初期化ボタン */}
        <Button
          onClick={onInitializeAudio}                            // クリック時のハンドラー
          disabled={isAudioInitialized}                          // 初期化済みの場合は無効化
          style={{
            // 条件に応じてスタイルを動的に変更
            background: isAudioInitialized ? '#28a745' : '#4a90e2', // 初期化済みなら緑、未初期化なら青
            color: 'white',                                      // 白色の文字
            border: 'none'                                       // 境界線なし
          }}
        >
          {/* 状態に応じてボタンテキストを変更 */}
          {isAudioInitialized ? 'オーディオ初期化済み' : 'オーディオを初期化'}
        </Button>
      </ControlGroup>
    </Panel>
  );
};

export default ControlPanel;
