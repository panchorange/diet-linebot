
# システムアーキテクチャ
3層アーキテクチャを採用
## プレゼンテーション層
外部スキーマ
```md
presentation/
├── controllers/          # HTTPリクエストを受け取る
├── handlers/            # 各種イベントを処理
├── validators/          # 入力データの検証
└── wiring/             # 依存性注入の設定
```

## ドメイン層(XXスキーマ)
概念スキーマ
* ビジネスロジック、ドメインモデルを定義
```md
domain/
├── interfaces/         # インターフェース定義
├── models/            # ビジネスエンティティ
└── services/          # ビジネスロジック
```

## インフラストラクチャ層
内部スキーマ
* DBアクセス等を担当
```md
infrastructure/
├── line/              # LINE API関連の実装
└── prisma/           # データベースアクセス
```

# DB
3層スキーマを採用


## 依存関係の方向
```md
Presentation Layer
        ↓
    Domain Layer  
        ↓
Infrastructure Layer
```
## 具体的な処理の流れ
```md
具体的な処理の流れ
LINE Webhook → presentation/controllers/lineWebhookController.ts
リクエスト検証 → presentation/validators/lineEventValidator.ts
イベント処理 → presentation/handlers/messageHandler.ts
ビジネスロジック → domain/services/userService.ts
データ永続化 → infrastructure/prisma/repositories/PrismaUserRepository.ts
```
