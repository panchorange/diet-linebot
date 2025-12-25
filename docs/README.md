# サマリ
本ドキュメントは、開発メンバーがリポジトリ内の設計・運用情報へ素早くアクセスできるようにまとめた索引です。詳しい仕様や作業手順は各ファイル／コマンドに委譲しているため、必要に応じてリンク先を参照してください。

- **開発者向けドキュメント**: 設計資料の所在と更新手順
- **データベース**: ローカル（Docker Compose）／本番（Neon）の準備と Prisma スクリプト
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

### 1.4 アーキテクチャ概要（3層）

- **ディレクトリ構成**: `src/presentation/`（エンドポイント・LINE連携）、`src/domain/`（ユースケース・モデル）、`src/infrastructure/`（Prisma や外部API）で三層アーキテクチャを維持。
- **DB三層スキーマ**: 概念スキーマは `src/domain/models/ConceptualSchema.ts`、論理スキーマは `docs/database/ERD.md`、物理スキーマは `prisma/schema.prisma`（および `prisma/migrations/`）。それぞれを同期させる。
- **外部公開用ビュー**: `src/domain/models/ExternalViews.ts` が Presentation 層向けの出力フォーマットを定義し、三層間の境界を明示している。

---

## 2. データベース

### 2.1 データベース構成

- **ローカル開発**: Docker Compose で PostgreSQL を起動
- **本番環境**: Neon（サーバーレス PostgreSQL）を使用

### 2.2 ローカル PostgreSQL（Docker Compose）

#### セットアップ

1. **コンテナ起動**
   ```bash
   docker compose up -d
   ```

2. **`.env.local` を作成**
   ```env
   DATABASE_URL=postgresql://admin:hoge@localhost:5432/linebot-db?schema=public
   LINE_CHANNEL_ACCESS_TOKEN=your_token
   LINE_CHANNEL_SECRET=your_secret
   GEMINI_API_KEY=your_gemini_key
   IMGBB_API_KEY=your_imgbb_key
   PORT=3000
   ```

3. **マイグレーション適用**
   ```bash
   bun run db:migrate:local
   ```

4. **シードデータ投入**
   ```bash
   bun run db:seed:local
   ```

5. **確認**
   ```bash
   # Prisma Studio で GUI 確認
   bun run db:studio:local

   # または psql で直接確認
   docker exec -it linebot-db psql -U admin -d linebot-db
   ```

#### よく使うコマンド

| コマンド | 目的 |
|---|---|
| `bun run db:generate` | Prisma Client の再生成 |
| `bun run db:migrate:local` | マイグレーション適用 |
| `bun run db:seed:local` | シード投入 |
| `bun run db:studio:local` | Prisma Studio 起動 |
| `bun run db:reset:local` | DB 初期化（破壊的） |

### 2.3 本番環境（Neon）

#### 初期セットアップ

1. **[Neon](https://neon.tech/) でプロジェクト作成**
   - リージョン: Asia Pacific (Singapore) 推奨
   - PostgreSQL バージョン: 16

2. **接続 URL を取得**
   - Neon ダッシュボードで「Connect」→ 接続文字列をコピー
   - 形式: `postgresql://user:password@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

3. **`.env.neon` を作成（ローカルテスト用）**
   ```env
   DATABASE_URL=postgresql://user:password@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

4. **マイグレーション適用**
   ```bash
   bunx dotenv --dotenv-expand -e .env.neon -- bunx prisma migrate deploy
   ```

5. **シードデータ投入**
   ```bash
   bunx dotenv --dotenv-expand -e .env.neon -- bun prisma/seed.ts
   ```

6. **確認**
   ```bash
   bunx dotenv --dotenv-expand -e .env.neon -- bunx prisma studio
   ```

#### Cloud Run への反映

Secret Manager に DATABASE_URL を登録:

```bash
# DATABASE_URL を Secret Manager に登録
echo -n 'postgresql://user:password@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' | \
gcloud secrets versions add DATABASE_URL --data-file=-

# サービスアカウントに権限付与
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:111705422540-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2.4 シードスクリプト概要

- **入口**: `prisma/seed.ts`
- **マスタ定義**: `prisma/seeds/*.ts`（`mealMaster`, `exerciseMaster`）
- **動作**: `upsert` による再実行可能な同期
- **想定用途**: 初期投入、マスタ更新、緊急修正
- **確認**: Prisma Studio で `mst_meals`, `mst_exercises` を確認

**注意**: Neon 無料プランはトランザクションタイムアウトが短いため、シードスクリプトはバッチ処理（100件ごと）を実装済み。

### 2.5 Cloud SQL 廃止の経緯（2025年12月）

当初は Cloud SQL を使用していましたが、個人開発では以下の理由で Neon へ移行しました:

- **コスト**: Cloud SQL は最小構成（db-f1-micro）でも月額 ¥1,200〜1,500
- **常時課金**: アイドル時も課金が継続
- **Neon の利点**: 無料枠（0.5GB）、自動スリープ、Cloud Run との統合が容易

Cloud SQL を再利用する場合は、Git 履歴（2025年12月以前）を参照してください。

---

## 3. GCP へのデプロイ

### 3.1 前提

- `gcloud` CLI がインストール済み
- `.env` に `PROJECT_ID`, `REGION` を含む環境変数を設定済み
- Secret Manager に `DATABASE_URL`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `GEMINI_API_KEY`, `IMGBB_API_KEY` を登録済み

### 3.2 Artifact Registry へイメージを push

```bash
bun run deploy:cloudrun
```

このコマンドで `.env` を読み込み、Cloud Build によるビルドと Artifact Registry への push が完了します。

### 3.3 Cloud Run へデプロイ

本プロジェクトは役割ごとに 2 つの Cloud Run リソースを使い分けています:

- **3.3.a サービス** (`diet-linebot`): LINE Webhook を受け付ける常駐 HTTP サーバー。ユーザーからのメッセージに即座に応答。
- **3.3.b ジョブ** (`diet-linebot-weekly-report`): 週次レポート専用バッチ。Cloud Scheduler から定期実行され、処理完了後に自動終了。

この構成により、Webhook 処理と定期バッチを独立してスケール・監視でき、ジョブ実行のタイミングを Cloud Scheduler で確実に制御できます。

#### 3.3.a サービス（LINE Webhook 処理）

1. [Cloud Run コンソール](https://console.cloud.google.com/run) で「**サービス**」を選択
2. サービス名: `diet-linebot`、コンテナイメージ: push した URL を指定
3. **変数とシークレット** タブで Secret Manager から環境変数を注入:
   - `DATABASE_URL`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `GEMINI_API_KEY`, `IMGBB_API_KEY`
4. **認証**: 未認証の呼び出しを許可（LINE からの Webhook を受信するため）
5. 「デプロイ」をクリック

エントリポイント: `src/index.ts`（デフォルト）

**注意**: Neon を使用するため、Cloud SQL インスタンスへの接続設定は不要です。

#### 3.3.b ジョブ（週次レポート配信）

1. [Cloud Run コンソール](https://console.cloud.google.com/run) で「**ジョブ**」を選択
2. ジョブ名: `diet-linebot-weekly-report`、コンテナイメージ: サービスと同じ URL を指定
3. **コンテナ** タブで以下を指定:
   - コンテナコマンド: `bun`
   - コンテナの引数: `src/cloudrunjobs/weeklyReportJob.ts`
4. **変数とシークレット** タブで Secret Manager から環境変数を注入（サービスと同じ）
5. **タスクの容量**: 並列処理上限を `1` に設定（重複送信防止）
6. 「作成」をクリック

エントリポイント: `src/cloudrunjobs/weeklyReportJob.ts`（全ユーザーへ週次レポートを送信して終了）

**注意**: Neon を使用するため、Cloud SQL インスタンスへの接続設定は不要です。

#### ジョブのトリガー設定（Cloud Scheduler）

1. [Cloud Scheduler コンソール](https://console.cloud.google.com/cloudscheduler) を開く
2. 「スケジュールを作成」をクリック
3. 以下を設定:
   - **名前**: `weekly-report-trigger`
   - **リージョン**: `asia-northeast1`
   - **頻度**: `0 20 * * 0`（毎週日曜 20:00）
   - **タイムゾーン**: `Asia/Tokyo`
   - **ターゲットタイプ**: `Cloud Run ジョブ`
   - **ジョブ**: `diet-linebot-weekly-report`
   - **サービスアカウント**: Compute Engine default service account
4. 「作成」をクリック

※ 初回は手動実行でレポート送信をテストしてから Scheduler を有効化してください。

---

## 4. 環境変数

| ファイル | 用途 | 主な設定例 |
|---|---|---|
| `.env.local` | ローカル開発（Docker Compose）。`bun run dev` やローカル DB スクリプトで参照。 | `DATABASE_URL=postgresql://admin:hoge@localhost:5432/linebot-db?schema=public` |
| `.env.neon` | Neon（本番 DB）への接続確認用。マイグレーション・シード投入時に使用。 | `DATABASE_URL=postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `.env` | Cloud Build / デプロイ用。`PROJECT_ID`, `REGION` などビルド時の変数を定義。 | `PROJECT_ID=diet-linebot-467114`<br>`REGION=asia-northeast1` |

### 環境変数の管理

- **ローカル開発**: `.env.local` に全ての開発用トークンを記載
- **本番環境**: Secret Manager で管理し、Cloud Run で注入
  - `DATABASE_URL`: Neon の接続文字列
  - `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`: LINE API 認証
  - `GEMINI_API_KEY`: Google Gemini API
  - `IMGBB_API_KEY`: 画像ホスティング
- **リポジトリへのコミット**: `.env.*` は全て `.gitignore` に含める

---

### 補足

- Mermaid 図などの生成: `bun run docs:generate`
- 不明点は該当ディレクトリの README やコメントを参照し、差分は Pull Request で共有。
- Prisma や Bun のバージョンは `package.json` を確認。更新時は lockfile を合わせてコミットする。
