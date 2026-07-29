# AGENTS.md

## Cursor Cloud specific instructions

このリポジトリは **算術の塔（Arithmetic Tower）** という日本語の算数RPGです。バニラJS製のフロントエンド（SPA）と、静的配信＋マップ保存APIを持つ Node.js/Express サーバー（`server.js`）で構成されています。ビルド工程やデータベースはありません。

### サービス概要と起動方法
- 唯一のサービスは Express サーバーです。起動は `npm start`（= `node server.js`）。既定ポートは `3000`（`PORT` 環境変数で変更可）。
- 起動後の主なURL:
  - `http://localhost:3000/` … メインゲーム（`index.html`）
  - `http://localhost:3000/算術の塔_マップ画面（エディタ）.html` … マップエディタ
  - `http://localhost:3000/算術の塔_計算ロジック編集ツール（基本）.html` / `（一括）.html` … ロジック編集ツール

### 非自明な注意点（gotchas）
- **ゲーム本体はサーバー無しでも動く**: `index.html` は `maps.js` を `<script>` として直接読み込む（`window.MAPS`）ため、セーブ/スコアは全てブラウザの `localStorage`。データベースや外部APIは不要。
- **`GET/POST /api/maps` は現状のリポジトリ状態では失敗する（既知の制約）**: `server.js` の `readMapsFile()` は `maps.js` から `JSON.parse` しようとするが、`maps.js` のキーが引用符なし（例: `id:`）で厳密なJSONではないためパースエラーになる。このAPIはマップエディタの「サーバー保存」用途のオプション機能で、メインゲームの動作には影響しない。マップエディタの保存機能を検証する場合のみ関係する。
- **テスト/リンターは未設定**: 自動テスト・ESLint等は無い。検証はブラウザでの手動テストが基本（タイトル → モード/難易度選択 → マップ → 戦へ → 戦闘で算数を解いて敵HPを削る）。
- `package.json` の `bump` スクリプトは `scripts/bump_version.js` を参照するが、そのファイルはリポジトリに存在しないため実行不可。

### 依存関係
- Node.js（v22系で動作確認済み）と npm。依存は `express` のみ。`npm install` で導入。
