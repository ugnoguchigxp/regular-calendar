# シフト指定専用UI 計画書（独立画面）

> Version: 1.0.0  
> Status: Draft  
> Last Updated: 2026-02-07

## 0. 目的

`RegularCalendar` と `FacilitySchedule` とは**完全に別の操作モデル**で、シフトを高速に指定・調整できる専用UIを新設する。

- 対象: スタッフ勤務シフトの作成・変更・一括調整
- 非対象: 施設イベント管理、ベッド予約管理、時系列カレンダー表示の編集
- 位置づけ: 「閲覧主体のカレンダー」ではなく「入力主体の割当エディタ」

## 1. コンセプト

## 1.1 画面名

**Shift Selector Board（SSB）**

## 1.2 基本思想

- 横軸: 日付（週/2週/月）
- 縦軸: スタッフ
- セル: 「勤務帯 + 勤務形態 + 担当エリア」を保持
- 操作: クリック入力ではなく、**選択して適用する“スプレッドシート操作”**を主軸にする

## 1.3 既存画面との分離ルール

- `RegularCalendar` コンポーネントは使用しない
- `FacilitySchedule` コンポーネントは使用しない
- 同じ `ScheduleEvent` データを使う場合も、表示/編集ロジックは共有しない
- 連携は「保存済みデータの相互参照」のみ（UIロジックは完全分離）

## 2. 画面設計

## 2.1 レイアウト

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Shift Selector Board                                                     │
│ 期間[2026/02 第3週] 表示[週|2週|月] センター[Tokyo] 役割フィルタ[NS,Dr,Tech] │
├──────────────────────────────────────────────────────────────────────────┤
│ クイック指定: [午前フル] [午後フル] [夜間フル] [休み] [クリア] [ペイントON]   │
├──────────────┬───────────────────────────────────────────────────────────┤
│ スタッフ列      │ 日付グリッド（スタッフ x 日付）                          │
│ Dr 佐藤  32h ⚠ │ 2/16 2/17 2/18 2/19 ...                                 │
│ NS 山田  36h   │ [午前F][午前F][休み ][午後F] ...                          │
│ NS 高橋  40h ⚠ │ [午後F][午後F][午後F][1/2後] ...                          │
│ Tech 鈴木 28h  │ [午前F][休み ][午前F][休み ] ...                          │
├──────────────┴───────────────────────────────────────────────────────────┤
│ 日次サマリー: 2/16 午前4 午後1 夜間0 / 不足:技士1                          │
│ [範囲一括設定] [行一括設定] [前週複製] [テンプレート適用] [保存]            │
└──────────────────────────────────────────────────────────────────────────┘
```

## 2.2 セル仕様

1セルは以下を表示する。

- 1段目: 勤務帯（午前/午後/夜間/休み）
- 2段目: 勤務形態（フル/1-2前/1-2後/1-4/カスタム）
- 補助: エリアタグ（例: `A棟`）

状態色:
- 通常: 職種カラー
- 休み: グレー
- 警告: 赤枠（連勤超過、時間超過、必要人数割れ）

## 2.3 編集操作

- 単一編集: セルクリック -> ミニポップオーバーで即決定
- 範囲編集: ドラッグ選択 -> 一括適用
- 行編集: スタッフ名メニュー -> 週間パターン適用
- 列編集: 日付ヘッダーメニュー -> 全員へ同一指定
- ペイント編集: プリセット選択後にセルをなぞって連続適用

## 2.4 時短機能

- 前週/前月複製
- テンプレート適用（通常週、祝日週、最小人員週）
- ルール適用（平日のみ、特定職種のみ、夜勤除外）
- Undo/Redo（操作履歴 30件）

## 3. 情報設計（カレンダー非依存）

## 3.1 画面内モデル

```ts
export type WorkPattern = 'full' | 'half_first' | 'half_second' | 'quarter' | 'custom';

export type ShiftBand = 'morning' | 'afternoon' | 'night' | 'off';

export interface ShiftCellValue {
  band: ShiftBand;
  pattern: WorkPattern;
  areaId?: string;
  customStart?: string; // HH:mm
  customEnd?: string;   // HH:mm
}

export interface ShiftAssignmentDraft {
  staffId: string;
  date: string; // YYYY-MM-DD
  value: ShiftCellValue;
  source: 'manual' | 'bulk' | 'template' | 'copy';
}
```

## 3.2 永続化変換

保存時に `ShiftAssignmentDraft` を API 形式へ変換する。

- 新規: `createShiftAssignments[]`
- 更新: `updateShiftAssignments[]`
- 削除: `deleteShiftAssignments[]`

注: 既存システムで `ScheduleEvent`/`HospitalEvent` を使う場合は、**アダプタ層**で相互変換する。
UIモジュール本体はイベント概念を知らない。

## 4. コンポーネント構成案

```text
src/ShiftSelector/
├── ShiftSelectorBoard.tsx
├── ShiftSelector.schema.ts
├── ShiftSelector.schema.test.ts
├── hooks/
│   ├── useShiftSelectorState.ts
│   ├── useBulkSelection.ts
│   ├── useShiftValidation.ts
│   └── useShiftSavePipeline.ts
├── components/
│   ├── ShiftSelectorToolbar.tsx
│   ├── StaffColumn.tsx
│   ├── ShiftGrid.tsx
│   ├── ShiftCell.tsx
│   ├── ShiftCellPopover.tsx
│   ├── BulkApplyModal.tsx
│   ├── RowPatternModal.tsx
│   ├── ColumnApplyModal.tsx
│   ├── TemplatePanel.tsx
│   ├── DailySummaryBar.tsx
│   └── ValidationBanner.tsx
├── adapters/
│   └── shiftAssignmentAdapter.ts
├── utils/
│   ├── shiftTimeMath.ts
│   ├── shiftDiff.ts
│   └── shiftTemplateStorage.ts
└── constants.ts
```

## 5. 操作フロー

## 5.1 基本フロー

1. 期間・センターを選択
2. 既存シフトを読み込み
3. セル/範囲/行/列で割当編集
4. 右下サマリーで不足・超過を確認
5. 保存で差分送信

## 5.2 保存フロー

1. 初期状態との差分計算
2. `create/update/delete` に分類
3. `Promise.allSettled` で送信
4. 失敗分のみ再試行キューへ残す
5. 結果トースト表示（成功件数/失敗件数）

## 6. バリデーション

- 必須ロール不足（例: 午前帯で Dr 1 / NS 2 / Tech 1 未満）
- 個人週次上限超過（例: 40h）
- 連続勤務上限超過（例: 6日超）
- 同一スタッフ同時刻重複

表示方法:
- セル: 赤枠
- スタッフ名: ⚠ バッジ
- 画面上部: ValidationBanner で一覧

## 7. 実装フェーズ

## Phase 1: 基盤（1.5日）
- スキーマ、定数、時間計算、差分計算
- `useShiftSelectorState` / `useShiftSavePipeline`
- 単体テスト（schema/time/diff）

## Phase 2: グリッド編集（2.5日）
- `ShiftGrid` / `ShiftCell` / `ShiftCellPopover`
- 単一編集、ペイント編集
- 日次サマリー表示

## Phase 3: 一括操作（2日）
- 範囲選択、行一括、列一括
- 前週複製
- Undo/Redo

## Phase 4: テンプレートと検証（1.5日）
- テンプレート保存/適用
- バリデーション表示
- 警告UI仕上げ

## Phase 5: 連携・公開（1日）
- アダプタ層で既存保存形式と接続
- `src/index.ts` export 追加
- `type-check`, `lint`, `test`, `build`

**合計: 8.5日（約2週間）**

## 8. 受け入れ基準

- `RegularCalendar` と `FacilitySchedule` を使わずにシフト指定が完結する
- 単一編集・範囲編集・行編集・列編集ができる
- 前週複製とテンプレート適用ができる
- 不足人員/時間超過/連勤超過を視覚表示できる
- 保存が差分送信で実行できる
- 失敗時に部分リトライできる
- `npm run type-check && npm run lint && npm run test && npm run build` が通る

## 9. スコープ外

- 自動シフト最適化（AI/数理最適化）
- スタッフ希望提出ワークフロー
- 給与計算・勤怠締め処理
- モバイル専用画面の最適化

## 10. 主要リスクと対策

- リスク: 大規模スタッフ数で描画が重い
  - 対策: 行仮想化（virtualized rows）を Phase 3 で導入可能な設計にする
- リスク: 一括操作の誤更新
  - 対策: 適用前プレビュー + Undo/Redo + 保存前差分レビュー
- リスク: 既存データ形式との齟齬
  - 対策: UI層と永続化層の間に必ず `adapter` を置く
