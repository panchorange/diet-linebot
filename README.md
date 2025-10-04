# diet-linebot

AI を活用したダイエット継続支援 LINE Bot です。食事の記録・分析から運動管理、体重トラッキングまで、あなたの健康的な生活をサポートします。

## 主な機能

### 📸 食事記録・分析
- **画像認識**: 食事の写真を送るだけで、メニュー名と栄養素（カロリー・タンパク質・脂質・炭水化物）を自動推定
- **テキスト入力**: 「カレーライス 200g」のようなメッセージから栄養情報を解析
- **AI アドバイス**: Gemini 2.0 Flash による食事内容へのコメントとスコアリング

### 🏃 運動記録・管理
- 運動の種類と時間を記録し、消費カロリーを自動計算
- 運動マスタから適切な運動タイプ（有酸素・筋トレ・ストレッチ）を選択

### ⚖️ 体重トラッキング
- 日々の体重を記録し、BMI を自動計算
- 推移をグラフで可視化

### 📊 週次レポート
- 毎週日曜 20:00 に自動配信
- 1 週間の体重・食事・運動データをグラフとともに振り返り
- AI による総合評価とアドバイス

### 🎯 プロフィール登録
- 身長・年齢・性別を登録して、より精度の高いアドバイスを取得

## 使い方

1. LINE で Bot を友だち追加
2. 好きなメッセージを送信して会話を開始
3. 食事の写真やテキスト、運動・体重の記録を送ると、AI が分析してアドバイスを返信
4. 毎週日曜の夜に週次レポートが自動で届きます

## ローカルで動かす

```bash
# 1. 依存関係をインストール
bun install

# 2. データベースを起動（Docker Compose）
docker compose up -d

# 3. データベースをセットアップ
bun run db:migrate:local
bun run db:seed:local

# 4. 開発サーバーを起動
bun run dev
```

詳しいセットアップ手順（環境変数、LINE/Gemini API の取得、ngrok 設定など）は **[`docs/README.md`](./docs/README.md)** を参照してください。

## 技術スタック

- **Runtime**: Bun
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **AI**: Google Gemini 2.0 Flash
- **LINE SDK**: @line/bot-sdk
- **Infrastructure**: Cloud Run (Service + Jobs), Cloud SQL, Cloud Scheduler

## 開発者向けドキュメント

設計資料、データベーススキーマ、デプロイ手順、機能一覧などは以下を参照:

- **[`docs/README.md`](./docs/README.md)**: 設計ドキュメントの索引、データベース操作、GCP デプロイ手順
- **[`docs/feature_list/feature_list.md`](./docs/feature_list/feature_list.md)**: 実装済み・予定機能の一覧
- **[`docs/structure/project-structure.md`](./docs/structure/project-structure.md)**: ディレクトリ構成とレイヤ責務
