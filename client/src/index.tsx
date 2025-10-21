// Reactライブラリのインポート
// React: コンポーネント作成のためのライブラリ
import React from 'react';

// ReactDOM: DOM操作のためのライブラリ
// React 18では createRoot API を使用
import ReactDOM from 'react-dom/client';

// グローバルスタイルのインポート
import './index.css';

// メインアプリケーションコンポーネントのインポート
import App from './App';

// DOM要素を取得してReactのルートを作成
// document.getElementById('root'): HTMLの<div id="root">要素を取得
// as HTMLElement: TypeScriptの型アサーション（型を明示的に指定）
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// ReactアプリケーションをDOMにレンダリング
// React.StrictMode: 開発時の追加チェックを有効化（本番ビルドでは影響なし）
// 以下の機能を提供：
// - 非推奨APIの警告
// - 副作用の検出
// - 予期しない副作用の警告
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
