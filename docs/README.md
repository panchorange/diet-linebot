# 開発者向けドキュメント（docs/）

目的: 機能追加・保守運用に必要な設計情報を集約。各仕様書の役割を理解し、`src/` 実装の入力として活用する。

### ドキュメント一覧（ファイル名 / プロジェクトルートからのパス / 目的）

| ファイル名 | パス | 目的 |
|---|---|---|
| feature_list.md | `docs/feature_list/feature_list.md` | 実装対象機能の一覧（計画含む）。各機能から図や実装へ辿る起点。 |
| requirements.md | `docs/requirements.md` | 機能/非機能要件、前提、制約、技術スタック。期待仕様の基準。 |
| system_overview.mmd | `docs/system_overview.mmd` | システム全体の俯瞰（ユーザー/LINE/アプリ/DB/AI/スケジューラの関係）。 |
| architecture.svg | `docs/architecture.svg` | レイヤ構造（Presentation→Domain→Infrastructure）と依存方向の可視化。 |
| database/ERD.md | `docs/database/ERD.md` | データモデル（Mermaid ERD）。テーブル/列挙/リレーションの把握。 |
| database/ERD.svg | `docs/database/ERD.svg` | ERDの画像版（レビュー/共有用）。 |
| sequence/message-post-sequence.mmd | `docs/sequence/message-post-sequence.mmd` | Webhook受信→処理→返信の時系列。メッセージ投稿の詳細フロー。 |
| sequence/weekly-report.mmd | `docs/sequence/weekly-report.mmd` | 週次レポート生成→Pushの時系列。スケジューラの詳細フロー。 |
| project-structure.md | `docs/structure/project-structure.md` | リポジトリのディレクトリ構成図（Mermaid）。レイヤ/責務/依存の俯瞰。 |

### ドキュメント間の関係性（インプット → アウトプット）

- requirements.md → feature_list.md  
  - 要件を基に「何を作るか」を列挙・優先づけ。

- requirements.md → system_overview.mmd / architecture.svg  
  - 期待する振る舞い・非機能を踏まえ、全体構成と依存関係を設計。

- feature_list.md → sequence/message-post-sequence.mmd・sequence/weekly-report.mmd  
  - 各機能の起点/終点/参加者/データの流れを時系列で具体化。

- database/ERD.md ↔ sequence/*.mmd  
  - フローで必要な入出力・集計要件と、ERの粒度/関係を相互に擦り合わせ。  
  - 補足: 実DBスキーマは `prisma/schema.prisma`（docs外）。ERDはこれと相互参照しつつ維持。

- system_overview.mmd / architecture.svg → 実装方針（`src/`）  
  - ディレクトリ/責務の割当、依存方向（Presentation→Domain→Infrastructure）の遵守に反映。

### 生成・更新の推奨フロー

1. requirements.md を更新（要求変更の取り込み）
2. features.md を更新（対象機能/優先度の見直し）
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

- **関連ファイル**
  - `prisma/seed.ts`
  - `prisma/seeds/exerciseMaster.ts`
  - `prisma/schema.prisma`

### 備考

- Mermaid→画像（SVG）出力は適宜ツールで生成します（例: ERDは `docs/database/ERD.svg`）。  
- 「インプットがリポジトリ外」の場合は関係性に「不明」または出典（例: 事業要件の外部資料）を注記してください。
