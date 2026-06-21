# guitar-practice-app

ギター練習支援アプリ — キー・スケール・コードを指板で確認できるWebアプリ

## 技術スタック

- Next.js 15 (App Router) / TypeScript / Tailwind CSS v4
- Tonal.js（音楽理論ライブラリ）
  - 今後自作の音楽理論ライブラリを作成する想定のため、Tonal.jsは分断しやすい形式で使用
- SVGカスタム指板描画

## ブランチ戦略

- main: 本番
- develop: 開発ベース
- feature/xxx: 各Issue作業

## コミット規約（Conventional Commits）

- feat: 新機能
- fix: バグ修正
- chore: 環境構築・設定
- style: スタイル変更
- test: テスト追加・修正
- docs: ドキュメント変更

## プッシュ規約

- main/master への直接 commit/push は禁止
- 作業は必ず feature ブランチで行う
- push 前に必ず確認を求める
- PR 経由でのみ main にマージする

## Issue管理

- 作業前: feature/xxx ブランチを develop から切る
- 作業後: develop へ PR → マージ

## 重要ドキュメント（docs/に格納）

- docs/requirements.md: 要件定義書 v1.2
- docs/technical-design.md: 技術設計書 v1.1
- docs/mockup/: UIモックアップ（index.html / styles.css / app.js）

## ディレクトリ構成の方針

技術設計書 §2 を参照。lib/music/ に Tonal.js ラッパーを集約し、
コンポーネントから直接 import しない。
