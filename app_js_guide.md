# app.js 説明（日本語）

このドキュメントは app.js の全体像と主要な機能ブロックを日本語で説明します。

## 1. 共通ユーティリティ
- `rand(min, max)`
  - 乱数を整数で返します。
- `resolveStat(v)`
  - 敵ステータスが配列（例: `[10, 20]`）の場合に、範囲内の乱数へ解決します。

## 2. 設定（CONFIG）
- ゲーム全体のバランス調整や挙動をまとめた設定オブジェクトです。
- 主要な設定
  - `score`: スコア計算係数（別ファイルの `calculateScore.js` と連携）
  - `damageCalc`: ダメージ計算の補正値
  - `respawn`: 敵の復活設定
  - `statusUpByGrade`: レベルアップ時の増加量（難易度別）

## 3. 初期値（DEFAULTS）
- ゲーム開始時に使う初期値をまとめたものです。
- `player`: 初期プレイヤーステータス
- `settings`: 操作モードやレーダーサイズなどの初期設定
- `run`: 死亡数などの初期値
- `cloneDefault(value)`
  - JSON で安全に複製するためのヘルパーです。

## 4. セーブ管理（SaveSystem）
- ローカルストレージにセーブ配列を保存します。
- `append(data)`
  - 先頭に新しいセーブを追加し、最大スロット数を超えた分を切り捨てます。

## 5. 動的設定（GRADES 由来）
- `GRADES` が存在する場合に、難易度リストを動的に生成します。

## 6. 実行時ストア（Store）
- プレイ中の状態を保持します。
- 主な内容
  - `player`: 現在のプレイヤーステータス
  - `floorIndex`: 現在のフロア
  - `elapsedSeconds`: 経過時間
  - `totalKills`: 撃破数
  - `deaths`, `floorDeaths`: 死亡数
  - `settings`: 操作設定
  - `lastEncounter`, `lastBattle`: ログ表示用の直近情報

## 7. 共有ヘルパー
- `getMaps()` / `getMapData()`
  - `maps.js` のマップ情報を取得します。
- `ensureFloorState()`
  - フロアごとの状態を初期化します。
- タイマー系
  - `startRunTimer()` / `stopRunTimer()` / `resetRunTimer()`
- スコア系
  - `computeScore()`
    - `calculateScore.js` が読み込まれていればそちらを使用します。
    - 未読み込みなら簡易計算式でフォールバックします。
- セーブデータ系
  - `buildSaveData()` / `applySaveData()` / `autosave()`

## 8. スコア管理（ScoreStore）
- フロア別に Top30 のスコア一覧をローカル保存します。
- `record(entry)`
  - スコアを追加し、降順で整列して上位 30 件を保持します。
- `listByFloor(floorIndex)`
  - 指定フロアのスコア一覧を取得します。

## 9. MapEngine
- マップ探索画面のロジックです。
- 主要な処理
  - `mount(container)`
    - マップ画面のDOM構築とイベント設定
  - `updateRadar()`
    - レーダーの再描画
  - `handleAction()` / `moveAbsolute()`
    - 移動操作（相対・方位）
  - `processEvent()`
    - イベントマス処理

## 10. バトル画面スタイル（BATTLE_CSS_SCOPED）
- バトル画面専用のCSSを文字列で定義し、スコープ化して注入します。
- 画面高さは `100%` を基準に、外側レイアウトに合わせて描画します。

## 11. BattleEngine
- バトル処理の中心。
- 主要な処理
  - `startBattle()`
    - 敵生成・ステータス初期化
  - `generateCardData()` / `renderHand()`
    - カード生成と描画
  - `ok()`
    - 正解入力処理（コンボ・必殺・麻痺など）
  - `handleVictory()`
    - 勝利後の経験値処理
  - `openLvUp()` / `closeLvUp()`
    - レベルアップUI
  - `tick()`
    - 敵の行動タイマー更新

## 12. 画面群（Title / Map / Battle / Result）
- `TitleScreen`
  - 難易度選択・コンティニュー・セーブ/ロード
- `MapScreen`
  - マップ探索・遭遇処理・逃走処理
- `BattleScreen`
  - バトル開始と終了処理
- `ResultScreen`
  - スコア表示とフロア別 Top30 一覧

## 13. ルーティング & 起動
- `router()`
  - `location.hash` に基づいて画面を切り替えます。
- `initFooterSettings()`
  - フッター設定モーダルの初期化
- `DOMContentLoaded`
  - 初回の `router()` と設定初期化を実行します。

---

必要なら、各関数の詳細フローや依存関係（MapEngine ⇔ BattleEngine など）の説明も追加できます。
