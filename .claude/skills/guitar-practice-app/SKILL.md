---
name: guitar-practice-app
description: guitar-practice-appリポジトリのIssue対応・開発作業を行うスキル。「Issue #Nを対応して」「次のIssueを進めて」「feature/xxxを実装して」「PRを作成して」などと言われたときに必ず使用する。Issue番号が指定されない場合は未対応Issue一覧を取得して選択を促す。Next.js/TypeScript/Tonal.jsの実装、ブランチ操作、PR作成、Issueクローズまで一連の開発フローを担う。
---

# guitar-practice-app 開発スキル

ギター練習支援アプリ（Next.js 15 + TypeScript + Tailwind CSS v4 + Tonal.js）の開発を支援するスキル。
要件定義・技術設計・UIモックアップが完成した状態から実装フェーズを進める。

---

## プロジェクト概要

| 項目           | 内容                           |
| -------------- | ------------------------------ |
| アプリ名       | ギター練習支援アプリ           |
| リポジトリ     | `bebe-dax/guitar-practice-app` |
| フレームワーク | Next.js 15 (App Router)        |
| 言語           | TypeScript                     |
| スタイリング   | Tailwind CSS v4                |
| 音楽理論       | Tonal.js                       |
| 指板描画       | SVG（カスタム実装）            |
| データ永続化   | localStorage（Phase 1）        |
| ホスティング   | Vercel                         |

---

## ドキュメント参照先

実装前に必ず以下を確認する。

| ドキュメント    | 場所                       | 内容                                         |
| --------------- | -------------------------- | -------------------------------------------- |
| 要件定義書 v1.2 | `docs/requirements.md`     | 機能要件 F-01〜F-18、非機能要件              |
| 技術設計書 v1.1 | `docs/technical-design.md` | ディレクトリ構成、型定義、コンポーネント仕様 |
| UIモックアップ  | `docs/mockup/index.html`   | ブラウザで開いて視覚的に確認する             |

---

## ブランチ・コミット規約

```
main          本番（Vercelデプロイ対象）
develop       開発ベース（各featureのマージ先）
feature/xxx   各Issue対応ブランチ
```

**Conventional Commits（日本語コミットメッセージ）**

| プレフィックス | 用途                         |
| -------------- | ---------------------------- |
| `feat:`        | 新機能                       |
| `fix:`         | バグ修正                     |
| `chore:`       | 環境構築・設定変更           |
| `style:`       | スタイル変更（ロジックなし） |
| `test:`        | テスト追加・修正             |
| `docs:`        | ドキュメント変更             |
| `refactor:`    | リファクタリング             |

---

## Issue対応フロー

Issue対応を依頼されたら、以下の手順を必ず守る。
**Issue番号が指定されなかった場合は、未対応Issue一覧を取得してユーザーに選択を促す。**

### 1. Issueの内容を確認する

```bash
# Issue番号未指定の場合: 未対応一覧を表示して選択を促す
gh issue list --repo bebe-dax/guitar-practice-app --state open

# Issue番号が指定された場合: 詳細を確認する
gh issue view <Issue番号> --repo bebe-dax/guitar-practice-app
```

### 2. ブランチ名を決めてブランチを切る

Issueのタイトル・ラベルからブランチ名を導出し、**作業前にユーザーへ提示して確認を取る**。

**ブランチ名フォーマット**: `feature/<prefix>-<topic>`

**prefix の決め方（Issueのラベルから）**

| ラベル                | prefix                         |
| --------------------- | ------------------------------ |
| `setup`               | `setup`                        |
| `logic`               | `logic`                        |
| `ui` または `ui,core` | `ui`                           |
| `fix`                 | `fix`                          |
| ラベルなし            | 実装内容から最も近いものを選ぶ |

**topic の決め方（Issueタイトルから）**

- タイトルの核心を表す**英単語1〜2語**を抽出する（kebab-case）
- 実装対象のモジュール名・機能名を優先する
- 日本語・助詞・記号・略語は使わない
- **3語以上にしない**（長くなるなら短い方を選ぶ）

**命名例**

| Issueタイトル例                  | ブランチ名                |
| -------------------------------- | ------------------------- |
| プロジェクト初期セットアップ     | `feature/setup-nextjs`    |
| デザイントークンとフォントの設定 | `feature/setup-tokens`    |
| ドメイン型定義の作成             | `feature/logic-types`     |
| 音楽理論定数の定義               | `feature/logic-constants` |
| スケール計算の実装               | `feature/logic-scale`     |
| 指板座標計算ロジックの実装       | `feature/logic-fretboard` |
| サイドバーレイアウトの実装       | `feature/ui-sidebar`      |
| 指板コンポーネントの実装         | `feature/ui-fretboard`    |
| キー・スケール選択UIの実装       | `feature/ui-key-scale`    |
| ○○一覧画面の追加                 | `feature/ui-list`         |
| ○○バグ修正                       | `feature/fix-○○`          |

ブランチ名を提示してユーザーが確認したら切る。

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<prefix>-<topic>
```

### 3. 実装する

技術設計書を参照して実装する。
**Tonal.jsは `lib/music/` のラッパー経由でのみ使用し、コンポーネントから直接importしない。**

### 4. コミットする

```bash
git add .
git commit -m "<prefix>: <日本語で変更内容を記述>"
```

### 5. プッシュしてPRを作成する

```bash
git push -u origin feature/<prefix>-<topic>

gh pr create \
  --repo bebe-dax/guitar-practice-app \
  --base develop \
  --title "<コミットメッセージと同じ>" \
  --body "Closes #<Issue番号>"
```

### 6. PRをマージしてIssueをクローズする

```bash
gh pr merge --squash --delete-branch
gh issue close <Issue番号> --repo bebe-dax/guitar-practice-app
```

---

## ディレクトリ構成

技術設計書 §2 より。実装時の配置先として参照する。

```
src/
├── app/
│   ├── layout.tsx          # サイドバー込みの共通レイアウト
│   ├── page.tsx            # ホーム画面
│   └── globals.css         # デザイントークン @theme
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx           # 開閉式サイドバー
│   ├── fretboard/
│   │   ├── Fretboard.tsx         # 指板SVG本体
│   │   ├── FretboardNote.tsx     # 音符ドット
│   │   ├── FretboardLegend.tsx   # 凡例
│   │   └── FretRangeSlider.tsx   # フレット範囲スライダー
│   └── scale/
│       ├── KeySelector.tsx       # キー選択ピル
│       ├── ScaleSelector.tsx     # スケール選択セレクト
│       ├── ScaleNoteList.tsx     # 構成音バッジ
│       └── DiatonicChordList.tsx # ダイアトニックコード
├── hooks/
│   └── useScale.ts         # キー・スケール・フレット状態管理
├── lib/
│   └── music/
│       ├── constants.ts    # 定数
│       ├── scale.ts        # スケール計算 Tonal.jsラッパー
│       ├── chord.ts        # コード計算 Tonal.jsラッパー
│       └── fretboard.ts    # 指板座標計算
└── types/
    ├── music.ts            # 音楽理論ドメイン型
    └── progression.ts      # コード進行型
```

---

## 重要な実装ルール

### 指板コンポーネントの仕様

- viewBox: `1280 × 320`
- 表示フレット数: `DEFAULT_FRET_WIDTH = 12`
- 弦: 6本、1弦（上）→ 6弦（下）の順、太さを段階的に変える
- ルート音: オレンジ系（`--color-root` / `--color-root-bg`）
- 構成音: グリーン系（`--color-note` / `--color-note-bg`）
- ポジションマーク: `SINGLE_INLAYS = [3,5,7,9,15,17,19,21]` / `DOUBLE_INLAYS = [12,24]`
- 開放弦インジケーター: `fretStart === 0` のとき、ナット左側に輪で表示

視覚的な仕様は `docs/mockup/index.html` をブラウザで開いて確認する。

### デザイントークン

```css
/* globals.css の @theme に定義する */
--color-bg: #131316;
--color-surface: #1c1c21;
--color-surface2: #26262d;
--color-surface3: #30303a;
--color-border: #3a3a45;
--color-accent: #5e9bff;
--color-accent-bg: #1c2c4a;
--color-root: #ff8c33;
--color-root-bg: #3d2410;
--color-note: #5fc78c;
--color-note-bg: #143524;
--color-amber: #ffc640;
--color-purple: #a583ff;
--color-text-pri: #f2f2f5;
--color-text-sec: #8d8d99;
--color-text-mut: #5c5c68;
```

フォント: Space Grotesk（UI）/ JetBrains Mono（音名・コード名）/ Zen Kaku Gothic New（日本語）

### Tonal.jsラッパーの使い方

```typescript
// ✅ 正しい: lib/music/ 経由で使う
import { getScaleNotes } from "@/lib/music/scale";

// ❌ 禁止: コンポーネントから直接importしない
import { Scale } from "tonal";
```
