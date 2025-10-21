// ===== ボイシング表示コンポーネント =====
// 生成されたボイシングを視覚的に表示し、再生ボタンを提供
//
// このコンポーネントの役割：
// 1. 生成されたボイシングの一覧表示
// 2. 各ボイシングの詳細情報表示（コード名、ポジション、音名）
// 3. 個別ボイシングの再生機能
// 4. コード進行全体の再生・停止機能
// 5. 視覚的な音楽情報の提供

import React from 'react';
// React: UIライブラリ（コンポーネント作成の基盤）

import styled from 'styled-components';
// styled-components: CSS-in-JSライブラリ
// コンポーネント単位でスタイルを分離し、動的なスタイリングを実現

import { Voicing } from '../types/music';
// Voicing型のインポート（音楽理論の型定義）

// ===== スタイルコンポーネント定義 =====
// 各UI要素に対応するstyled-componentsを定義

// ボイシングコンテナ
// 複数のボイシングカードを縦に並べるメインコンテナ
const VoicingContainer = styled.div`
  display: flex;                                 // Flexboxレイアウト
  flex-direction: column;                        // 縦方向に要素を配置
  gap: 1rem;                                     // 子要素間の間隔
  margin-bottom: 2rem;                           // 下の余白
`;

// ボイシングカード
// 各ボイシングの情報を表示するカード
const VoicingCard = styled.div`
  background: white;                             // 白色の背景
  border: 2px solid #e1e5e9;                    // 薄いグレーの境界線
  border-radius: 12px;                           // 角の丸み
  padding: 1.5rem;                              // 内側の余白
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);    // 影効果（立体感）
  transition: transform 0.2s ease, box-shadow 0.2s ease; // ホバー時のアニメーション

  // ホバー時の効果（浮き上がるような視覚効果）
  &:hover {
    transform: translateY(-2px);                 // 上に2px移動
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); // より濃い影
  }
`;

// ボイシングヘッダー
// コード名とボイシングタイプを表示するヘッダー部分
const VoicingHeader = styled.div`
  display: flex;                                 // Flexboxレイアウト
  justify-content: space-between;                // 両端揃え
  align-items: center;                           // 垂直方向の中央揃え
  margin-bottom: 1rem;                           // 下の余白
`;

// コード名
// コードの名前を表示するタイトル
const ChordName = styled.h3`
  margin: 0;                                     // マージンを削除
  font-size: 1.5rem;                             // 大きなフォントサイズ
  color: #333;                                   // ダークグレーの文字色
  font-weight: 700;                              // 太字
`;

// ボイシングタイプ
// ボイシングタイプ（close, open等）を表示するバッジ
const VoicingType = styled.span`
  background: #4a90e2;                           // 青色の背景
  color: white;                                  // 白色の文字
  padding: 0.25rem 0.75rem;                     // 内側の余白
  border-radius: 20px;                           // 丸い角
  font-size: 0.8rem;                             // 小さめのフォントサイズ
  font-weight: 600;                              // 太字
  text-transform: uppercase;                     // 大文字変換
`;

// 音符コンテナ
// 各音符を横並びで表示するコンテナ
const NotesContainer = styled.div`
  display: flex;                                 // Flexboxレイアウト
  flex-wrap: wrap;                               // はみ出したら折り返し
  gap: 0.75rem;                                  // 音符間の間隔
  margin-bottom: 1rem;                           // 下の余白
`;

// 音符カード
// 個別の音符情報を表示するカード
const NoteCard = styled.div`
  background: #f8f9fa;                           // 薄いグレーの背景
  border: 1px solid #dee2e6;                    // 薄いグレーの境界線
  border-radius: 8px;                            // 角の丸み
  padding: 0.75rem 1rem;                        // 内側の余白
  text-align: center;                            // 中央揃え
  min-width: 80px;                               // 最小幅
  transition: background-color 0.2s ease;        // 背景色の変化アニメーション

  // ホバー時の背景色変更
  &:hover {
    background: #e9ecef;                         // 少し濃いグレーの背景
  }
`;

// 音符名
// 音符の名前（C, D, E等）を表示
const NoteName = styled.div`
  font-size: 1.1rem;                             // フォントサイズ
  font-weight: 600;                              // 太字
  color: #333;                                   // ダークグレーの文字色
  margin-bottom: 0.25rem;                        // 下の余白
`;

// オクターブ
// 音符のオクターブ番号を表示
const NoteOctave = styled.div`
  font-size: 0.8rem;                             // 小さめのフォントサイズ
  color: #666;                                   // ミディアムグレーの文字色
`;

// 周波数
// 音符の周波数（Hz）を表示
const Frequency = styled.div`
  font-size: 0.7rem;                             // とても小さなフォントサイズ
  color: #999;                                   // ライトグレーの文字色
  margin-top: 0.25rem;                           // 上の余白
`;

// コントロールコンテナ
// 再生ボタン等のコントロール要素を配置するコンテナ
const ControlsContainer = styled.div`
  display: flex;                                 // Flexboxレイアウト
  gap: 0.5rem;                                   // ボタン間の間隔
  flex-wrap: wrap;                               // はみ出したら折り返し
`;

// コントロールボタン
// 再生、停止等のアクションボタン
const ControlButton = styled.button`
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

  // 再生ボタン用の特別なスタイル
  &.play {
    background: #4a90e2;                         // 青色の背景
    color: white;                                // 白色の文字
    border-color: #4a90e2;                       // 青色の境界線

    // ホバー時の色を少し濃く
    &:hover {
      background: #357abd;                       // 濃い青色の背景
    }
  }
`;

// 空状態
// ボイシングが生成されていない場合の表示
const EmptyState = styled.div`
  text-align: center;                            // 中央揃え
  padding: 3rem;                                 // 内側の余白
  color: #666;                                   // ミディアムグレーの文字色
  font-size: 1.1rem;                             // フォントサイズ
`;

// ===== 型定義 =====
// コンポーネントのpropsの型を定義
interface VoicingDisplayProps {
  voicings: Voicing[];                           // 表示するボイシングの配列
  onPlayVoicing: (voicing: Voicing) => void;     // 個別ボイシング再生のコールバック
  onPlayProgression: () => void;                 // コード進行全体再生のコールバック
  onStopPlayback: () => void;                    // 再生停止のコールバック
  isPlaying: boolean;                            // 現在再生中かどうかの状態
}

// ===== メインコンポーネント関数 =====
// React.FC<VoicingDisplayProps>: 関数コンポーネントの型定義
// ジェネリクスでpropsの型を指定
const VoicingDisplay: React.FC<VoicingDisplayProps> = ({
  voicings,                    // 親コンポーネントから受け取るボイシング配列
  onPlayVoicing,              // 親コンポーネントから受け取るコールバック関数
  onPlayProgression,          // 親コンポーネントから受け取るコールバック関数
  onStopPlayback,             // 親コンポーネントから受け取るコールバック関数
  isPlaying                   // 親コンポーネントから受け取る再生状態
}) => {
  // ===== 条件付きレンダリング =====
  // ボイシングが空の場合は空状態を表示
  if (voicings.length === 0) {
    return (
      <EmptyState>
        コード進行を入力してボイシングを生成してください
      </EmptyState>
    );
  }

  // ===== JSXレンダリング =====
  // コンポーネントのUIを定義
  return (
    <VoicingContainer>
      {/* ヘッダー部分：タイトルとコントロールボタン */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem' 
      }}>
        {/* セクションタイトル */}
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.5rem', 
          color: '#333' 
        }}>
          生成されたボイシング
        </h2>
        
        {/* 再生コントロールボタン群 */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* 全再生ボタン */}
          <ControlButton
            onClick={onPlayProgression}              // クリック時にコード進行全体を再生
            disabled={isPlaying}                     // 再生中は無効化
            className="play"                         // 再生ボタン用のスタイルクラス
          >
            {/* 状態に応じてボタンテキストを変更 */}
            {isPlaying ? '再生中...' : '全再生'}
          </ControlButton>
          
          {/* 停止ボタン */}
          <ControlButton onClick={onStopPlayback}>   {/* クリック時に再生を停止 */}
            停止
          </ControlButton>
        </div>
      </div>

      {/* ボイシングカードの一覧表示 */}
      {voicings.map((voicing, index) => (
        <VoicingCard key={index}>                   {/* Reactのkey属性（一意の識別子） */}
          {/* ボイシングのヘッダー情報 */}
          <VoicingHeader>
            {/* コードの位置番号 */}
            <ChordName>コード {voicing.position}</ChordName>
            {/* ボイシングタイプ（close, open等） */}
            <VoicingType>{voicing.type}</VoicingType>
          </VoicingHeader>
          
          {/* 音符情報の表示 */}
          <NotesContainer>
            {/* 各音符をカード形式で表示 */}
            {voicing.notes.map((note, noteIndex) => (
              <NoteCard key={noteIndex}>             {/* Reactのkey属性（一意の識別子） */}
                {/* 音符名（C, D, E等） */}
                <NoteName>{note.name}</NoteName>
                {/* オクターブ番号 */}
                <NoteOctave>オクターブ {note.octave}</NoteOctave>
                {/* 周波数（小数点以下1桁で表示） */}
                <Frequency>{note.frequency.toFixed(1)} Hz</Frequency>
              </NoteCard>
            ))}
          </NotesContainer>
          
          {/* 個別ボイシングのコントロール */}
          <ControlsContainer>
            {/* 個別再生ボタン */}
            <ControlButton
              onClick={() => onPlayVoicing(voicing)} // クリック時にこのボイシングのみを再生
              className="play"                       // 再生ボタン用のスタイルクラス
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
