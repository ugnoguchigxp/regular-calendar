# Theme Fix - Tailwind v4-First Architecture

このドキュメントは、Tailwind v4対応のUIコンポーネントパッケージにおけるテーマとCSS管理のベストプラクティスを記録したものです。
同様の構成を持つ他のパッケージにも適用できます。

## 問題の背景

### 従来の問題点

1. **Tailwindビルドコンテキストの分離**: パッケージ側でTailwindクラスを使用しても、`dist/index.css`にユーティリティクラスが含まれず、npmインストール時にスタイルが壊れる
2. **CSS変数の循環参照**: `--background: var(--background, 0 0% 100%)` のような定義は無効
3. **ダークモードの不整合**: パッケージとホストアプリで`.dark`クラスの適用が連動しない

### 解決策: Tailwind v4-First アーキテクチャ

**設計思想**: パッケージはTailwindクラスをそのまま使用し、**ホストアプリのTailwind v4がビルド時にすべてをコンパイルする**

---

## パッケージ側の構成

### ファイル構成

```
src/
├── index.ts          # コンポーネントエントリポイント
├── index.css         # エディタ固有のスタイル（ProseMirror等）
├── theme.css         # CSS変数定義（ライト/ダークモード）
└── components/       # Tailwindクラスを使用したコンポーネント

dist/
├── index.js          # ビルド済みコンポーネント
├── index.d.ts        # 型定義
├── index.css         # エディタ固有のスタイル
└── theme.css         # CSS変数定義
```

### package.json の exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/index.css",
    "./theme.css": "./dist/theme.css"
  }
}
```

### ビルドスクリプト

```json
{
  "scripts": {
    "build:css": "cp ./src/index.css ./dist/index.css && cp ./src/theme.css ./dist/theme.css"
  }
}
```

**重要**: Tailwindでビルドしない。CSSファイルはそのままコピーする。

### theme.css の内容

```css
/**
 * Theme Variables - shadcn-compatible
 */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
  }
}
```

### index.css の内容（例）

```css
/* エディタ固有のスタイルのみ。CSS変数定義は含めない */
@layer base {
  :root {
    /* UI Density変数など、エディタ固有の設定 */
    --ui-component-height: 2.5rem;
  }
}

/* ProseMirror、エディタUI等のスタイル */
.ProseMirror {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### コンポーネントでのTailwindクラス使用

```tsx
// Tailwindクラスをそのまま使用
<div className="bg-popover text-popover-foreground border border-border rounded-lg">
  {/* コンテンツ */}
</div>
```

---

## ホストアプリ側の設定（ユーザーがやること）

### Tailwind v4 の場合

```css
/* index.css */
@import "tailwindcss";

/* パッケージのコンポーネントをスキャン対象に含める */
@source "./node_modules/markdown-wysiwyg-editor/dist/*.js";

/* テーマ変数をインポート（オプション：独自定義も可） */
@import "markdown-wysiwyg-editor/theme.css";

/* エディタ固有のスタイルをインポート */
@import "markdown-wysiwyg-editor/style.css";

/* Tailwind v4のテーマ設定 */
@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --variant-dark: .dark &;
}
```

### テーマのカスタマイズ

theme.cssをインポートせず、独自のCSS変数を定義することもできます：

```css
@import "tailwindcss";
@source "./node_modules/markdown-wysiwyg-editor/dist/*.js";
@import "markdown-wysiwyg-editor/style.css";

/* 独自のテーマ定義 */
@layer base {
  :root {
    --background: 210 50% 98%;
    --foreground: 220 20% 20%;
    --popover: 0 0% 100%;
    --popover-foreground: 220 20% 20%;
    /* ... 他の変数 */
  }
  
  .dark {
    --background: 220 20% 10%;
    --foreground: 210 50% 95%;
    /* ... 他の変数 */
  }
}
```

---

## チェックリスト

新しいパッケージに適用する際のチェックリスト：

- [ ] `src/theme.css` を作成（CSS変数定義のみ）
- [ ] `src/index.css` からCSS変数定義を削除（循環参照を避ける）
- [ ] `package.json` の `exports` に `./theme.css` を追加
- [ ] `build:css` スクリプトを `cp` コマンドに変更（Tailwindでビルドしない）
- [ ] コンポーネントでTailwindクラスを使用（`bg-popover`, `text-foreground`等）
- [ ] ダークモード対応: `.dark` クラスでCSS変数を切り替え
- [ ] README に Tailwind v4 セットアップ手順を追加

---

## メリット

1. **Tailwindエコシステムとの完全統合** - ホストのテーマがそのまま適用される
2. **カスタマイズの柔軟性** - ユーザーがCSS変数を上書きするだけ
3. **ダークモード自動対応** - `.dark` クラスの切り替えが自然に動作
4. **軽量な配布物** - ユーティリティクラスのCSSを含まないため小さい
5. **デバッグの容易さ** - ホストのDevToolsで変数を確認できる
