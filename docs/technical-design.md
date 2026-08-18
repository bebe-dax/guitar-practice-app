# ギター練習支援アプリ 技術設計書

**バージョン**: 1.3  
**作成日**: 2026-05-31  
**更新日**: 2026-08-18  
**ステータス**: ドラフト

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0 | 2026-05-31 | 初版作成 |
| 1.1 | 2026-06-12 | 要件定義書v1.2との同期: 指板12フレット表示 / サイドバーレイアウト / デザイントークン追加 / UIモック準拠のコンポーネント構成に更新 |
| 1.2 | 2026-08-10 | クラウド永続化・認証の方針を Firebase から自作 Java API (Spring Boot + PostgreSQL) へ変更 / モノレポ構成（frontend・backend）に更新。詳細は backend-mvp-spec.md |
| 1.3 | 2026-08-18 | クラウド永続化・認証の方針を自作 Java API から Firebase（Firestore / Firebase Authentication）へ再度変更。自作バックエンド（backend/）は削除し、モノレポ構成を廃止 |

---

## 1. 技術スタック（確定版）

| レイヤー | 採用技術 | バージョン |
|--------|---------|----------|
| ランタイム | Node.js | v24.11.1 |
| フレームワーク | Next.js (App Router) | 15.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 4.x |
| 音楽理論 | Tonal.js | 6.x |
| 指板描画 | SVG（カスタム実装） | — |
| データ永続化（Phase 1） | localStorage | — |
| データ永続化（Phase 2+） | Firebase Firestore | — |
| 認証（Phase 2+） | Firebase Authentication（メール/パスワード） | — |
| ホスティング | Vercel | — |
| リポジトリ | GitHub（新規） | — |
| パッケージマネージャー | npm | — |

---

## 2. ディレクトリ構成

> 単一プロジェクト構成。Firebase設定ファイル
> （`firebase.json` / `firestore.rules` / `firestore.indexes.json`）はリポジトリルートに置く。

```
guitar-practice-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # ルートレイアウト
│   │   ├── page.tsx                  # / ホーム（スケール + 指板）
│   │   ├── progressions/
│   │   │   ├── page.tsx              # /progressions 一覧
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # /progressions/new 作成
│   │   │   └── [id]/
│   │   │       └── page.tsx          # /progressions/:id 詳細
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx           # 開閉式サイドバーナビゲーション
│   │   ├── fretboard/
│   │   │   ├── Fretboard.tsx         # 指板本体（SVG、12フレット幅）
│   │   │   ├── FretboardNote.tsx     # 各フレットの音符ドット
│   │   │   ├── FretboardLegend.tsx   # ルート音/構成音の凡例
│   │   │   └── FretRangeSlider.tsx   # 開始フレット変更スライダー
│   │   ├── scale/
│   │   │   ├── KeySelector.tsx       # キー選択UI
│   │   │   ├── ScaleSelector.tsx     # スケール選択UI
│   │   │   ├── ScaleNoteList.tsx     # 構成音一覧表示
│   │   │   └── DiatonicChordList.tsx # ダイアトニックコード一覧
│   │   ├── progression/
│   │   │   ├── ProgressionCard.tsx   # コード進行カード（一覧用）
│   │   │   ├── ProgressionEditor.tsx # コード進行作成・編集フォーム
│   │   │   └── ProgressionPlayer.tsx # ステップ確認プレビュー
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Select.tsx
│   │       └── Modal.tsx
│   │
│   ├── hooks/
│   │   ├── useScale.ts               # キー・スケール状態管理
│   │   ├── useFretboard.ts           # 指板表示ロジック
│   │   └── useProgressions.ts        # コード進行 CRUD（localStorage）
│   │
│   ├── lib/
│   │   ├── music/
│   │   │   ├── scale.ts              # Tonal.js ラッパー（スケール）
│   │   │   ├── chord.ts              # Tonal.js ラッパー（コード）
│   │   │   ├── fretboard.ts          # 指板座標計算ロジック
│   │   │   └── constants.ts          # 弦・フレット定数
│   │   └── storage/
│   │       ├── localStorage.ts       # localStorage 読み書きユーティリティ
│   │       └── types.ts              # ストレージ型定義
│   │
│   └── types/
│       ├── music.ts                  # 音楽理論ドメイン型
│       └── progression.ts            # コード進行・フレーズ型
│
├── .env.local                        # 環境変数（API接続情報等、git管理外）
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. 主要モジュール設計

### 3.1 音楽理論ロジック（`src/lib/music/`）

Tonal.js を直接コンポーネントで使わず、ラッパー関数を経由する。仕様変更時の影響範囲を `lib/music/` に限定するため。

#### `constants.ts`

```ts
// 標準チューニング（6弦 → 1弦）
export const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const

export const FRET_COUNT = 24
export const DEFAULT_FRET_START = 0
export const DEFAULT_FRET_WIDTH = 12  // UIモック検証により5→12に変更（要件v1.2）
export const MAX_FRET_START = 12      // スライダー上限（12 + 12 = 24フレットまで表示）

// ポジションマーク（インレイ）の位置 — F-17
export const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21]
export const DOUBLE_INLAYS = [12, 24]

export const SCALE_OPTIONS = [
  { label: 'Major',            value: 'major' },
  { label: 'Natural Minor',    value: 'minor' },
  { label: 'Major Pentatonic', value: 'major pentatonic' },
  { label: 'Minor Pentatonic', value: 'minor pentatonic' },
  { label: 'Blues',            value: 'blues' },
] as const
```

#### `scale.ts`

```ts
import { Scale, Key } from 'tonal'

// スケールの構成音を返す（例: getScaleNotes("C", "major") → ["C","D","E","F","G","A","B"]）
export function getScaleNotes(key: string, scaleName: string): string[] {
  return Scale.get(`${key} ${scaleName}`).notes
}

// ダイアトニックコードを返す（例: getDiatonicChords("C") → ["Cmaj7","Dm7",...]）
export function getDiatonicChords(key: string): string[] {
  return Key.majorKey(key).chords
}
```

#### `fretboard.ts`

```ts
import { Note } from 'tonal'
import { STANDARD_TUNING } from './constants'

export type FretboardNote = {
  string: number   // 0=6弦, 5=1弦
  fret: number
  note: string     // e.g. "C4"
  isRoot: boolean
}

// 指定スケール構成音を指板座標に変換
export function getNotesOnFretboard(
  scaleNotes: string[],   // ["C","E","G"] など（オクターブなし）
  rootNote: string,       // e.g. "C"
  fretStart: number,
  fretEnd: number,
): FretboardNote[] {
  const result: FretboardNote[] = []
  STANDARD_TUNING.forEach((openNote, stringIndex) => {
    for (let fret = fretStart; fret <= fretEnd; fret++) {
      const midiOpen = Note.midi(openNote) ?? 0
      const midi = midiOpen + fret
      const noteName = Note.pitchClass(Note.fromMidi(midi)) // オクターブなし音名
      if (scaleNotes.includes(noteName)) {
        result.push({
          string: stringIndex,
          fret,
          note: Note.fromMidi(midi),
          isRoot: noteName === rootNote,
        })
      }
    }
  })
  return result
}
```

---

### 3.2 指板コンポーネント（`Fretboard.tsx`）

SVG でカスタム描画。外部ライブラリは使わず、`fretboard.ts` の座標計算結果をそのまま `<circle>` に展開する。

```
表示仕様（UIモック準拠 / 要件v1.2 F-05, F-09, F-16〜F-18）:
- 画面上段にフル幅で配置。viewBox 1280x320 の SVG を width:100% で表示
- 弦: 6本（横線）。1弦→6弦の順に太く描画し、左端に弦名ラベル（e B G D A E）
- フレット: fretStart+1 〜 fretStart+12 の12フレット幅（縦線）+ 下部にフレット番号
- ナット: fretStart === 0 のとき左端を太線で表示
- ポジションマーク: SINGLE_INLAYS はシングル、DOUBLE_INLAYS は上下2点で描画
- ドット: スケール構成音の位置に circle（半径17）
  - ルート音: オレンジ系（--root / --root-bg）
  - その他: グリーン系（--note / --note-bg）
  - ドット内に音名ラベルを表示（F-18、アクセシビリティ対応）
- 開放弦インジケーター: fretStart === 0 のとき、構成音に該当する
  開放弦をナット左側に輪（塗りなし circle）で表示（F-16）
- 凡例: 指板下部に FretboardLegend を配置（F-09）
```

**Props 設計:**

```ts
type FretboardProps = {
  notes: FretboardNote[]
  fretStart: number
  fretWidth?: number        // デフォルト 12（DEFAULT_FRET_WIDTH）
}
```

---

### 3.3 状態管理（hooks）

Context や Redux は使わず、**各ページで `useState` + カスタムフック** で完結させる。Phase 1 のスコープでは過剰な状態管理は不要。

#### `useScale.ts`

```ts
// 管理する状態
const [key, setKey] = useState('C')
const [scaleName, setScaleName] = useState('major')
const [fretStart, setFretStart] = useState(0)

// 派生値（useMemo で計算）
const scaleNotes = useMemo(() => getScaleNotes(key, scaleName), [key, scaleName])
const fretboardNotes = useMemo(() => getNotesOnFretboard(...), [scaleNotes, fretStart])
const diatonicChords = useMemo(() => getDiatonicChords(key), [key])
```

#### `useProgressions.ts`

```ts
// localStorage の CRUD を抽象化
function useProgressions() {
  const [progressions, setProgressions] = useState<Progression[]>([])

  useEffect(() => {
    // マウント時に localStorage から読み込み
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setProgressions(JSON.parse(stored))
  }, [])

  function save(progression: Progression) { ... }
  function remove(id: string) { ... }
  function update(id: string, patch: Partial<Progression>) { ... }

  return { progressions, save, remove, update }
}
```

---

### 3.4 localStorage スキーマ

```ts
// キー名
const STORAGE_KEY = 'guitar-app:progressions'

// 保存形式（JSON.stringify して保存）
type StorageSchema = {
  version: 1
  progressions: Progression[]
}
```

バージョンフィールドを持たせておくことで、Phase 2+ での Firestore 移行時にスキーマ変換が容易になる。

---

## 4. 型定義（`src/types/`）

### `music.ts`

```ts
export type NotePC = string    // ピッチクラス（オクターブなし）例: "C", "F#"
export type NoteWithOct = string  // オクターブあり 例: "C4", "A3"
export type ScaleName = 'major' | 'minor' | 'major pentatonic' | 'minor pentatonic' | 'blues'
export type ChordName = string  // 例: "Am7", "Cmaj7"
```

### `progression.ts`

```ts
export type Progression = {
  id: string
  title: string
  key: NotePC
  scale: ScaleName
  chords: ChordName[]
  memo: string
  createdAt: string   // ISO 8601（localStorage では Date を文字列で保存）
  updatedAt: string
}
```

---

## 5. ページ別責務

### 共通レイアウト（`app/layout.tsx`）

- 左固定の開閉式 `Sidebar` + メインエリアの2カラム構成
- サイドバー開閉状態はレイアウトローカルの `useState` で管理（永続化はPhase 2で検討）
- メインエリアは1画面に収まることを基本とする（縦スクロール最小化）

### `/`（ホーム）

- `useScale` フックで状態を一元管理
- **上段**: `Fretboard`（フル幅）+ `FretRangeSlider` + `FretboardLegend`
- **下段左**: 選択エリア — `KeySelector`（ピル型）+ `ScaleSelector`
- **下段右**: 理論情報エリア — `ScaleNoteList`（構成音バッジ）と `DiatonicChordList` を区切り線で上下に配置
- 下段の左右カードは同じ高さに揃える（CSS Grid `align-items: stretch`）

### `/progressions`

- `useProgressions` で Firestore から一覧取得（ログインユーザーのデータのみ）
- `ProgressionCard` を並べて表示
- 各カードから詳細・削除が可能

### `/progressions/new`

- `ProgressionEditor` でコード名を入力・追加・並び替え
- 保存時に `useProgressions.save()` を呼び出して Firestore へ書き込み

### `/progressions/[id]`

- 詳細表示 + 指板プレビュー（`ProgressionPlayer`）
- `ProgressionPlayer` はコードをステップ順に切り替え、指板に構成音を表示
- 編集・削除・（Phase 3）共有 URL 発行

---

## 6. 環境変数

```bash
# .env.local（Phase 2+ から使用、Phase 1 では不要）
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Phase 1 では `.env.local` 自体不要。Phase 2+ のFirebase連携時に追加する（値は `.env.example` 参照）。
Firestore Security Rules・複合インデックスはリポジトリルートの `firestore.rules` / `firestore.indexes.json` で管理する。

---

## 6.5 デザイントークン（UIモック確定版）

UIモックの CSS変数をそのまま Tailwind CSS v4 の `@theme` に移植する。

```css
/* globals.css */
@theme {
  --color-bg: #131316;
  --color-surface: #1c1c21;
  --color-surface2: #26262d;
  --color-surface3: #30303a;
  --color-border: #3a3a45;
  --color-accent: #5e9bff;      /* 選択状態・リンク */
  --color-accent-bg: #1c2c4a;
  --color-root: #ff8c33;        /* ルート音 */
  --color-root-bg: #3d2410;
  --color-note: #5fc78c;        /* 構成音 */
  --color-note-bg: #143524;
  --color-amber: #ffc640;       /* フレーズ系アクセント */
  --color-purple: #a583ff;      /* マイナー系アクセント */
  --color-text-pri: #f2f2f5;
  --color-text-sec: #8d8d99;
  --color-text-mut: #5c5c68;
}
```

フォント: UI = Space Grotesk + Zen Kaku Gothic New / 音名・コード名 = JetBrains Mono（`next/font` で読み込み）。

> **参照**: 詳細なスタイリングは UIモックアップ `guitar-app-mockup/styles.css` を正とする。

---

## 7. セットアップ手順

```bash
# リポジトリ作成後
npx create-next-app@latest guitar-practice-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd guitar-practice-app

# 音楽理論ライブラリ追加
npm install tonal

# 開発サーバー起動
npm run dev
```

---

## 8. 今後の拡張ポイント（Phase 2+）

| フェーズ | 追加内容 | 影響範囲 |
|--------|---------|---------|
| Phase 2 | スケール種類追加（Dorian 等） | `constants.ts` に追記のみ |
| Phase 2 | モバイル・タブレット対応 | レイアウトのレスポンシブ化（指板の縦表示 or 横スクロール検討） |
| Phase 2+ | クラウド保存 | Firestore SDKで永続化、`lib/api/progressions.ts` を直接アクセス化 |
| Phase 2+ | ログイン | Firebase Authenticationのメール/パスワード認証、`app/layout.tsx` に AuthProvider 追加 |
| Phase 3 | 共有 URL | Next.js の Dynamic Routes + サーバ側 ID をそのまま URL に使用 |
| Phase 3 | 音声再生 | `lib/audio/` を新規追加、Web Audio API で実装 |
