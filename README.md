# ギター練習支援アプリ

キー・スケール・コードを指板で確認できるWebアプリ。

## 技術スタック

| 項目 | 技術 |
| --- | --- |
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| 音楽理論 | Tonal.js |
| 指板描画 | SVG（カスタム実装） |
| データ永続化 | localStorage（Phase 1） |
| ホスティング | Vercel |

## 開発環境のセットアップ

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリが起動します。

## コマンド

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |

## ブランチ戦略

| ブランチ | 用途 |
| --- | --- |
| `main` | 本番（Vercel デプロイ対象） |
| `develop` | 開発ベース |
| `feature/xxx` | 各 Issue 対応ブランチ |

## ディレクトリ構成

```
src/
├── app/            # Next.js App Router（ページ・レイアウト・CSS）
├── components/     # UIコンポーネント
│   ├── fretboard/  # 指板SVG描画
│   ├── scale/      # キー・スケール選択UI
│   └── layout/     # サイドバーレイアウト
├── hooks/          # カスタムフック
├── lib/
│   └── music/      # Tonal.jsラッパー（コンポーネントから直接importしない）
└── types/          # ドメイン型定義
```
