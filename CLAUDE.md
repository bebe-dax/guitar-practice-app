# guitar-practice-app

ギター練習支援アプリ — キー・スケール・コードを指板で確認できるWebアプリ

## 技術スタック

- モノレポ構成: `frontend/`（Web フロント）+ `backend/`（Java API、Phase 2+）
- フロント: Next.js 16 (App Router) / TypeScript / Tailwind CSS v4
- Tonal.js（音楽理論ライブラリ）
  - 今後自作の音楽理論ライブラリを作成する想定のため、Tonal.jsは分断しやすい形式で使用
  - スケール/コード等の即時・オフライン処理はフロント（Tonal.js）に残す方針
- SVGカスタム指板描画
- バックエンド（Phase 2+）: Java 21 / Spring Boot / PostgreSQL
  - 用途は永続化・認証（JWT / httpOnly Cookie）。詳細は docs/backend-mvp-spec.md

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

- docs/requirements.md: 要件定義書 v1.3
- docs/technical-design.md: 技術設計書 v1.2
- docs/backend-mvp-spec.md: バックエンド API 機能仕様書（MVP: 認証 + コード進行永続化）
- docs/Mockup/: UIモックアップ（index.html / styles.css / app.js）

## ディレクトリ構成の方針

- モノレポ: フロントは `frontend/`、Java バックエンドは `backend/`、
  `docs/` と `CLAUDE.md` はルート据え置きで共有。
- フロントの詳細は技術設計書 §2 を参照（§2 のツリーは `frontend/` サブツリー）。
  `frontend/src/lib/music/` に Tonal.js ラッパーを集約し、コンポーネントから直接 import しない。
- バックエンドの構成・パッケージ方針は docs/backend-mvp-spec.md §2.1 を参照。
