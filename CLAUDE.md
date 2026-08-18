# guitar-practice-app

ギター練習支援アプリ — キー・スケール・コードを指板で確認できるWebアプリ

## 技術スタック

- フロント: Next.js 16 (App Router) / TypeScript / Tailwind CSS v4
- Tonal.js（音楽理論ライブラリ）
  - 今後自作の音楽理論ライブラリを作成する想定のため、Tonal.jsは分断しやすい形式で使用
  - スケール/コード等の即時・オフライン処理はフロント（Tonal.js）に残す方針
- SVGカスタム指板描画
- Firebase: 永続化（Firestore）・認証（Firebase Authentication、メール/パスワード）
  - `src/lib/firebase/` に初期化設定を集約
  - Firestore Security Rules（リポジトリルート `firestore.rules`）でユーザーごとのデータ分離を担保

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

- docs/requirements.md: 要件定義書
- docs/technical-design.md: 技術設計書
- docs/Mockup/: UIモックアップ（index.html / styles.css / app.js）

## ディレクトリ構成の方針

- 単一プロジェクト構成（`src/` がアプリ本体）。`docs/`・Firebase設定ファイル
  （`firebase.json` / `firestore.rules` / `firestore.indexes.json` / `.firebaserc`）はルート据え置き。
- 詳細は技術設計書 §2 を参照。
  `src/lib/music/` に Tonal.js ラッパーを集約し、コンポーネントから直接 import しない。
