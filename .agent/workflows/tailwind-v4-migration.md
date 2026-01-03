---
description: Tailwind v4移行: PostCSSからViteプラグインへ
---

# Tailwind v4 移行ガイド

PostCSSプラグインからViteプラグインへの移行手順。

## 前提条件
- Vite を使用したプロジェクト
- Tailwind v4 (`tailwindcss@^4.x`)

---

## 手順

### 1. パッケージの変更
```bash
# インストール
pnpm add -D @tailwindcss/vite

# 削除（不要になったもの）
pnpm remove @tailwindcss/postcss autoprefixer postcss
```

### 2. vite.config.ts の更新
```typescript
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),  // 最初に配置推奨
    react(),
    // 他のプラグイン
  ],
});
```

### 3. 不要ファイルの削除
```bash
rm postcss.config.js
rm tailwind.config.js  # v3形式は使用されない
```

### 4. CSS側での設定

Tailwind v4 では CSS 内で設定を行う：

```css
@import "tailwindcss";

/* テーマ設定 */
@theme {
  --color-primary: #0066CC;
  --color-secondary: #6B7280;
}
```

---

## 何が変わるか

| Before (v3) | After (v4) |
|-------------|------------|
| `postcss.config.js` | 削除 |
| `tailwind.config.js` | 削除（CSSに移行） |
| `@tailwindcss/postcss` | `@tailwindcss/vite` |
| `autoprefixer` | Tailwindに内蔵 |

---

## トラブルシューティング

### 「設定を変更しても反映されない」
- `tailwind.config.js` はv4で無視される
- CSS内の`@theme`で設定すること

### workspaceルートでインストールエラー
```bash
pnpm add -wD @tailwindcss/vite  # -w フラグを付ける
```
