# バックエンド API 機能仕様書（MVP）

**バージョン**: 0.2
**作成日**: 2026-08-10
**ステータス**: ドラフト
**スコープ**: 認証 + コード進行の永続化のみ

---

## 1. 目的とスコープ

Java（Spring Boot）による REST API を新設し、これまで localStorage に保存していた
コード進行を、ユーザーごとにサーバ DB へ永続化する。Java バックエンドのポートフォリオ
として、認証・DB・REST 設計の基礎を最小構成で示すことを目的とする。

### やること（IN）

- ユーザー登録・ログイン（メール + パスワード、JWT 認証）
- ログインユーザーに紐づくコード進行の CRUD（作成・一覧・取得・更新・削除）
- コード進行の DB 永続化

### やらないこと（OUT / 将来）

- コード進行の共有・公開ライブラリ
- 練習ログ、コード進行アナライザ等の追加機能
- OAuth（Google 等）、パスワードリセット、メール検証
- 音楽理論ロジックのサーバ移行（**Tonal.js はフロントに残す**）

> 指板描画・スケール表示など「即時・オフライン」な処理は現状どおりクライアント（Tonal.js）
> が担当し、API は「永続化」のみを担う。役割分担を明確に保つ。

---

## 2. 技術スタック

| 項目 | 採用 |
|---|---|
| 言語 | Java 21 |
| フレームワーク | Spring Boot 3.x |
| 主要スターター | Spring Web / Spring Security / Spring Data JPA / Validation |
| DB（本番・開発） | PostgreSQL（Docker Compose） |
| DB（テスト） | H2（インメモリ） |
| マイグレーション | Flyway |
| 認証 | JWT（jjwt） / パスワードは BCrypt ハッシュ |
| ビルド | Gradle |
| テスト | JUnit 5 / Spring Boot Test |
| API ドキュメント | springdoc-openapi（Swagger UI） |

### 2.1 リポジトリ構成

フロントとバックエンドを**同一リポジトリ内でディレクトリ分割**（モノレポ）する。

```
guitar-practice-app/
├── frontend/              # 既存 Next.js（現ルートの一式を移動）
│   ├── src/  package.json  next.config.ts  tsconfig.json ...
├── backend/               # 新規 Java API（Spring Boot / Gradle）
│   ├── src/main/java/com/guitarpractice/api/
│   ├── src/main/resources/   # application.yml / Flyway migration
│   ├── src/test/java/...
│   └── build.gradle.kts
├── docs/                  # 共有ドキュメント（据え置き）
├── docker-compose.yml     # PostgreSQL（開発用）
├── CLAUDE.md  README.md
```

- フロント移動: `git mv` で `src/ public/ package.json tsconfig.json next.config.ts`
  等を `frontend/` へ。`@/` エイリアスは `frontend/tsconfig.json` 基準のため内部 import は無変更。
- **Vercel の "Root Directory" を `frontend` に設定**（1 回のみ）。
- `docs/` と `CLAUDE.md` はルート据え置きで両者共有。
- Java パッケージ: `com.guitarpractice.api`。

---

## 3. データモデル

### 3.1 User

| フィールド | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| email | String | 一意・NOT NULL・メール形式 |
| passwordHash | String | NOT NULL（BCrypt） |
| createdAt | timestamptz | NOT NULL |

### 3.2 Progression

現行フロントの `Progression` 型（`src/types/progression.ts`）に `userId` を加えた形。

| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | UUID | PK | サーバ採番 |
| userId | UUID | FK → User.id・NOT NULL | 所有者 |
| title | String | NOT NULL・1〜100 文字 | |
| key | String | NOT NULL | 例: "C", "F#"（NotePC） |
| scale | String | NOT NULL | major / minor / major pentatonic / minor pentatonic / blues |
| chords | jsonb | NOT NULL | 文字列配列。例: `["Am7","Dm7","G7"]` |
| memo | String | 0〜500 文字 | |
| createdAt | timestamptz | NOT NULL | |
| updatedAt | timestamptz | NOT NULL | |

> `chords` は順序を持つ文字列リストのため PostgreSQL の `jsonb` 列で保持する
> （Hibernate `@JdbcTypeCode(SqlTypes.JSON)`）。中間テーブルは作らない。

---

## 4. API エンドポイント

ベースパス: `/api`
認証が必要なエンドポイントは `Authorization: Bearer <JWT>` を必須とする。

### 4.1 認証

#### POST /api/auth/register
新規登録。

- リクエスト: `{ "email": "a@example.com", "password": "********" }`
- 成功: `201 Created`
  - JWT を **httpOnly Cookie**（`Set-Cookie`）で発行。
  - body: `{ "id": "<uuid>", "email": "a@example.com" }`
- エラー: `409`（メール重複） / `400`（バリデーション違反）

#### POST /api/auth/login
ログイン。

- リクエスト: `{ "email": "...", "password": "..." }`
- 成功: `200 OK` — JWT を httpOnly Cookie で発行。body はユーザー情報（register と同じ）
- エラー: `401`（認証失敗）

#### POST /api/auth/logout
ログアウト（要認証）。

- 成功: `204 No Content` — 認証 Cookie を失効させる（`Max-Age=0`）

#### GET /api/auth/me
現在のユーザー情報（トークン検証用）。

- 成功: `200 OK` — `{ "id": "<uuid>", "email": "..." }`
- エラー: `401`

### 4.2 コード進行（全て要認証・自分のデータのみ操作可）

| メソッド | パス | 説明 | 成功 | フロント対応 |
|---|---|---|---|---|
| GET | /api/progressions | 自分の進行一覧（updatedAt 降順） | 200 | 初期ロード |
| POST | /api/progressions | 新規作成 | 201 | `save()` |
| GET | /api/progressions/{id} | 1 件取得 | 200 | 詳細ページ |
| PUT | /api/progressions/{id} | 更新 | 200 | `update()` |
| DELETE | /api/progressions/{id} | 削除 | 204 | `remove()` |

- **作成リクエスト body**: `{ title, key, scale, chords, memo }`（id/createdAt/updatedAt はサーバ採番）
- **レスポンス body**（単体）:
  ```json
  {
    "id": "<uuid>", "title": "王道進行", "key": "C", "scale": "major",
    "chords": ["Am7","Dm7","G7","Cmaj7"], "memo": "",
    "createdAt": "2026-08-10T...", "updatedAt": "2026-08-10T..."
  }
  ```
  `userId` はレスポンスに含めない（暗黙に本人）。
- **所有権**: 他人の進行への GET/PUT/DELETE は `404`（存在秘匿のため 403 でなく 404）。

---

## 5. 認証フロー / セキュリティ

- パスワードは **BCrypt** でハッシュ化して保存（平文保存しない）。
- ログイン成功で **JWT** を発行（有効期限例: 24h）。ペイロードに `sub=userId`。
- トークンは **httpOnly Cookie** に格納する（JS から読めず、XSS 経由の盗難を防ぐ）。
  - Cookie 属性: `HttpOnly` / `Secure`（本番） / `SameSite=Lax`（または Strict） / `Path=/`。
  - ブラウザが自動送信するため、フロントは `Authorization` ヘッダを手動付与しない。
- **CSRF 対策**（Cookie 認証のため必須・ポートフォリオの見せ場）:
  - Spring Security の CSRF 保護を有効化し、**Double Submit Cookie 方式**を採用。
  - サーバは CSRF トークンを（JS から読める）`XSRF-TOKEN` Cookie で配布
    （`CookieCsrfTokenRepository`）。
  - フロントは更新系（POST/PUT/DELETE）で同値を `X-XSRF-TOKEN` ヘッダに載せて送信。
  - GET 等の安全メソッドは検証対象外。トークン不一致は `403`。
- Spring Security のフィルタで JWT を検証し、未認証は `401`。
- **CORS**: フロント（Next.js）のオリジンのみ明示許可し、**資格情報付きを許可**
  （`allowCredentials=true`。ワイルドカード `*` は使用不可）。

---

## 6. エラーレスポンス形式

Spring の **ProblemDetail（RFC 7807）** を採用。

```json
{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "detail": "このメールアドレスは既に登録されています",
  "instance": "/api/auth/register"
}
```

| 状況 | ステータス |
|---|---|
| バリデーション違反 | 400 |
| 未認証 / トークン無効 | 401 |
| リソース未存在 / 他人所有 | 404 |
| メール重複 | 409 |
| サーバ内部エラー | 500 |

---

## 7. フロントエンド連携（影響範囲）

| 対象 | 変更内容 |
|---|---|
| `hooks/useProgressions.ts` | localStorage → API 呼び出しへ差し替え。CRUD が**非同期**になる（loading/error 状態を追加） |
| 認証 | `useAuth`（仮）を新設。トークンは Cookie 保持のためフロントで保存しない。ログイン状態は `GET /auth/me` で判定 |
| ページ | `/login` `/register`（新規）。未ログイン時はログイン画面へ誘導 |
| API クライアント | 全リクエストに `credentials: 'include'` を付与。更新系は `XSRF-TOKEN` Cookie を読み `X-XSRF-TOKEN` ヘッダに載せる fetch ラッパーを追加 |

- `save/remove/update` のシグネチャは可能な限り維持し、中身を `fetch` 化する。
- 既存 localStorage データの扱い（MVP は任意）: 初回ログイン時に「ローカルの進行を
  インポート」する導線を将来検討。MVP コアには含めない。

---

## 8. 実装ステップ（推奨順）

1. プロジェクト雛形（Spring Boot / Gradle / Docker Compose で PostgreSQL）
2. Flyway で `users` / `progressions` テーブル作成
3. User 登録・ログイン・JWT 発行（Spring Security 設定）
4. Progression CRUD（所有権チェック込み）
5. CORS（資格情報付き）・CSRF（Cookie 認証）・ProblemDetail・Bean Validation の整備
6. JUnit（認証・CRUD・所有権の統合テスト）
7. springdoc-openapi で Swagger UI 公開
8. フロント `useProgressions` を API 化＋ログイン画面

---

## 9. 受け入れ基準（MVP 完了条件）

- [ ] メール + パスワードで登録・ログインでき、JWT が発行される
- [ ] ログインユーザーがコード進行を作成・一覧・取得・更新・削除できる
- [ ] 他ユーザーの進行は操作できない（404）
- [ ] 未認証リクエストは 401 で拒否される
- [ ] CSRF トークンが無い / 不正な更新系リクエストは 403 で拒否される
- [ ] ログアウトで認証 Cookie が失効し、以降は 401 になる
- [ ] データがサーバ再起動後も永続化されている
- [ ] 主要フローの JUnit テストが通る
