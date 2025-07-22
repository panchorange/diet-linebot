# システムアーキテクチャ

## 全体構成図

```
[LINE User] 
    ↓
[LINE Platform] 
    ↓ Webhook
[Load Balancer]
    ↓
[Web Application] (Node.js/Express)
    ↓
[Business Logic Layer]
    ↓
[Database Layer] (PostgreSQL)
```

## コンポーネント構成

### 1. フロントエンド
- **LINE アプリ**: ユーザーインターフェース
- **リッチメニュー**: 主要機能への導線
- **Flex Message**: データ表示用のカスタマイズ可能なメッセージ

### 2. アプリケーション層
- **Webhook Handler**: LINE からのイベント受信
- **Message Router**: メッセージタイプによる処理分岐
- **Business Logic**: 各機能の実装
- **Response Builder**: LINE への返信メッセージ構築

### 3. データ層
- **User Management**: ユーザー情報管理
- **Food Records**: 食事記録管理
- **Weight Records**: 体重記録管理
- **Exercise Records**: 運動記録管理
- **Goals**: 目標管理

## データベース設計

### Users テーブル
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    line_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    height DECIMAL(5,2),
    target_weight DECIMAL(5,2),
    gender VARCHAR(10),
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Food Records テーブル
```sql
CREATE TABLE food_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
    description TEXT,
    calories INTEGER,
    photo_url VARCHAR(500),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Weight Records テーブル
```sql
CREATE TABLE weight_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    weight DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(5,2),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Exercise Records テーブル
```sql
CREATE TABLE exercise_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    exercise_type VARCHAR(100) NOT NULL,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Goals テーブル
```sql
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    target_weight DECIMAL(5,2) NOT NULL,
    target_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, achieved, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API構成

### Webhook Endpoint
- `POST /webhook` - LINE Platform からのイベント受信

### 内部API構成
- **UserService**: ユーザー管理機能
- **FoodService**: 食事記録機能
- **WeightService**: 体重管理機能
- **ExerciseService**: 運動記録機能
- **GoalService**: 目標管理機能
- **ReportService**: レポート生成機能

## セキュリティ

### 認証・認可
- LINE Channel Secret による署名検証
- ユーザー識別は LINE User ID を使用
- データアクセスは所有者のみに制限

### データ保護
- 個人情報の暗号化保存
- HTTPS通信の強制
- ログの適切なマスキング

## 監視・ログ

### アプリケーション監視
- ヘルスチェックエンドポイント
- パフォーマンス監視
- エラー率監視

### ログ設計
```javascript
// ログレベル
- ERROR: システムエラー、例外
- WARN: 警告、非正常な状態
- INFO: 重要な処理の開始・完了
- DEBUG: デバッグ情報
```

## デプロイメント

### 環境構成
- **Development**: 開発環境
- **Staging**: テスト環境
- **Production**: 本番環境

### CI/CD パイプライン
1. コードプッシュ
2. テスト実行
3. ビルド
4. デプロイ
5. ヘルスチェック

## パフォーマンス最適化

### データベース
- 適切なインデックス設定
- クエリ最適化
- コネクションプーリング

### アプリケーション
- レスポンスキャッシュ
- 非同期処理の活用
- メモリ使用量の最適化

## 災害復旧

### バックアップ戦略
- データベースの定期バックアップ
- 自動復旧スクリプト
- 複数リージョンでのデータ保持

### 障害対応
- 自動フェイルオーバー
- 段階的復旧計画
- 緊急連絡体制