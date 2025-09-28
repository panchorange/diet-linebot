# 開発者向けドキュメント（docs/）

目的: 機能追加・保守運用に必要な設計情報を集約。各仕様書の役割を理解し、`src/` 実装の入力として活用する。

### ドキュメント一覧（ファイル名 / プロジェクトルートからのパス / 目的）

| ファイル名 | パス | 目的 |
|---|---|---|
| feature_list.md | `docs/feature_list/feature_list.md` | 実装対象機能の一覧（計画含む）。各機能から図や実装へ辿る起点。 |
| requirements_definition.md | `docs/requirements_definition/requirements_definition.md` | 機能/非機能要件、前提、制約、技術スタック。期待仕様の基準。 |
| system_overview.mmd | `docs/system_overview.mmd` | システム全体の俯瞰（ユーザー/LINE/アプリ/DB/AI/スケジューラの関係）。 |
| architecture.svg | `docs/architecture.svg` | レイヤ構造（Presentation→Domain→Infrastructure）と依存方向の可視化。 |
| database/ERD.md | `docs/database/ERD.md` | データモデル（Mermaid ERD）。テーブル/列挙/リレーションの把握。 |
| database/ERD.svg | `docs/database/ERD.svg` | ERDの画像版（レビュー/共有用）。 |
| sequence/message-post-sequence.mmd | `docs/sequence/message-post-sequence.mmd` | Webhook受信→処理→返信の時系列。メッセージ投稿の詳細フロー。 |
| sequence/weekly-report.mmd | `docs/sequence/weekly-report.mmd` | 週次レポート生成→Pushの時系列。スケジューラの詳細フロー。 |
| project-structure.md | `docs/structure/project-structure.md` | リポジトリのディレクトリ構成図（Mermaid）。レイヤ/責務/依存の俯瞰。 |

### ドキュメント間の関係性（インプット → アウトプット）

- requirements_definition.md → feature_list.md  
  - 要件を基に「何を作るか」を列挙・優先づけ。

- requirements_definition.md → system_overview.mmd / architecture.svg  
  - 期待する振る舞い・非機能を踏まえ、全体構成と依存関係を設計。

- feature_list.md → sequence/message-post-sequence.mmd・sequence/weekly-report.mmd  
  - 各機能の起点/終点/参加者/データの流れを時系列で具体化。

- database/ERD.md ↔ sequence/*.mmd  
  - フローで必要な入出力・集計要件と、ERの粒度/関係を相互に擦り合わせ。  
  - 補足: 実DBスキーマは `prisma/schema.prisma`（docs外）。ERDはこれと相互参照しつつ維持。

- system_overview.mmd / architecture.svg → 実装方針（`src/`）  
  - ディレクトリ/責務の割当、依存方向（Presentation→Domain→Infrastructure）の遵守に反映。

### 生成・更新の推奨フロー

1. requirements_definition.md を更新（要求変更の取り込み）
2. feature_list.md を更新（対象機能/優先度の見直し）
3. system_overview.mmd / architecture.svg を更新（構成影響を反映）
4. database/ERD.md を更新（データ構造の反映。必要に応じて `prisma/schema.prisma` と整合）
5. sequence/*.mmd を更新（処理フローの確定）
6. 実装（`src/`）を更新（実装導線の整備）

---

### 実装リマインド（src/構成の要点）

- エントリポイント: `src/index.ts`（Bunサーバ）
  - `POST /webhook` → `presentation/controllers/lineWebhookController.ts`
  - `GET /reports/exercise/weekly` → `domain/services/exerciseWeeklyReportService`
  - 起動時に `presentation/scheduler/weeklyReportScheduler.ts` を開始
- レイヤ: Presentation → Domain → Infrastructure（一方向）
- 主なサービス: `userService`, `exerciseAdvice`（エクスポート名は `exerciseService` 互換）, `exerciseWeeklyReportService`
- Prisma: `infrastructure/prisma/client.ts`（DB I/O）、`repositories/PrismaUserRepository.ts`

詳細な実装の説明は各ソースファイルの先頭コメントを参照してください。

### DBシード（`prisma/seed.ts`）

- **役割**
  - **オーケストレーション**: PrismaClient の初期化/終了、各マスタ用シード関数の実行順序を制御。
  - **再実行可能性（idempotent）**: 何度流しても同じ最終状態になることを保証。
  - **失敗の早期検知**: 例外でプロセスを失敗させ、CI/デプロイで不整合を検出。

- **ユースケース**
  - **初期構築/環境再構築**: 空DBへマスタ投入（例: `mst_exercises`）。
  - **マスタ同期**: 追加/更新を反映し、未使用レコードは安全に削除（参照ありは削除しない）。
  - **マイグレーション後の整合確保**: スキーマ変更後に再投入して整合性を維持。
  - **本番の緊急修正を反映**: 一時的にGUIで修正した内容をシードへ取り込み、ソース・オブ・トゥルースをコードに戻す。

- **使い方**
  - **前提**
    - `DATABASE_URL` が設定済み。
    - スキーマ適用済み: `bun run db:migrate`
  - **実行方法**
    - 方式A（推奨・設定あり）
      1) `package.json` に Prisma の seed スクリプトを設定: `"prisma": { "seed": "bun prisma/seed.ts" }`
      2) 実行: `bunx prisma db seed`
    - 方式B（設定なしでも可）
      - 直接実行: `bun prisma/seed.ts`
  - **確認**
    - `bun run db:studio` でデータをGUI確認。

- **実装メモ**
  - マスタごとの同期ロジックは `prisma/seeds/*` に分割（例: `prisma/seeds/exerciseMaster.ts`）。
  - 参照があるレコードは削除しない方針（必要なら `isActive` 列で論理削除を検討）。
  - `ExerciseMaster` では `upsert + 未使用の安全な削除` を実装済み。
  - `MealMaster` も同様に `upsert + 未使用の安全な削除`。主キーは Int（1〜50）。
  - `mst_meals.id` のシーケンスはシード時に MAX(id) に調整。
  - 栄養成分は100gあたりの概算値。厳密さよりも実用性重視で、将来の補正を許容。

- **関連ファイル**
  - `prisma/seed.ts`
  - `prisma/seeds/exerciseMaster.ts`
  - `prisma/seeds/mealMaster.ts`
  - `prisma/schema.prisma`

---

### GCP へのイメージビルド/プッシュ/デプロイ（Cloud Build + Artifact Registry + Cloud Run 推奨）

Cloud Build を使うとローカルの CPU アーキテクチャ差（arm64/amd64）を意識せずにビルドできます。イメージ内に `.env.local` は含めず、Secrets から注入します。

前提
- `gcloud`/Docker が導入済み
- GCP プロジェクト作成済み
- Artifact Registry（Docker）を使うリージョンを決める（例: `asia-northeast1`）

1) プロジェクト/リージョン設定と API 有効化
```bash
PROJECT_ID=your-gcp-project-id
REGION=asia-northeast1
REPOSITORY=diet-linebot
SERVICE=diet-linebot

gcloud config set project ${PROJECT_ID}
gcloud services enable artifactregistry.googleapis.com run.googleapis.com
```

2) Artifact Registry リポジトリ作成（未作成なら）
```bash
gcloud artifacts repositories create ${REPOSITORY} \
  --repository-format=docker \
  --location=${REGION}
```

3) Cloud Build でビルド & プッシュ
```bash
gcloud builds submit --tag asia-northeast1-docker.pkg.dev/diet-linebot-467114/diet-linebot/diet-linebot:0.0.1 .
```


4) Cloud Run へデプロイ（Secrets/Cloud SQL 連携の例）
- Secrets は事前に Secret Manager へ登録（例: `DATABASE_URL`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `GEMINI_API_KEY`, `IMGBB_API_KEY`）。
- Cloud SQL を使う場合、インスタンス接続名を指定（例: `${PROJECT_ID}:${REGION}:diet-linebot-pg`）。

```bash
INSTANCE=${PROJECT_ID}:${REGION}:diet-linebot-pg

gcloud run deploy ${SERVICE} \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --allow-unauthenticated \
  --add-cloudsql-instances "${INSTANCE}" \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest,LINE_CHANNEL_ACCESS_TOKEN=LINE_CHANNEL_ACCESS_TOKEN:latest,LINE_CHANNEL_SECRET=LINE_CHANNEL_SECRET:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-secrets=IMGBB_API_KEY=IMGBB_API_KEY:latest \
  --concurrency=10 \
  --memory=512Mi \
  --cpu=1
```

メモ
- アプリは `process.env.PORT` を読むため、Cloud Run から渡される `$PORT` で自動的に起動します（Dockerfile は `EXPOSE 8080` のままでOK）。
- Prisma の接続数は DSN のクエリ `connection_limit=` で抑制推奨。
- Dockerfile は本番で `.env.local` をコピーしない構成に修正済み。

5) Cloud SQL の DSN（例）
- Unix ソケット経由: `host=/cloudsql/${INSTANCE}`
```bash
DATABASE_URL=""
```
↑のURLに使うpsqlのPWは、以下のコマンドでencodeしたものを入れる。

```bash
node -e 'console.log(encodeURIComponent(process.argv[1]))' '${psqlで設定したPW}'
```


この文字列を Secret `DATABASE_URL` に保存しておきます。

6) 任意: ローカルでのビルド/起動（Apple Silicon 等）
- できるだけ Cloud Build 推奨。ローカルで直接ビルドする場合は `buildx` を使用。
```bash
# 例: arm64 でビルド
docker buildx build --platform linux/arm64 -t ${SERVICE}:dev .

# 起動（必要な環境変数は --env で渡すか --env-file を使用）
docker run --rm -p 8080:8080 ${SERVICE}:dev
```

- 作業内容: `Dockerfile` を本番用に簡素化（`.env.local` のコピー削除）。`docs/README.md` の GCP デプロイ章を Cloud Build/Artifact Registry/Cloud Run 前提で書き直しました。
- 次のアクション: 上記内容で編集してデプロイを進めてください。Cloud Scheduler/Job 化も必要なら続けて実装案を出します。

## Cloud SQL 接続・マイグレーション手順

- **環境ファイルの使い分け**
  - `.env`（Cloud Run 用）
    ```env
    PSQL_USER=XXXX
    PSQL_PW=<URL_ENCODED_PASSWORD> 
    PSQL_DB=diet_linebot
    CLOUDSQL_INSTANCE=XXXX

    DATABASE_URL=postgresql://${PSQL_USER}:${PSQL_PW}@/${PSQL_DB}?host=/cloudsql/${CLOUDSQL_INSTANCE}&schema=public
    ```
  - `.env.local`（ローカル／Cloud SQL Proxy 経由）
    ```env
    PSQL_USER=postgres
    PSQL_PW=<URL_ENCODED_PASSWORD>
    PSQL_DB=diet_linebot
    PSQL_HOST=127.0.0.1
    PSQL_PORT=5433

    DATABASE_URL=postgresql://${PSQL_USER}:${PSQL_PW}@${PSQL_HOST}:${PSQL_PORT}/${PSQL_DB}?schema=public
    ```
    - `PSQL_PORT` は Proxy 起動時のポートに合わせる。

- **パスワードの URL エンコード**
  ```bash
  bun eval 'console.log(encodeURIComponent("<PLAIN_PASSWORD_FROM_DEV>"))'
  ```
  - `<PLAIN_PASSWORD_FROM_DEV>` には開発者から共有された生パスワードを入れる。URL エンコード後の値を `PSQL_PW` に設定。

- **Cloud SQL Proxy の起動**
  ```bash
  cloud-sql-proxy --port 5433 diet-linebot-467114:asia-northeast1:diet-linebot-pg
  ```
  - プロキシは別ターミナルで起動したままにしておく。

- **Prisma マイグレーション / シード**
  ```bash
  bunx dotenv --dotenv-expand -e .env -- bun prisma migrate deploy
  bunx dotenv --dotenv-expand -e .env -- bun prisma db seed
  ```
  - Cloud Run 上で同じコマンドを実行する場合は `.env` を指定。

- **DBeaver からの接続確認**
  1. Cloud SQL Proxy を起動した状態で DBeaver → 新規接続 → PostgreSQL。
  2. Host `127.0.0.1`、Port `5433`、Database `diet_linebot`、Username `postgres` を入力。
  3. Password は開発者から共有された生パスワード（エンコード前）を入力。
  4. `Test Connection` → `Finish`。`public` → `Tables` を展開してテーブルを確認。

- **Cloud SQL Studio での確認**
  - Cloud SQL コンソール → 対象インスタンス → Cloud SQL Studio。
  - Database に `diet_linebot` を指定して接続し、`public` → `Tables` で一覧を確認。

### 備考

- Mermaid→画像（SVG）出力は適宜ツールで生成します（例: ERDは `docs/database/ERD.svg`）。  
- 「インプットがリポジトリ外」の場合は関係性に「不明」または出典（例: 事業要件の外部資料）を注記してください。
