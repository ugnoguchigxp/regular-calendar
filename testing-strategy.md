# Testing Strategy for regular-calendar

このドキュメントは、`regular-calendar` プロジェクトのテスト方針を定義します。
本プロジェクトは **React UIコンポーネントライブラリ** であり、アプリケーションロジック（データ取得等）よりも、**表示ロジック、操作性、およびPropsとして渡されたデータのハンドリング** の検証に重点を置きます。

## 🎯 テストの目的
1. **ロジックの正確性**: 複雑なカレンダーロジック（日付計算、イベント配置アルゴリズム）の担保。
2. **インタラクションの検証**: ドラッグ＆ドロップ、リサイズ、モーダル操作などのUI動作確認。
3. **リグレッション防止**: UI変更時の意図しない破壊を防ぐ。

## 📂 テストファイルの配置 (Co-location)

テストファイルは**実装ファイルと同じディレクトリ**に配置します（Co-location）。
機能ごとにディレクトリが切られている現在の構造に従い、関連するコードとテストを近くに保ちます。

```text
src/
  FacilitySchedule/
    components/
      TimelineEvent.tsx
      TimelineEvent.test.tsx      ✅ コンポーネントテスト
    utils/
      layout-algorithm.ts
      layout-algorithm.test.ts    ✅ ロジックテスト
    FacilitySchedule.tsx
    FacilitySchedule.test.tsx     ✅ 統合的なコンポーネントテスト
```

> 🚫 **禁止**: `src/Test/` や `__tests__` ディレクトリにまとめてテストを配置することは避けてください。

## 🧪 テストカテゴリと指針

### 1. ロジックテスト (Unit Test)
純粋な関数、カスタムフック、ユーティリティ関数のテスト。
カレンダーライブラリとして最も重要な「正しい位置にイベントが表示されるか」の計算ロジックはここで厚くテストします。

- **対象**: `src/**/utils/*.ts`, `src/hooks/*.ts`
- **ツール**: Vitest
- **重点項目**:
  - 日付・時間の計算 (Boundary values)
  - イベントの重なり判定・配置計算
  - スキーマバリデーション (`*.schema.ts`)

```typescript
// utils/layout.test.ts
import { calculateEventPosition } from './layout';

it('should calculate correct position for 10:00 event', () => {
  const result = calculateEventPosition('10:00', '12:00');
  expect(result.top).toBe(100);
  expect(result.height).toBe(50);
});
```

### 2. UIコンポーネントテスト (Component Test)
Reactコンポーネントのレンダリングとユーザー操作のテスト。
本ライブラリはデータフェッチを持たず、**Props駆動**であるため、様々なPropsパターンに対する表示結果をテストします。

- **対象**: `*.tsx`
- **ツール**: React Testing Library, `@testing-library/user-event`
- **重点項目**:
  - Propsで渡されたイベントが正しく描画されるか
  - イベントハンドラ（onClick, onDropなど）が正しく発火するか
  - ユーザー操作（クリック、ドラッグ）への応答

```typescript
// components/EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventCard } from './EventCard';

it('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();
  
  render(<EventCard title="Test Event" onClick={handleClick} />);
  
  await user.click(screen.getByText('Test Event'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## � テスト実行環境

### 推奨コマンド
- `pnpm test`: 全テストの実行
- `pnpm test:ui`: Vitest UIを使用した視覚的なテスト実行（推奨）
- `pnpm test -- [filename]`: 特定ファイルのテスト実行

### セットアップ
- `src/test/setup.ts` にグローバルな設定（jest-domの拡張など）が含まれています。
- `jsdom` 環境で動作します。Web API（CanvasやResizeObserverなど）が必要な場合は、適宜Mockを使用してください。

## 📏 コーディング規約 (テスト)

1.  **Describe Block**: コンポーネント名や検証対象の機能名でグルーピングする。
2.  **Test Description (`it`/`test`)**: 「何をしたら(Given/When)」「どうなるべきか(Then)」が分かるように記述する。日本語での記述も可とする。
3.  **Mocking**:
    - 外部ライブラリ（`dnd-kit`や`date-fns`など）のモックは必要最小限に留める。
    - コンポーネントに渡すコールバック関数は `vi.fn()` でモックし、呼び出しを検証する。
4.  **Snapshots**:
    - 大規模なスナップショットは壊れやすいため推奨しません。
    - 変化してはいけない重要なDOM構造や、計算結果のオブジェクトに対してのみ限定的に使用してください。
