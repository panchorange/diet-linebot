# プロジェクト構成

リポジトリのディレクトリ構成をtree形式で示します。

```
diet-linebot/
├── src/                          # メインソースコード
│   ├── index.ts                  # エントリポイント（Bunサーバ）
│   ├── config/                   # 実行時設定
│   │   ├── env.ts                # 環境変数の検証と公開
│   │   ├── lineClient.ts         # LINE SDK クライアント
│   │   └── aiClient.ts           # Gemini クライアント
│   ├── presentation/             # プレゼンテーション層
│   │   ├── controllers/
│   │   │   └── lineWebhookController.ts  # Webhook受付・署名検証
│   │   ├── handlers/
│   │   │   └── messageHandler.ts         # メッセージ処理・分岐
│   │   ├── validators/
│   │   │   └── lineEventValidator.ts     # LINE署名検証
│   │   ├── scheduler/
│   │   │   └── weeklyReportScheduler.ts  # 週次レポート配信
│   │   └── wiring/
│   │       └── serviceLocator.ts         # DI組み立て
│   ├── domain/                   # ドメイン層
│   │   ├── interfaces/
│   │   │   └── IUserRepository.ts        # Userリポジトリのポート
│   │   ├── models/
│   │   │   ├── ConceptualSchema.ts       # 運動ドメインの概念スキーマ
│   │   │   ├── ExternalViews.ts          # 応答/ビューの外部スキーマ
│   │   │   └── User.ts                   # Userエンティティ型
│   │   └── services/
│   │       ├── userService.ts            # ユーザー登録/取得
│   │       ├── exerciseService.ts        # 運動記録
│   │       └── exerciseWeeklyReportService.ts  # 週次集計
│   └── infrastructure/           # インフラ層
│       ├── line/
│       │   └── lineMessageBuilder.ts     # LINE返信メッセージテンプレ
│       └── prisma/
│           ├── client.ts                 # PrismaClient単一インスタンス
│           └── repositories/
│               └── PrismaUserRepository.ts  # User永続化実装
├── prisma/                       # Prismaスキーマ・マイグレーション
│   ├── schema.prisma
│   └── migrations/
├── docs/                         # 設計書・図
│   ├── README.md                 # 開発者向けドキュメント索引
│   ├── requirements.md           # 要件定義
│   ├── feature_list/
│   │   └── feature_list.md       # 機能一覧
│   ├── sequence/
│   │   ├── message-post-sequence.mmd     # メッセージ投稿フロー
│   │   └── weekly-report.mmd             # 週次レポートフロー
│   ├── database/
│   │   ├── ERD.md                # データモデル（Mermaid ERD）
│   │   └── ERD.svg               # ERD画像版
│   ├── structure/
│   │   └── project-structure.md  # 本ファイル
│   ├── system_overview.mmd       # システム全体俯瞰
│   └── architecture.svg          # レイヤ構造図
├── docker-compose.yml            # 開発用PostgreSQL
├── package.json                  # 依存関係・スクリプト
├── tsconfig.json                 # TypeScript設定
└── README.md                     # 動作確認・統合テスト用ガイド
```

## 依存関係（レイヤ）
- Presentation → Domain → Infrastructure（一方向）
- エントリポイント: `src/index.ts` → `presentation/controllers/lineWebhookController.ts`
- 週次バッチ: `presentation/scheduler/weeklyReportScheduler.ts` → `domain/services/exerciseWeeklyReportService.ts`
