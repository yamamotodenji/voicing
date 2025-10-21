// ===== コード入力コンポーネント =====
// ユーザーがコード進行を入力し、ボイシング生成をトリガーする機能を提供
//
// このコンポーネントの役割：
// 1. コード進行の入力と管理
// 2. 個別コードの追加・削除機能
// 3. ボイシング生成のトリガー
// 4. 入力状態の管理とバリデーション
// 5. 親コンポーネントへの状態通知

import React, { useState } from 'react';
// React: UIライブラリ（コンポーネント作成の基盤）
// useState: コンポーネント内の状態を管理するHook

import styled from 'styled-components';
// styled-components: CSS-in-JSライブラリ
// コンポーネント単位でスタイルを分離し、動的なスタイリングを実現

// ===== スタイルコンポーネント定義 =====
// 各UI要素に対応するstyled-componentsを定義

// 入力コンテナ
// 全体のレイアウトを制御するコンテナ
const InputContainer = styled.div`
  display: flex;                    // Flexboxレイアウト
  flex-direction: column;           // 縦方向に要素を配置
  gap: 1rem;                       // 子要素間の間隔
  margin-bottom: 2rem;             // 下の余白
`;

// ラベル
// 入力フィールドの説明ラベル
const Label = styled.label`
  font-size: 1.1rem;               // フォントサイズ
  font-weight: 600;                // 太字
  color: #333;                     // ダークグレーの文字色
`;

// テキスト入力フィールド
// コード進行を入力するためのテキストボックス
const Input = styled.input`
  padding: 0.75rem;                // 内側の余白
  border: 2px solid #e1e5e9;       // 境界線（薄いグレー）
  border-radius: 8px;              // 角の丸み
  font-size: 1rem;                 // フォントサイズ
  transition: border-color 0.2s ease; // 境界線色の変化アニメーション

  // フォーカス時のスタイル
  &:focus {
    outline: none;                 // デフォルトのアウトラインを削除
    border-color: #4a90e2;         // 境界線を青色に変更
  }
`;

// ボタン
// アクション実行用のボタンコンポーネント
const Button = styled.button`
  padding: 0.75rem 1.5rem;         // 内側の余白（上下0.75rem、左右1.5rem）
  background: #4a90e2;             // 青色の背景
  color: white;                    // 白色の文字
  border: none;                    // 境界線なし
  border-radius: 8px;              // 角の丸み
  font-size: 1rem;                 // フォントサイズ
  font-weight: 600;                // 太字
  cursor: pointer;                 // ポインターカーソル
  transition: background-color 0.2s ease; // 背景色の変化アニメーション

  // ホバー時のスタイル
  &:hover {
    background: #357abd;           // より濃い青色に変更
  }

  // 無効化時のスタイル
  &:disabled {
    background: #ccc;              // グレーの背景
    cursor: not-allowed;           // 禁止カーソル
  }
`;

// コードリストコンテナ
// 入力されたコード進行を表示するためのコンテナ
const ChordList = styled.div`
  display: flex;                    // Flexboxレイアウト
  flex-wrap: wrap;                  // 要素がはみ出したら次の行に折り返し
  gap: 0.5rem;                     // 子要素間の間隔
  margin-top: 1rem;                // 上の余白
`;

// コードタグ
// 個別のコードを表示するためのタグ風の要素
const ChordTag = styled.span`
  padding: 0.5rem 1rem;            // 内側の余白
  background: #f0f0f0;             // 薄いグレーの背景
  border-radius: 20px;             // 丸い角（ピル形状）
  font-size: 0.9rem;               // 小さめのフォントサイズ
  color: #333;                     // ダークグレーの文字色
  border: 1px solid #ddd;          // 薄いグレーの境界線
`;

// 削除ボタン
// コードタグから個別のコードを削除するためのボタン
const RemoveButton = styled.button`
  margin-left: 0.5rem;             // 左の余白
  background: none;                // 背景なし
  border: none;                    // 境界線なし
  color: #999;                     // 薄いグレーの文字色
  cursor: pointer;                 // ポインターカーソル
  font-size: 0.8rem;               // 小さめのフォントサイズ

  // ホバー時のスタイル
  &:hover {
    color: #ff4444;                // 赤色に変更
  }
`;

// ===== 型定義 =====
// コンポーネントのpropsの型を定義
interface ChordInputProps {
  onChordProgressionChange: (chords: string[]) => void; // コード進行変更時のコールバック
  onGenerateVoicing: () => void;                        // ボイシング生成のコールバック
  isLoading: boolean;                                   // ローディング状態
}

// ===== メインコンポーネント関数 =====
// React.FC<ChordInputProps>: 関数コンポーネントの型定義
// ジェネリクスでpropsの型を指定
const ChordInput: React.FC<ChordInputProps> = ({
  onChordProgressionChange,  // 親コンポーネントから受け取るコールバック関数
  onGenerateVoicing,         // 親コンポーネントから受け取るコールバック関数
  isLoading                  // 親コンポーネントから受け取るローディング状態
}) => {
  // ===== 状態管理 =====
  // コンポーネント内で管理するローカル状態
  
  // 入力フィールドの値
  const [inputValue, setInputValue] = useState('');
  
  // 現在のコード進行（文字列の配列）
  const [chordProgression, setChordProgression] = useState<string[]>([]);

  // ===== イベントハンドラー関数 =====
  // ユーザーのアクションに応じて状態を更新し、適切な処理を実行

  // コードを追加する関数
  const handleAddChord = () => {
    const chord = inputValue.trim(); // 前後の空白を削除
    // コードが空でなく、かつ重複していない場合のみ追加
    if (chord && !chordProgression.includes(chord)) {
      const newProgression = [...chordProgression, chord]; // スプレッド演算子で新しい配列を作成
      setChordProgression(newProgression);                 // ローカル状態を更新
      onChordProgressionChange(newProgression);            // 親コンポーネントに通知
      setInputValue('');                                   // 入力フィールドをクリア
    }
  };

  // コードを削除する関数
  const handleRemoveChord = (index: number) => {
    // filterメソッドで指定されたインデックスの要素を除外した新しい配列を作成
    const newProgression = chordProgression.filter((_, i) => i !== index);
    setChordProgression(newProgression);      // ローカル状態を更新
    onChordProgressionChange(newProgression); // 親コンポーネントに通知
  };

  // キーボードイベントハンドラー
  // Enterキーが押されたときにコードを追加
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddChord();
    }
  };

  // 全てのコードをクリアする関数
  const handleClearAll = () => {
    setChordProgression([]);        // ローカル状態を空配列に設定
    onChordProgressionChange([]);   // 親コンポーネントに通知
  };

  // ===== JSXレンダリング =====
  // コンポーネントのUIを定義
  return (
    <InputContainer>
      {/* 入力フィールドのラベル */}
      <Label htmlFor="chord-input">コード進行を入力してください</Label>
      
      {/* 入力フィールドと追加ボタンのコンテナ */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* テキスト入力フィールド */}
        <Input
          id="chord-input"                                    // ラベルとの関連付け
          type="text"                                         // テキスト入力タイプ
          value={inputValue}                                  // 現在の入力値
          onChange={(e) => setInputValue(e.target.value)}    // 入力値変更時のハンドラー
          onKeyPress={handleKeyPress}                         // キーボードイベントハンドラー
          placeholder="例: C, Am, F, G"                      // プレースホルダーテキスト
          disabled={isLoading}                                // ローディング中は無効化
        />
        {/* 追加ボタン */}
        <Button 
          onClick={handleAddChord}                           // クリック時のハンドラー
          disabled={isLoading || !inputValue.trim()}        // ローディング中または入力値が空の場合は無効化
        >
          追加
        </Button>
      </div>
      
      {/* 条件付きレンダリング：コード進行が存在する場合のみ表示 */}
      {chordProgression.length > 0 && (
        <>
          {/* コード進行のリスト表示 */}
          <ChordList>
            {chordProgression.map((chord, index) => (
              <ChordTag key={index}>
                {chord}
                {/* 削除ボタン */}
                <RemoveButton onClick={() => handleRemoveChord(index)}>
                  ×
                </RemoveButton>
              </ChordTag>
            ))}
          </ChordList>
          
          {/* アクションボタンのコンテナ */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* ボイシング生成ボタン */}
            <Button onClick={onGenerateVoicing} disabled={isLoading}>
              {isLoading ? '生成中...' : 'ボイシング生成'}
            </Button>
            {/* クリアボタン */}
            <Button 
              onClick={handleClearAll} 
              disabled={isLoading} 
              style={{ background: '#ff4444' }}  // インラインスタイルで赤色に変更
            >
              クリア
            </Button>
          </div>
        </>
      )}
    </InputContainer>
  );
};

// デフォルトエクスポート
// 他のファイルでimport ChordInput from './components/ChordInput'として使用可能
export default ChordInput;
