# サマリ
本ドキュメントは、開発メンバーがリポジトリ内の設計・運用情報へ素早くアクセスできるようにまとめた索引です。詳しい仕様や作業手順は各ファイル／コマンドに委譲しているため、必要に応じてリンク先を参照してください。

- **開発者向けドキュメント**: 設計資料の所在と更新手順
- **データベース**: ローカル／Cloud SQL の準備と Prisma スクリプト
- **GCP へのデプロイ**: Cloud Build → Artifact Registry → Cloud Run の流れ
- **環境変数**: `.env.*` の使い分けと注意点

---

## 1. 開発者向けドキュメント

### 1.1 設計資料の所在

| 種別 | ファイル | 概要 |
|---|---|---|
| 機能一覧 | `docs/feature_list/feature_list.md` | 実装予定の機能を網羅し、優先度・ステータスを管理。 |
| 要件定義 | `docs/requirements_definition/requirements_definition.md` | 機能/非機能要件・制約・前提。合意済み仕様の参照元。 |
| システム構成 | `docs/system_overview.mmd` / `docs/architecture.svg` | 外部連携やレイヤ構成の俯瞰図。依存方向を確認。 |
| DB 設計 | `docs/database/ERD.md` / `docs/database/ERD.svg` | テーブルと関連の設計。`prisma/schema.prisma` と常に同期。 |
| 処理シーケンス | `docs/sequence/message-post-sequence.mmd` / `docs/sequence/weekly-report.mmd` | Webhook/週次レポートの時系列フロー。ハンドラ実装時に参照。 |
| リポジトリ構造 | `docs/structure/project-structure.md` | ディレクトリ責務の一覧。新規メンバーの導線。 |

### 1.2 ドキュメント更新フロー

1. `requirements_definition.md` で要件を更新。
2. `feature_list.md` に対象機能と優先度を反映。
3. `system_overview.mmd` と `architecture.svg` で構成影響を整理。
4. `docs/database/ERD.md` と `prisma/schema.prisma` を同期。
5. `docs/sequence/*.mmd` で処理の詳細を確定。
6. `src/` 実装と Prisma マイグレーションを更新。

### 1.3 実装参照ポイント

- エントリポイント: `src/index.ts`
  - `POST /webhook` → `presentation/controllers/lineWebhookController.ts`
  - `GET /reports/exercise/weekly` → `domain/services/exerciseWeeklyReportService.ts`
  - アプリ起動時に `presentation/scheduler/weeklyReportScheduler.ts` を登録
- レイヤ構造: Presentation → Domain → Infrastructure（一方向依存）
- Prisma クライアント: `infrastructure/prisma/client.ts`
- 主要サービス: `userService`, `exerciseWeeklyReportService`, `exerciseService` (alias)
- 詳細な仕様は各ファイル先頭コメントと型定義を参照

---

## 2. データベース

### 2.1 Prisma スクリプト一覧（`package.json`）

| コマンド | 目的 | 読み込む env |
|---|---|---|
| `bun run db:generate` | Prisma Client の再生成 | - |
| `bun run db:migrate:local` | ローカルDBにマイグレーションを適用 | `.env.local` |
| `bun run db:seed:local` | ローカルDBへシード投入 | `.env.local` |
| `bun run db:studio:local` | Prisma Studio（ローカル接続） | `.env.local` |
| `bun run db:reset:local` | ローカルDBを初期化（破壊的） | `.env.local` |
| `bun run db:migrate:cloudsql` | Cloud SQL にマイグレーションを適用 | `.env` など Cloud SQL 用 env |
| `bun run db:seed:cloudsql` | Cloud SQL へシード投入 | 同上 |
| `bun run db:studio:cloudsql` | Prisma Studio（Cloud SQL 接続） | 同上 |

### 2.2 ローカル PostgreSQL（Docker Compose）

1. コンテナ起動
   ```bash
   docker compose up -d
   ```
2. `.env.local` を作成し、`DATABASE_URL=postgresql://admin:hoge@localhost:5432/linebot-db?schema=public` などを設定。その他の開発用トークンもここに置く。
3. Prisma 実行
   ```bash
   bun run db:migrate:local
   bun run db:seed:local
   ```
4. 確認
   ```bash
   bun run db:studio:local
   # または docker exec -it linebot-db psql -U admin -d linebot-db
   ```

### 2.3 Cloud SQL をローカルから操作する

1. Cloud SQL Proxy を起動（別ターミナルで保持）
   ```bash
   cloud-sql-proxy --port 5433 diet-linebot-467114:asia-northeast1:diet-linebot-pg
   ```
2. Cloud SQL 用 env を作成（例: `.env.cloudsql_proxy`）
   ```env
   PSQL_USER=postgres
   PSQL_PW=<URL_ENCODED_PASSWORD>
   PSQL_DB=diet_linebot
   PSQL_HOST=127.0.0.1
   PSQL_PORT=5433
   DATABASE_URL=postgresql://${PSQL_USER}:${PSQL_PW}@${PSQL_HOST}:${PSQL_PORT}/${PSQL_DB}?schema=public
   ```
3. Prisma 実行
   ```bash
   bunx dotenv --dotenv-expand -e .env.cloudsql_proxy -- bunx prisma migrate deploy
   bunx dotenv --dotenv-expand -e .env.cloudsql_proxy -- bun prisma/seed.ts
   bunx dotenv --dotenv-expand -e .env.cloudsql_proxy -- bunx prisma studio
   ```
   ※ Proxy を停止すると Cloud SQL との接続は切断される。

### 2.4 シードスクリプト概要

- 入口: `prisma/seed.ts`
- マスタ定義: `prisma/seeds/*.ts`（例: `mealMaster`, `exerciseMaster`）
- 動作: `upsert` による再実行可能な同期。未使用レコードは必要に応じて削除。
- 想定用途: 初期投入、マスタの同期、緊急修正の反映。
- 実行後は Prisma Studio や `psql` で `mst_meals`, `mst_exercises` を確認。

---

## 3. GCP へのデプロイ

### 3.1 前提

- `gcloud` CLI / Docker がインストール済み
- GCP プロジェクト、Artifact Registry、Cloud Run、Cloud SQL が準備済み
- Secret Manager に `DATABASE_URL`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `GEMINI_API_KEY`, `IMGBB_API_KEY` を登録済み

### 3.2 Cloud Build でビルド & プッシュ

```bash
PROJECT_ID=diet-linebot-467114
REGION=asia-northeast1
IMAGE_TAG=asia-northeast1-docker.pkg.dev/${PROJECT_ID}/diet-linebot/diet-linebot:0.0.1

gcloud config set project ${PROJECT_ID}
gcloud services enable artifactregistry.googleapis.com run.googleapis.com
gcloud builds submit --tag ${IMAGE_TAG} .
```

### 3.3 Cloud Run へデプロイ

```bash
SERVICE=diet-linebot
INSTANCE=${PROJECT_ID}:${REGION}:diet-linebot-pg

gcloud run deploy ${SERVICE} \
  --image ${IMAGE_TAG} \
  --region ${REGION} \
  --allow-unauthenticated \
  --add-cloudsql-instances ${INSTANCE} \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest,LINE_CHANNEL_ACCESS_TOKEN=LINE_CHANNEL_ACCESS_TOKEN:latest,LINE_CHANNEL_SECRET=LINE_CHANNEL_SECRET:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,IMGBB_API_KEY=IMGBB_API_KEY:latest
```

- Cloud Run では `$PORT` が注入されるため、`src/index.ts` は自動で該当ポートを使用。
- Prisma の接続数は `?connection_limit=` を利用して Cloud SQL の上限に合わせる。

### 3.4 Cloud SQL 用 DSN の作成

```bash
node -e 'console.log(encodeURIComponent(process.argv[1]))' '<PLAIN_PASSWORD>'
```

- 上記で取得した値を `DATABASE_URL=postgresql://${USER}:${PW}@/${DB}?host=/cloudsql/${INSTANCE}&schema=public` に埋め込み、Secret Manager の `DATABASE_URL` として保存。
- GUI（Cloud SQL Studio、DBeaver）で確認する場合は Cloud SQL Proxy (TCP) を利用し、`127.0.0.1:5433` 経由で接続。

---

## 4. 環境変数

| ファイル | 用途 | 主な設定例 |
|---|---|---|
| `.env.local` | 完全ローカル（Docker Compose）での開発・テスト。`bun run dev` やローカルDB系スクリプトが参照。 | `DATABASE_URL=postgresql://admin:hoge@localhost:5432/linebot-db?schema=public` |
| `.env` | Cloud Run 本番用。Unix ソケット経由で Cloud SQL に接続。`bun run dev:cloudsql` で使う場合は Cloud SQL Proxy を対応させる。 | `DATABASE_URL=postgresql://${USER}:${PW}@/${DB}?host=/cloudsql/${INSTANCE}&schema=public` |
| `.env.cloudsql_proxy` など | ローカルから Cloud SQL Proxy (TCP) に接続してマイグレーション／シードを流す用途。 | `DATABASE_URL=postgresql://${USER}:${PW}@127.0.0.1:5433/${DB}?schema=public` |

- パスワードを含む値は URL エンコードしたものを使用（`bun eval 'console.log(encodeURIComponent("plain"))'`）。
- Secrets はリポジトリへコミットしない。Cloud Run では Secret Manager から注入し、`.env.*` はコンテナに含めない。
- `bun run dev:cloudsql` は `.env` を読み込み、Cloud SQL に接続した状態でホットリロード起動する。実行前に Cloud SQL Proxy を正しいモードで立ち上げる。

---

### 補足

- Mermaid 図などの生成: `bun run docs:generate`
- 不明点は該当ディレクトリの README やコメントを参照し、差分は Pull Request で共有。
- Prisma や Bun のバージョンは `package.json` を確認。更新時は lockfile を合わせてコミットする。
