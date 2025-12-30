# diacom2Concept - 開発ガイドライン

## 🎯 プロジェクト概要
**タッチパネル医療画像管理アプリ**
- **Stack**: React 19.x + TypeScript + Vite + Tauri 2.x
- **CSS**: Tailwind CSS (clsx, tailwind-merge)
- **State**: React Context + TanStack Query
- **i18n**: i18next

## ⚡ 必須遵守
### コーディング規約
1. **console.log禁止**: `@logger`使用(Biomeエラー)
2. **any禁止**: 適切な型定義か`unknown`使用
3. **i18next必須**: UI文字列ハードコード厳禁
4. **Schema-First必須**: ドメインデータ型は必ずZodスキーマ定義。UIコンポーネントのProps制御用のみ`interface`許容
5. **TanStack Query必須**: `fetch`/`axios`直接使用禁止。データ取得・更新はTanStack Query経由
6. **マジックナンバー禁止**: 定数化必須
7. **Responsive**: `useIsMobile`フック、Tailwind `md:`/`lg:`/`xl:`活用
8. **状態管理**: React Context + TanStack Query基本。React 19機能(`useOptimistic`等)はTanStack Queryと役割分担して使用
9. **localStorage使用制限**: UI設定・一時記録のみ保存可。**患者データ等のビジネスデータ保存禁止**
10. **Server Components禁止**: React Server Componentsは使用しない

### AI動作制約
- **サーバー起動禁止**: ユーザー起動サーバーのみ使用
- **循環参照禁止**: import循環・コンポーネント相互参照回避
- **バイパス禁止**: 認証バイパス等、如何なる理由があっても実装しない
- **汎用性必須**: 特定要件専用コード禁止、再利用可能な設計
- **無限ループ回避**: `useEffect`/`useRef`依存配列厳守
- **日本語利用**: 質問が英語で無い限り、回答、説明、コード内のコメントも日本語記述
- **ビルドチェック**: ユーザーに作業完了報告前に、ビルドエラーが起きないか確認。(質問の回答時は行わない)
- **Design System原則**: ボタン等の汎用UIは、必ず `@gxp/design-system` を使用する（独自実装禁止）。
- **コンポーネント配置**: ドメイン固有コンポーネントは `src/modules/{domain}/` 直下、または `components/` に配置する（Flat-First）。

### プロジェクト設定
- **言語**: TypeScriptを使用する
- **コメント**: JSDocを含むすべてのコードコメントは **日本語** で記述する
- **Biome**: 2スペース、100文字、シングルクォート、セミコロン必須。フォーマットはBiomeで統一する
- **パスエイリアス**: `@src/*`, `@components/*`, `@lib/*`, `@logger`
- **環境変数**: `import.meta.env` の直接参照は避け、可能な限り Zod で検証を行う

### 命名規則
| 対象 | 規則 | 例 |
| :--- | :--- | :--- |
| **ファイル（コンポーネント）** | PascalCase | `PatientCard.tsx`, `BedSchedule.schema.ts` |
| **ファイル（ユーティリティ）** | camelCase または kebab-case | `hooks.ts`, `utils.ts`, `repositories.ts` |
| **コンポーネント名** | PascalCase | `const PatientCard = () => {...}` |
| **関数・変数** | camelCase | `fetchPatientData`, `isLoading` |
| **定数** | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| **型・インターフェース** | PascalCase | `type Patient`, `interface IRepository` |
| **Zodスキーマ** | PascalCase + Schema | `PatientSchema`, `UserSchema` |
| **TanStack Query キー** | camelCase配列 | `['patients', 'list', params]` |
| **CSSクラス（カスタム）** | kebab-case | `.patient-card`, `.bed-schedule` |

## 🏛️ 設計原則
- **DRY**: 重複コード共通化
- **KISS + YAGNI**: シンプル優先、未確定機能作成禁止
- **単一責任・関心分離**: 1コンポーネント1責務。UI・ロジック・データ取得分離
- **依存性逆転**: 具象(`fetch`)でなく抽象(`useApiClient`)依存
- **合成 > 継承**: コンポーネントは合成(Composition)
- **最小驚愕**: 直感的な命名と振る舞い

## 🎨 実装ルール
### ディレクトリ構成
- **`@gxp/design-system` (外部パッケージ)**
  - ボタン・入力・モーダル・カードなどの **汎用UIコンポーネントライブラリ**
  - アプリケーション固有の `src/components/ui` は原則作成せず、Design Systemからインポートして使用する
  - `import { Button, Card } from '@gxp/design-system';`

- **`src/modules/{domain}/`**
  - **RAG-friendly Architecture** (詳細は `RAG_DOC_RULES.md` 参照)
  - **Flat-First**: 可能な限りフラットな構造を保つ
  - 構成要素:
    - `[DomainName].tsx`: **エントリーポイント**。JSDocで機能とユーザーストーリー記述 (`Main.tsx`の役割)
    - `[DomainName].schema.ts`: **Schema-First**。Zodスキーマと型定義を集約 (`types.ts` の代替)
    - `hooks.ts`: カスタムフックを集約
    - `repositories.ts`: データアクセスロジックを集約
    - `README.md`: RAG用ドキュメント（構成、仕様、ストーリー）
    - `[DomainName].test.tsx`: ユーザーストーリーベースのテスト
    - `index.ts`: **禁止**。RAG最適化と循環参照回避のため、バレルファイル(Barrel File)は作成せず、具体的なファイルから直接インポートする (`import ... from './Personnel.schema'`)
  - **サブディレクトリ分割基準**: 1ファイルが300行を超える、または同種のファイルが5つ以上になった場合のみ `components/`, `hooks/` 等のサブディレクトリ分割を検討する

- **`src/pages/`**
  - **Thin Wrapper**: ルーティングのエンドポイントとしての役割のみ
  - ロジックを持たず、`src/modules` からコンポーネントをインポートして描画するだけにする
  - `export { [DomainName] as default } from '@src/modules/[domain]';` のような形が理想

### コンポーネント実装
- **Design System優先**: 新規UI実装時は `@gxp/design-system` のコンポーネントを組み合わせて構築する（汎用部品の独自実装は避ける）
- **スタイリング**: Tailwind CSSクラスのみ。Design Systemの制約に従う
- **Schema-First**:
  - **ドメイン/APIデータ**: `interface` / `type` を手書きせず、`[DomainName].schema.ts` で Zod スキーマを定義する
    - `export type User = z.infer<typeof UserSchema>;`
  - **UI Props**: コンポーネントの表示制御に関わるProps (`isOpen`, `variant`等) は `interface` 定義を許容する
  - **禁止事項**: 今後 `types.ts` を使用することを **禁止** とする。既存の `types.ts` は規約違反状態とみなし、修正のタイミングで必ず `[DomainName].schema.ts` へ移行すること。
  - **テスト配置**: **Co-location** を原則とする。`Test/` フォルダは作成せず、テスト対象ファイルと同じディレクトリに `*.test.tsx` (または `*.test.ts`) を配置する。
    - ✅ `src/modules/auth/Auth.test.tsx`
    - ❌ `src/Test/Auth.test.tsx`, `root/Test/Auth.test.tsx`

### Logger
- すべての機能やページは `createContextLogger('ContextName')` で専用ロガーを初期化する
- 情報は `log.info` / `log.warn` / `log.error` など意味に沿ったレベルで記録し、必ずオブジェクトに文脈情報を含める

### エラーハンドリング
- **try-catch**: 非同期処理では必ず try-catch を使用し、エラーを適切にログ出力・通知する
- **Error Boundary**: ページ単位で `ErrorBoundary` コンポーネントを設置し、予期しないエラーからの復旧を可能にする
- **ユーザー通知**: エラー発生時は Notification コンテキストを使用してユーザーに通知する
- **再スロー禁止**: catch ブロックで何も処理せず再スローするだけのコードは禁止

### 国際化 (i18n)
- **ファイル**: `src/locales/{en,ja}.json`
- **実装**:
  - 基本: `const { t } = useTranslation(); <button>{t('save')}</button>`
  - 名前空間: `const { t } = useTranslation('settings'); <span>{t('theme')}</span>`
- **キー設計 (DRY最優先 / A: 画面非依存の再利用)**:
  - **概念キー**: キーは「どの画面か」ではなく「何を意味するか」で命名する
    - ✅ `language`, `timezone`, `number_format`, `current_value`
    - ❌ `basic_settings_language`, `settings_timezone`, `config_number_format`
  - **重複禁止**: 同じ意味・同じ表示結果になる文言を別キーで増やさない（DRY違反）
    - ✅ 既存キーがあれば必ず流用する
    - ✅ 文言が同じでも意味が違う場合のみ別キーを許可（例: "Close" = 閉じる/閉院 など）
  - **ネスト最小**: 原則トップレベル。衝突回避や構造が必須な場合のみ浅いネストを許可
    - ✅ `table.delete`, `markdown_editor.bold`
    - ❌ `settings.basic.display.number.format.label` のような深いネスト
  - **キー命名の目安**:
    - **名詞/状態**: `language`, `timezone`, `none`, `left_to_right`
    - **ラベル**: `{concept}_label`（例: `system_name_label`）
    - **説明**: `{concept}_description`（例: `system_name_description`）
    - **プレースホルダ**: `{concept}_placeholder`（例: `maintenance_message_placeholder`）

### API実装 (3層アーキテクチャ)
**禁止**: ページコンポーネントでの `fetch` / `useQuery` の直接使用
**必須**:
1. **Repository**: データアクセス (API/Mock)
2. **Custom Hook**: TanStack Queryによるデータ管理
3. **Component**: UI表示

#### ロジック分離
| 分類 | Custom Hook (`src/modules/{domain}/hooks.ts`) | Repository (`src/modules/{domain}/repositories.ts`) |
| :--- | :--- | :--- |
| **役割** | **React接着剤** | **純粋ロジック・通信** |
| **依存** | React API | React非依存 (useApiClient, Zod等) |
| **内容** | TanStack Query呼び出し<br>Loading/Error公開 | API通信<br>**Mock生成・遅延**<br>計算・変換 |
| **テスト** | `renderHook`必要 | 単体テスト可(高速) |

**禁止**: Hook内でのデータ生成・加工、Repository内での `useState`/`useEffect` 使用

#### Repository実装ルール
1. **Repository Factory**: `createRepository` を使用して環境に応じた実装を切り替える
2. **Interface**: 必ずインターフェース (`I{Domain}Repository`) を定義する
3. **Mock実装**: `STANDALONE` モード用の `MockRepository` クラスを必ず実装する
4. **Real実装**: `PRD/UAT/DEV` モード用の `RealRepository` クラスを実装する

```typescript
// 実装例
export const userRepository = createRepository(
  UserRepository,      // Real implementation
  MockUserRepository   // Mock implementation
);
```

### 状態管理 & キャッシュ戦略
- **URL as Single Source of Truth**:
  - 一覧画面の状態（ページネーション、ソート、フィルタ）は **URL クエリパラメータ** で管理する
  - `useListQueryParams` フックと Zod スキーマを使用して型安全に実装する
  - `useState` での永続的な UI 状態管理は避ける
- **TanStack Query Integration**:
  - Query Key には必ず URL パラメータを含める
  - **Query Key Factory** (`queries.ts`) を使用してキー生成を一元化する
  - ページネーション時のちらつき防止に `placeholderData: keepPreviousData` を使用する
- **Invalidation**:
  - 更新系処理（作成・更新・削除）後は、Factory キーを使用して関連する一覧クエリを Invalidate する
- **Query Key Definition (`queries.ts`)**:
  - TanStack Query の Query Key 定義は、必ず `src/modules/{domain}/queries.ts` に集約する
  - 複数のキーがある場合も、このファイルに追記する形で管理する（分散させない）

```typescript
// src/modules/patient/queries.ts - 実装例
import type { PatientListParams } from './Patient.schema';

export const patientKeys = {
  // ベースキー
  all: ['patients'] as const,
  // 一覧系
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params: PatientListParams) => [...patientKeys.lists(), params] as const,
  // 詳細系
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

// 使用例: hooks.ts
// useQuery({ queryKey: patientKeys.list({ wardId, page }), queryFn: ... })
// queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
```

### ローディング表示
**TanStack Query使用時の初期ローディング**:
- **必須**: ページ初期化でデータがまだ届いていない場合は、想定レイアウトと同じサイズ感のSkeletonを縦に並べ、中央付近のSkeletonに大きめのスピナーを重ねて表示する
- **目的**: ユーザーにデータ取得中であることを明確に伝える

**使い分け**:
- **初期ローディング**: `Skeleton + Spinner` (ページ全体のデータ取得)
- **再取得**: Spinnerのみ or 既存データ表示 (リフレッシュ時)
- **部分更新**: Mutation後は楽観的更新推奨

### 初期化エラー通知
- **必須**: TanStack Queryが設定されたすべての再試行を行っても初期データ取得に失敗した場合は、Notificationコンテキストのエラー通知機能でユーザーに知らせる
- **内容**: 通知タイトルは「読み込み失敗」など状況が分かる文言にし、本文にはHTTPステータスやネットワークエラーなど失敗理由を含める
- **タイミング**: 自動リトライが続いている間は通知せず、TanStack Queryが最終的に失敗状態を返した瞬間に1回だけ通知する
- **目的**: 初期表示不能時にも即座にフィードバックと復旧策（再試行等）を提示する

### ボタンの非同期状態管理
**登録・更新ボタンの実装**:
- **必須**: 登録/更新ボタンはAPI送信時に `loading` と `success` の2つの状態を管理する
- **状態管理**:
  - `isSubmitting` (boolean): API送信中かどうか
  - `isSuccess` (boolean): API送信が成功したかどうか
- **動作フロー**:
  1. **送信開始**: ユーザーがボタンをクリックしたら `isSubmitting` を `true` に設定。ボタンのテキストが消えて回転するSpinnerを表示
  2. **送信完了**: API呼び出しが成功したら `isSubmitting` を `false`、`isSuccess` を `true` に設定。Spinnerがチェックマーク(✓)に変わる
  3. **フィードバック待機**: チェックマークを1秒間表示してユーザーに成功を視覚的に伝える
  4. **クリーンアップ**: 待機後にモーダルを閉じる、またはフォームをリセットする
- **Buttonコンポーネントのプロップス**:
  - `loading={isSubmitting}`: Spinner表示の制御
  - `success={isSuccess}`: チェックマーク表示の制御
  - `variant="positive"`: 肯定的なアクションを示す
- **エラー処理**: API呼び出しが失敗した場合は `isSubmitting` を `false` に戻し、エラー通知を表示する

**使い分け**:
- **登録/更新ボタン**: `loading` + `success` の両方の状態を使用（モーダル内のフォーム送信など）
- **検索/フィルタボタン**: `loading`のみ使用（successフィードバックは不要）
- **削除ボタン**: 確認ダイアログ後に `loading` のみ使用（削除後は即座にUIを更新）

## 📱 UI/UX & プラットフォーム
### タッチファーストデザイン (Touch First Design)
- **ターゲット**: PC/タブレット(Tauri)、スマホ(Web)
- **ホバー依存禁止**: タップのみで完結すること
- **スクロール回避**: ページネーションを活用し、スクロールバーは極力非表示にする
- **余白最適化**: Design System のスペーシングトークン（`--spacing-*`）を使用する。個別の margin/padding 値のハードコードは避ける

### アクセシビリティ (a11y)
- **ARIA属性**: インタラクティブ要素には適切な `aria-label`, `aria-describedby` を付与する
- **キーボード操作**: すべての操作がキーボードのみで完結できること（Tab, Enter, Escape）
- **フォーカス表示**: フォーカス状態を視覚的に明確にする（`focus-visible` 活用）
- **色のコントラスト**: WCAG 2.1 AA 基準（4.5:1以上）を満たす
- **代替テキスト**: 画像には必ず `alt` 属性を付与する（装飾的な画像は `alt=""`）

### Tauri & デバイス通信
- **非同期処理**: デバイス通信はRustバックエンドで行い、フロントエンドは非同期で受け取る。UIブロックは厳禁

## 🛡️ コンプライアンス
### 医療機器認定 (SaMD)
- **ユーザビリティ**: ヒューマンエラーを防止する設計にする
- **安全設計**: 破壊的操作（削除など）は確認ダイアログを必須とする
- **一貫性**: 操作の一貫性を維持する

### GDPR & プライバシー
- **Privacy by Design**: デフォルトでプライバシー保護を考慮する
- **データ最小化**: 不要な個人情報は扱わない
- **監査証跡**: データの変更・閲覧ログを考慮する
- **セキュリティ**: `DOMPurify` を使用し、`sessionStorage` を推奨する

### LocalStorage使用ポリシー
- **保存可能**: UI設定・表示設定・ユーザー操作の一時記録のみ
  - ✅ 例: テーマ、言語、サイドバー開閉状態、最終訪問ページ
- **保存禁止**: ビジネスデータ・機密情報・大量データ
  - ❌ 禁止例: イベントデータ、患者情報、予約データ、トークン
- **原則**: ビジネスデータはAPI経由で管理し、LocalStorageはキャッシュに使用しない
- **推奨**: データキャッシュが必要な場合は TanStack Query を使用する

## 🧪 テスト & パフォーマンス
### テスト
- **ツール**: Vitest + @testing-library/react
- **方針**: 単体テスト重視。実装詳細ではなく「振る舞い」をテストする
- **配置**: テストファイルは実装ファイルと同じ階層に配置する (**Co-location**)。ルートディレクトリの `Test` フォルダは使用しない。
- **禁止**: カバレッジのためだけに、テストを通すだけの不自然な実装をしない

### パフォーマンス
- **計測**: 推測で最適化せず、計測後に最適化する (`React.memo` 等)
- **TanStack Query**: `staleTime` を適切に設定し、不要なリクエストを防ぐ
- **楽観的更新**: `onMutate` を活用して体感速度を向上させる

## 🤝 運用ルール
- **ボーイスカウトルール (Boy Scout Rule)**: 変更時は周辺コードも改善する
- **チェック**:
  - 変更時: `pnpm format && pnpm type-check && pnpm lint:fix && pnpm build`
  - デプロイ前: `pnpm test && pnpm build`

### コミット規約 (Conventional Commits)
- **形式**: `<type>(<scope>): <subject>`
- **type**:
  | type | 説明 |
  | :--- | :--- |
  | `feat` | 新機能 |
  | `fix` | バグ修正 |
  | `docs` | ドキュメントのみの変更 |
  | `style` | コードの意味に影響しない変更（フォーマット等） |
  | `refactor` | バグ修正でも機能追加でもないコード変更 |
  | `test` | テストの追加・修正 |
  | `chore` | ビルドプロセスやツールの変更 |
- **例**: `feat(patient): 患者一覧にフィルター機能を追加`, `fix(auth): ログイン時のトークン保存エラーを修正`
- **subject**: 日本語可、命令形で記述、50文字以内
