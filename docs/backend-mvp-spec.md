# バックエンド API 機能仕様書（MVP）

**バージョン**: 0.2
**作成日**: 2026-08-10
**ステータス**: ドラフト
**スコープ**: 認証 + コード進行の永続化のみ

---

## 1. 目的とスコープ

Java（Spring Boot）による REST API を新設し、これまで localStorage に保存していた
コード進行を、ユーザーごとにサーバ DB へ永続化する。認証・DB・REST 設計の基礎を最小構成で示すことを目的とする。

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

| 項目             | 採用                                                        |
| ---------------- | ----------------------------------------------------------- |
| 言語             | Java 21（Amazon Corretto）                                  |
| フレームワーク   | Spring Boot 4.1.x（Spring Framework 7系）                   |
| 主要スターター   | Spring Web / Spring Security / Spring Data JPA / Validation |
| DB（本番・開発） | PostgreSQL（Docker Compose）                                |
| DB（テスト）     | H2（インメモリ）                                            |
| マイグレーション | Flyway                                                      |
| 認証             | JWT（jjwt） / パスワードは BCrypt ハッシュ                  |
| ビルド           | Gradle                                                      |
| テスト           | JUnit 6 / Spring Boot Test                                  |
| API ドキュメント | springdoc-openapi（Swagger UI）                             |

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

| フィールド   | 型          | 制約                       |
| ------------ | ----------- | -------------------------- |
| id           | UUID        | PK                         |
| email        | String      | 一意・NOT NULL・メール形式 |
| passwordHash | String      | NOT NULL（BCrypt）         |
| createdAt    | timestamptz | NOT NULL                   |
| updatedAt    | timestamptz | NOT NULL                   |

### 3.2 Progression

現行フロントの `Progression` 型（`src/types/progression.ts`）に `userId` を加えた形。

| フィールド | 型          | 制約                   | 備考                                                        |
| ---------- | ----------- | ---------------------- | ----------------------------------------------------------- |
| id         | UUID        | PK                     | サーバ採番                                                  |
| userId     | UUID        | FK → User.id・NOT NULL | 所有者                                                      |
| title      | String      | NOT NULL・1〜100 文字  |                                                             |
| key        | String      | NOT NULL               | 例: "C", "F#"（NotePC）                                     |
| scale      | String      | NOT NULL               | major / minor / major pentatonic / minor pentatonic / blues |
| chords     | jsonb       | NOT NULL               | 文字列配列。例: `["Am7","Dm7","G7"]`                        |
| memo       | String      | 0〜500 文字            |                                                             |
| createdAt  | timestamptz | NOT NULL               |                                                             |
| updatedAt  | timestamptz | NOT NULL               |                                                             |

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

| メソッド | パス                   | 説明                             | 成功 | フロント対応 |
| -------- | ---------------------- | -------------------------------- | ---- | ------------ |
| GET      | /api/progressions      | 自分の進行一覧（updatedAt 降順） | 200  | 初期ロード   |
| POST     | /api/progressions      | 新規作成                         | 201  | `save()`     |
| GET      | /api/progressions/{id} | 1 件取得                         | 200  | 詳細ページ   |
| PUT      | /api/progressions/{id} | 更新                             | 200  | `update()`   |
| DELETE   | /api/progressions/{id} | 削除                             | 204  | `remove()`   |

- **作成リクエスト body**: `{ title, key, scale, chords, memo }`（id/createdAt/updatedAt はサーバ採番）
- **レスポンス body**（単体）:
  ```json
  {
    "id": "<uuid>",
    "title": "王道進行",
    "key": "C",
    "scale": "major",
    "chords": ["Am7", "Dm7", "G7", "Cmaj7"],
    "memo": "",
    "createdAt": "2026-08-10T...",
    "updatedAt": "2026-08-10T..."
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
- **CSRF 対策**
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

| 状況                      | ステータス |
| ------------------------- | ---------- |
| バリデーション違反        | 400        |
| 未認証 / トークン無効     | 401        |
| リソース未存在 / 他人所有 | 404        |
| メール重複                | 409        |
| サーバ内部エラー          | 500        |

---

## 7. フロントエンド連携（影響範囲）

| 対象                       | 変更内容                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/useProgressions.ts` | localStorage → API 呼び出しへ差し替え。CRUD が**非同期**になる（loading/error 状態を追加）                                             |
| 認証                       | `useAuth`（仮）を新設。トークンは Cookie 保持のためフロントで保存しない。ログイン状態は `GET /auth/me` で判定                          |
| ページ                     | `/login` `/register`（新規）。未ログイン時はログイン画面へ誘導                                                                         |
| API クライアント           | 全リクエストに `credentials: 'include'` を付与。更新系は `XSRF-TOKEN` Cookie を読み `X-XSRF-TOKEN` ヘッダに載せる fetch ラッパーを追加 |

- `save/remove/update` のシグネチャは可能な限り維持し、中身を `fetch` 化する。
- 既存 localStorage データの扱い（MVP は任意）: 初回ログイン時に「ローカルの進行を
  インポート」する導線を将来検討。MVP コアには含めない。

---

## 8. 実装ステップ

1. プロジェクト雛形（Spring Boot / Gradle / Docker Compose で PostgreSQL）
2. Flyway で `users` / `progressions` テーブル作成
3. User 登録・ログイン・JWT 発行（Spring Security 設定）
4. Progression CRUD（所有権チェック込み）
5. CORS（資格情報付き）・CSRF（Cookie 認証）・ProblemDetail・Bean Validation の整備
6. JUnit（認証・CRUD・所有権の統合テスト）
7. springdoc-openapi で Swagger UI 公開
8. フロント `useProgressions` を API 化＋ログイン画面

---

## 9. 環境構築手順

前提: Docker Desktop（または Docker Engine + Compose）がインストール済みであること。

```bash
# 0. Java 21（Amazon Corretto）のインストール（SDKMAN、複数バージョン管理が容易）
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
# ↑ 実行後 "sdk: command not found" になる場合は、
#   ターミナルを開き直すか、上の source コマンドを再実行する

# Corretto 21 の識別子を確認（sdk list java | grep amzn で 21.0.12-amzn を確認済み）
sdk list java | grep amzn

sdk install java 21.0.12-amzn
sdk use java 21.0.12-amzn

# Corretto-21.x と表示されれば成功
java -version
```

> AWSへのデプロイを視野に入れているため、本番実行環境との一致・
> Amazonによる長期無料サポートを重視し Amazon Corretto を採用する。
> macOS で Homebrew を使う場合は `brew install --cask corretto` でも代替可能だが、
> バージョン切り替えが楽な SDKMAN を推奨する。

```bash
# 0.5 VSCode 拡張機能のインストール（Java / Spring Boot 開発一式）
code --install-extension vscjava.vscode-java-pack
code --install-extension vmware.vscode-boot-dev-pack
```

```bash
# 1. Spring Initializr でプロジェクト雛形を生成し backend/ へ展開
# bootVersion は指定しない（固定すると将来 EOL で 400 Bad Request になるため、
# Initializr が対応している最新版を自動選択させる。2026-08-12 時点では 4.1.0 が生成された）
curl https://start.spring.io/starter.zip \
  -d type=gradle-project-kotlin \
  -d language=java \
  -d javaVersion=21 \
  -d groupId=com.guitarpractice \
  -d artifactId=api \
  -d name=api \
  -d packageName=com.guitarpractice.api \
  -d dependencies=web,security,data-jpa,validation,postgresql,flyway \
  -o backend.zip

unzip backend.zip -d backend
rm backend.zip
```

> Spring Boot 4.x では一部スターター名が変わっている（旧 3.x 系のチュートリアルとは異なる点に注意）。
> - `spring-boot-starter-web` → `spring-boot-starter-webmvc`
> - Flyway 専用の `spring-boot-starter-flyway` が新設され、統一の `spring-boot-starter-test` は
>   廃止。`-data-jpa-test` / `-flyway-test` / `-security-test` / `-validation-test` / `-webmvc-test`
>   のように機能別のテストスターターに分割されている。

```jsonc
// リポジトリルート .vscode/settings.json
// SDKMAN は ~/.sdkman/candidates/java/21.0.12-amzn にJDKを置くため、
// VSCode の Java 拡張機能に明示的にパスを教える（`sdk home java 21.0.12-amzn` で確認可）
{
  "java.jdt.ls.java.home": "/absolute/path/to/.sdkman/candidates/java/21.0.12-amzn",
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-21",
      "path": "/absolute/path/to/.sdkman/candidates/java/21.0.12-amzn",
      "default": true
    }
  ]
}
```

```jsonc
// リポジトリルート .vscode/extensions.json（開いた際に拡張機能を推奨表示）
{
  "recommendations": ["vscjava.vscode-java-pack", "vmware.vscode-boot-dev-pack"]
}
```

```kotlin
// backend/build.gradle.kts に追記（Initializr の依存関係一覧に無いもの）
// Spring Boot 4.1.0 / Spring Framework 7.0.8 / JUnit 6 環境でビルド成功を確認済み（2026-08-12）
dependencies {
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")
    testRuntimeOnly("com.h2database:h2")
}
```

```yaml
# docker-compose.yml（リポジトリルート、開発用 PostgreSQL）
# 認証情報はハードコードせず環境変数化し、.env（gitignore済み）が無い場合の
# デフォルト値のみコードに残す（secretsをgit管理しないため）
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ${DB_NAME:-guitar_practice}
      POSTGRES_USER: ${DB_USER:-guitar_practice}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-guitar_practice}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# 2. PostgreSQL 起動
docker compose up -d
```

```yaml
# backend/src/main/resources/application.yml（新規作成）
# DB接続情報は docker-compose.yml の POSTGRES_DB/USER/PASSWORD と同じ環境変数名で揃える
# （Spring の ${VAR:default} 記法。.env 等で上書きしない限りローカル既定値を使う）
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/${DB_NAME:guitar_practice}
    username: ${DB_USER:guitar_practice}
    password: ${DB_PASSWORD:guitar_practice}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8080
```

```bash
# 3. application.yml 作成後、起動確認
cd backend
./gradlew bootRun
```

> VSCode上で開発する場合、上記の代わりに Spring Boot Dashboard
>（拡張機能パックに含まれる、サイドバーの実行アイコン）から `api` を選んで
> 再生ボタンで起動・デバッグ実行も可能。ブレークポイントを使う場合はこちらが便利。

起動後の疎通確認:

- `docker compose ps` — `postgres` コンテナが `healthy` になっている
- `http://localhost:8080/swagger-ui.html` — Swagger UI が表示される

---

## 10. 日常の起動・停止方法

§9は初回のみのセットアップ手順。2回目以降、開発時に立ち上げる／終わる際は以下の手順のみでよい。

### 起動

```bash
# 1. Docker Desktop アプリを起動しておく（Launchpad等から）

# 2. リポジトリルートで PostgreSQL コンテナ起動
docker compose up -d

# 3. backend/ に移動してアプリ起動
cd backend
./gradlew bootRun
```

> VSCodeの場合は `./gradlew bootRun` の代わりに Spring Boot Dashboard から `api` を再生ボタンで起動してもよい。

疎通確認は§9と同じく `http://localhost:8080/swagger-ui.html`。

### 停止

```bash
# 1. アプリ停止: bootRun を実行しているターミナルで Ctrl+C
#    （VSCodeの場合は Spring Boot Dashboard の停止ボタン）

# 2. PostgreSQL コンテナ停止（リポジトリルートで）
docker compose stop
```

- `docker compose stop`: コンテナを停止するだけでデータは保持される。次回は `docker compose up -d` で再開できる（軽量・通常はこちらでよい）。
- `docker compose down`: コンテナとネットワークを削除する。named volume（`postgres_data`）は残るため、データ自体は消えない。
- `docker compose down -v`: **ボリュームごと削除するため、DBのデータも消える**。環境を完全にリセットしたい時のみ使う。

---

## 11. 環境構築トラブルシューティング

§9 の手順を実際に進める中で詰まったポイントと対処法。

### macOS標準の bash が古く、SDKMAN インストーラが失敗する

```
SDKMAN requires Bash 4 or higher, but you are running Bash 3.2.57(1)-release.
'exit 1': command failed with exit code 1.
source: no such file or directory: /Users/xxx/.sdkman/bin/sdkman-init.sh
```

- **原因**: macOS 標準の `/bin/bash` はライセンス上の理由（GPLv3回避）でバージョン3.2のまま更新されていない。SDKMANのインストーラはBash 4以上を要求するスクリプトのため、標準bashで実行すると失敗する。日常利用しているシェルが zsh であることとは無関係（インストーラ実行時のみの制約）。
- **対処**:
  ```bash
  # 1. Homebrew で新しい bash を導入
  brew install bash

  # 2. Mac のアーキテクチャを確認
  uname -m   # arm64 = Apple Silicon / x86_64 = Intel

  # 3. 新しい bash を明示的に指定してインストーラを再実行
  #    Apple Silicon の場合
  curl -s "https://get.sdkman.io" | /opt/homebrew/bin/bash
  #    Intel Mac の場合
  curl -s "https://get.sdkman.io" | /usr/local/bin/bash

  # 4. 通常どおり zsh に読み込んで確認
  source "$HOME/.sdkman/bin/sdkman-init.sh"
  sdk version
  ```

### `sdk: command not found`

- **原因**: SDKMANのインストール（上記）が未完了、またはインストール後に `source` していない／新しいターミナルを開いていないため、現在のシェルに `sdk` コマンドが読み込まれていない。
- **対処**: `ls -la ~/.sdkman` でインストール済みか確認する。存在するのに認識されない場合は、ターミナルを一度閉じて開き直すか、`source "$HOME/.sdkman/bin/sdkman-init.sh"` を再実行する。

### zsh は行末の `#` コメントをデフォルトで解釈しない

```bash
sdk list java | grep amzn   # Corretto 21 の最新識別子を確認
```
のように同じ行末に `#` コメントを書くと、zsh（このプロジェクトの既定シェル）はインタラクティブシェルでは行末コメントを解釈せず、`#`以降の文字列をそのままコマンドの引数として渡してしまう（`grep: #: No such file or directory` 等のエラーになる）。bashでは問題なく動く記法のため見落としやすい。

- **対処**: コメントはコマンドと同じ行に書かず、必ず独立した行に分けて書く（§9のコード例は本件を踏まえて修正済み）。

### Spring Initializr で `bootVersion` を固定すると 400 エラーになる

```
{"status":400,"error":"Bad Request","message":"Invalid Spring Boot version '3.3.2', Spring Boot compatibility range is >=4.0.0","path":"/starter.zip"}
```

- **原因**: `curl`のパラメータで`bootVersion`を特定バージョンに固定していたが、そのバージョン系列（3.x）がSpring Initializr側でサポート終了（EOL）していた。Spring Initializrは対応中のバージョン範囲外を拒否する。
- **対処**: `bootVersion`パラメータを指定せず、Initializrにその時点の対応バージョンを自動選択させる（§9のコード例は修正済み）。2026-08-12時点では **Spring Boot 4.1.0** が生成された。バージョンが変わったことで一部スターター名（`spring-boot-starter-web` → `-webmvc` 等）も変わっている（§9本文の補足参照）。

### `./gradlew build` でテストが `Failed to determine a suitable driver class` で失敗する

- **原因**: `spring-boot-starter-data-jpa` とFlyway用スターターがクラスパスにある状態で、DB接続先が何も設定されていない（テスト用H2未追加・`application.yml`未設定・PostgreSQL未起動）ため、SpringがDataSource Beanを作成できない。§9のステップ2（H2追加）より前の段階では想定内のエラー。
- **対処**: `build.gradle.kts`に `testRuntimeOnly("com.h2database:h2")` を追加する。テスト実行時はSpring Bootが自動で埋め込みH2に接続するようになり解消する（本プロジェクトでは Spring Boot 4.1.0 + jjwt 0.12.6 + springdoc-openapi 2.6.0 の組み合わせでビルド成功を確認済み）。

---

## 12. 受け入れ基準（MVP 完了条件）

- [ ] メール + パスワードで登録・ログインでき、JWT が発行される
- [ ] ログインユーザーがコード進行を作成・一覧・取得・更新・削除できる
- [ ] 他ユーザーの進行は操作できない（404）
- [ ] 未認証リクエストは 401 で拒否される
- [ ] CSRF トークンが無い / 不正な更新系リクエストは 403 で拒否される
- [ ] ログアウトで認証 Cookie が失効し、以降は 401 になる
- [ ] データがサーバ再起動後も永続化されている
- [ ] 主要フローの JUnit テストが通る
