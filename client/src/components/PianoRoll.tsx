// Reactとstyled-componentsをインポート
// React: UIライブラリ（コンポーネントを作るために必要）
// styled-components: CSS-in-JSライブラリ（JavaScriptでCSSを書く）
import React from 'react';
import styled from 'styled-components';
// 自作の型定義ファイルからVoicing型をインポート
// 型定義ファイルはTypeScriptで型の安全性を保つために使用
import { Voicing } from '../types/music';

// ===== styled-components によるスタイル定義 =====
// styled-componentsは、JavaScriptでCSSを書くライブラリ
// テンプレートリテラル（バッククォート）を使ってCSSを書く

// ピアノロール全体のコンテナ
// styled.div は div 要素にスタイルを適用したコンポーネントを作成
const PianoRollContainer = styled.div`
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// タイトル部分
const Title = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
`;

// ピアノロールのメインラッパー
// display: flex で横並びレイアウト
const PianoRollWrapper = styled.div`
  display: flex;
  background: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
  min-height: 400px;
`;

// 左側のピアノ鍵盤エリア
const PianoKeyboard = styled.div`
  width: 100px;
  background: #1a1a1a;
  border-right: 2px solid #444;
  display: flex;
  flex-direction: column;  // 縦並び
  flex-shrink: 0;          // 縮まない
  padding-top: 30px;       // Timeバーの高さ分のオフセット
`;

// ピアノの鍵盤（白鍵のみ）
const PianoKey = styled.div`
  height: 20px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 600;
  color: #333;
  position: relative;
`;

// 音名ラベル
const NoteLabel = styled.div`
  font-size: 0.5rem;
  font-weight: 700;
  color: #333;
  text-align: center;
`;

// 右側のタイムラインエリア
const TimelineContainer = styled.div`
  flex: 1;              // 残りのスペースを全て使用
  position: relative;
  background: #2a2a2a;
  min-width: 400px;
`;

// 上部のタイムライン
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

// タイムラベル
const TimeLabel = styled.div`
  margin-right: 20px;
  color: #ccc;
`;

// 音符ブロックのグリッドエリア
const GridContainer = styled.div`
  position: relative;
  height: calc(100% - 30px);  // CSS calc() 関数で計算
  // repeating-linear-gradient でグリッド線を描画
  // ピアノ鍵盤の20px間隔に合わせて調整
  background: 
    repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 19px,
      #444 20px
    );
`;

// 音符ブロック
const NoteBlock = styled.div<{ 
  noteIndex: number;
  chordIndex: number;
  duration: number;
  color: string;
}>`
  position: absolute;
  height: 20px;
  width: ${props => props.duration * 80}px;
  left: ${props => props.chordIndex * 80 + 10}px;
  top: ${props => props.noteIndex * 20}px;
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

// 音符ブロック内のテキスト
const NoteText = styled.div`
  font-size: 0.5rem;
  font-weight: 700;
  color: white;
  text-align: center;
  line-height: 1;
`;

// ===== TypeScript のインターフェース定義 =====
// interface はオブジェクトの型を定義する
// このコンポーネントが受け取る props の型を定義
interface PianoRollProps {
  voicings: Voicing[];  // Voicing型の配列
}

// ===== React コンポーネントの定義 =====
// React.FC<PianoRollProps> は TypeScript の型定義
// React.FC = React Function Component（関数コンポーネント）
// <PianoRollProps> はジェネリクスで、このコンポーネントの props の型を指定
// ({ voicings }) は分割代入で、props から voicings を取得
const PianoRoll: React.FC<PianoRollProps> = ({ voicings }) => {
  // ===== 定数定義 =====
  
  // ピアノの鍵盤配列（C2からC6まで）
  // const は定数宣言（再代入不可）
  const octaves = [2, 3, 4, 5];  // 数値の配列
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];  // 白鍵のみの音名
  
  // コードカラー（各コードに異なる色を割り当て）
  // 文字列の配列（16進数カラーコード）
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

  // ===== ピアノ鍵盤の生成 =====
  
  // 全音階を生成（C6からC2まで、高い音から低い音へ）
  // ピアノロールでは高い音が上に表示されるため、逆順で生成
  
  // TypeScript の型注釈
  // Array<{ name: string; octave: number }> は
  // オブジェクトの配列で、各オブジェクトは name（文字列）、octave（数値）を持つ
  const allNotes: Array<{ name: string; octave: number }> = [];
  
  // [...octaves].reverse() は配列のコピーを作ってから逆順にする
  // forEach は配列の各要素に対して関数を実行
  [...octaves].reverse().forEach(octave => {
    [...noteNames].reverse().forEach(noteName => {
      // push で配列に要素を追加
      allNotes.push({
        name: noteName,                    // 音名
        octave: octave                     // オクターブ
      });
    });
  });

  // ===== デバッグ用の音マップ生成 =====
  
  // ボイシングの音をマップに変換（デバッグ用）
  // Map は JavaScript の連想配列（キーと値のペアを格納）
  // <string, { chordIndex: number; noteIndex: number }> は
  // キーが文字列、値がオブジェクト（chordIndex と noteIndex を持つ）の型
  const noteMap = new Map<string, { chordIndex: number; noteIndex: number }>();
  
  // forEach で配列の各要素を処理
  // (voicing, chordIndex) は分割代入で、要素とインデックスを取得
  voicings.forEach((voicing, chordIndex) => {
    // テンプレートリテラル（バッククォート）で文字列を結合
    console.log(`Chord ${chordIndex + 1}:`, voicing.notes.length, 'notes');
    voicing.notes.forEach((note, noteIndex) => {
      // 文字列結合でキーを作成
      const key = `${note.name}${note.octave}`;
      console.log(`  Note ${noteIndex + 1}: ${key}`);
      // Map に値を設定
      noteMap.set(key, {
        chordIndex: chordIndex,
        noteIndex: noteIndex
      });
    });
  });


  // ===== レンダリング =====
  
  // ボイシングが空の場合はメッセージを表示
  // if 文で条件分岐
  if (voicings.length === 0) {
    // return で早期リターン（この時点で関数を終了）
    return (
      <PianoRollContainer>
        <Title>🎹 ピアノロール</Title>
        {/* style プロパティでインラインスタイルを適用 */}
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
          ボイシングを生成してください
        </div>
      </PianoRollContainer>
    );
  }

  // メインのレンダリング
  return (
    <PianoRollContainer>
      <Title>🎹 ピアノロール</Title>
      
      <PianoRollWrapper>
        {/* 左側のピアノ鍵盤 */}
        <PianoKeyboard>
          {/* map メソッドで配列を変換してJSX要素の配列を作成 */}
          {allNotes.map((note) => {
            return (
              <PianoKey
                key={`${note.name}${note.octave}`}  // key は React の必須プロパティ（一意の識別子）
              >
                <NoteLabel>
                  {note.name}{note.octave}  {/* テンプレートリテラルで文字列結合 */}
                </NoteLabel>
              </PianoKey>
            );
          })}
        </PianoKeyboard>
        
        {/* 右側のグリッドエリア */}
        <TimelineContainer>
          {/* 上部のタイムライン */}
          <Timeline>
            <TimeLabel>Time</TimeLabel>
            {/* ボイシングの数だけタイムラベルを生成 */}
            {voicings.map((_, index) => (
              <div key={index} style={{ marginRight: '60px', color: '#ccc' }}>
                {index + 1}  {/* 1から始まる番号 */}
              </div>
            ))}
          </Timeline>
          
          {/* 音符ブロックのグリッド */}
          <GridContainer>
            {/* 二重の map：外側でコード、内側で音符を処理 */}
            {voicings.map((voicing, chordIndex) => {
              return voicing.notes.map((note, noteIndex) => {
                // 音の位置をallNotes配列から見つける
                // findIndex は条件に合う最初の要素のインデックスを返す
                // これにより、ピアノ鍵盤の位置と音符ブロックの位置が一致する
                const notePosition = allNotes.findIndex(n => 
                  n.name === note.name && n.octave === note.octave
                );
                
                // 音が見つからない場合はスキップ（null を返すと何もレンダリングされない）
                if (notePosition === -1) return null;
                
                // コードごとに異なる色を割り当て
                // % 演算子で剰余を計算（色の配列を循環）
                const color = chordColors[chordIndex % chordColors.length];
                
                return (
                  <NoteBlock
                    key={`${note.name}${note.octave}-${chordIndex}`}  // 一意のキー
                    noteIndex={notePosition}  // ピアノ鍵盤の位置（縦軸）
                    chordIndex={chordIndex}   // 時間軸の位置（横軸）
                    duration={1}              // 1拍分の長さ
                    color={color}             // ブロックの色
                  >
                    <NoteText>
                      {note.name}{note.octave}  {/* 音名とオクターブを表示 */}
                    </NoteText>
                  </NoteBlock>
                );
              });
            })}
          </GridContainer>
        </TimelineContainer>
      </PianoRollWrapper>
    </PianoRollContainer>
  );
};

export default PianoRoll;
