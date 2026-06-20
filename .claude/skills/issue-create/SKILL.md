---
name: issue-create
description: guitar-practice-appリポジトリにGitHub Issueを作成するスキル。「Issueを立てて」「○○をIssueにして」「新しいIssueを作成して」と言われたときに使用する。docsの要件定義・技術設計を参照して内容を整理し、既存Issueと統一感のあるフォーマットで作成する。
---

# guitar-practice-app Issue作成スキル

既存のIssueと統一感のある形式で、GitHub Issueを作成するスキル。

---

## 事前確認

Issue作成前に以下を確認して内容を整理する。

```bash
# 既存Issueの一覧を確認（重複・依存関係チェック）
gh issue list --repo bebe-dax/guitar-practice-app --state all

# 関連するdocsを確認
# docs/requirements.md  — 機能要件・非機能要件
# docs/technical-design.md — ディレクトリ構成・実装仕様
```

---

## Issueテンプレート

既存Issue（#1〜#12）のフォーマットに統一する。

```
<1行の概要説明文。「〜を実装する」「〜を対応する」で終わる>

## 作業内容
- [ ] <具体的な作業1>
- [ ] <具体的な作業2>
- [ ] <具体的な作業3>

## 完了条件
- [ ] <検証可能な完了条件1>
- [ ] <検証可能な完了条件2>
```

**任意セクション（必要な場合のみ追加）**

```
**参照**: `<関連ファイルパス>`
**注意**: <実装上の注意点>
```

### フォーマットのルール

- 概要説明文は**1文**で、Issueタイトルの補足になるように書く
- 作業内容は**チェックボックス形式**、完了したものをチェックしていく
- 完了条件は**検証可能**な形で書く（「〜できる」「〜が通る」など）
- コード・ファイルパスはバッククォートで囲む
- 箇条書きの入れ子は1段階まで

---

## ラベル・マイルストーン

### ラベル

| ラベル  | 用途                              |
| ------- | --------------------------------- |
| `setup` | 環境構築・設定・インフラ          |
| `logic` | 音楽理論ロジック（UIなし）        |
| `ui`    | コンポーネント・画面実装          |
| `core`  | フェーズの中核機能（`ui` と併用） |
| `fix`   | バグ修正                          |
| `docs`  | ドキュメント更新                  |

複数ラベルはカンマ区切りで指定する（例: `ui,core`）。

### マイルストーン

現在のマイルストーンを確認してから割り当てる。

```bash
gh api "repos/bebe-dax/guitar-practice-app/milestones" \
  | python3 -c "import sys,json; [print(f\"#{m['number']} {m['title']}\") for m in json.load(sys.stdin)]"
```

新しいフェーズのIssueでマイルストーンが存在しない場合は先に作成する。

```bash
gh api --method POST "repos/bebe-dax/guitar-practice-app/milestones" \
  -f title="<マイルストーン名>" \
  -f description="<説明>"
```

---

## Issue作成コマンド

```bash
gh issue create \
  --repo bebe-dax/guitar-practice-app \
  --title "<タイトル>" \
  --label "<ラベル>" \
  --milestone "<マイルストーンタイトル>" \
  --body "<本文>"
```

---

## Issue作成フロー

### 1. 内容を整理してユーザーに確認する

作成前に以下をユーザーへ提示して確認を取る。

```
タイトル  : <Issueタイトル>
ラベル    : <ラベル>
マイルストーン: <マイルストーン>
---
<本文プレビュー>
```

### 2. 確認が取れたら作成する

```bash
gh issue create \
  --repo bebe-dax/guitar-practice-app \
  --title "..." \
  --label "..." \
  --milestone "..." \
  --body "..."
```

### 3. 作成後にURLを表示する

```bash
# 作成したIssueのURLが出力されるので確認する
# 例: https://github.com/bebe-dax/guitar-practice-app/issues/13
```

---

## タイトルの命名規則

既存Issueのタイトルパターンに合わせる。

| パターン       | 例                               |
| -------------- | -------------------------------- |
| `<対象>の実装` | 指板コンポーネントの実装         |
| `<対象>の作成` | ドメイン型定義の作成             |
| `<対象>の設定` | デザイントークンとフォントの設定 |
| `<対象>の対応` | レスポンシブ対応                 |
| `<対象>の修正` | スケール計算のバグ修正           |
| `<対象>の追加` | Dorianスケールの追加             |
