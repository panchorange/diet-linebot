# diet-linebot
ダイエット継続を目的としたLINEbot

## このREADMEの目的
このREADMEは「アプリを動かす/統合テストを行うための最短手順」を提供します。設計や拡張の指針など開発者向け詳細は `docs/README.md` を参照してください（役割が異なります）。

## 環境構築手順

### 1. 前提条件
- [Bun](https://bun.sh/) がインストールされていること
- [ngrok](https://ngrok.com/) がインストールされていること（開発時）
- LINE Developer アカウント
- Google AI Studio アカウント

### 2. プロジェクトのセットアップ

#### 2.1 リポジトリのクローン
```bash
git clone https://github.com/panchorange/diet-linebot
cd diet-linebot
```

#### 2.2 依存関係のインストール
```bash
bun install
```

#### 2.3 環境変数の設定
プロジェクトルートに `.env` ファイルを作成し、以下の環境変数を設定してください：

```bash
# LINE Bot の設定
# LINE Developersコンソールから取得
CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
CHANNEL_SECRET=your_channel_secret_here

# Google Gemini AI の設定  
# Google AI Studioから取得
GEMINI_API_KEY=your_gemini_api_key_here

# サーバーポート（オプション、デフォルト: 3000）
PORT=3000

# プッシュメッセージ送信先のユーザーID（オプション）
LINE_USER_ID=your_line_user_id_here
```

bunが認識してるか確認。
* PORT変数を確認したい場合
```bash
bun --print "Bun.env.PORT"
```



### 3. 外部サービスの設定

#### 3.1 LINE Developer Console の設定
1. [LINE Developers](https://developers.line.biz/) にアクセス
2. 新しいプロバイダーとチャンネルを作成
3. 「Messaging API」タブから以下を取得：
   - `Channel access token` → `CHANNEL_ACCESS_TOKEN`
   - `Channel secret` → `CHANNEL_SECRET`

#### 3.2 Google AI Studio の設定
1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. 新しいAPIキーを作成
3. APIキーを `GEMINI_API_KEY` に設定



### 4. データベースの起動

#### 4.1 PostgreSQLコンテナを起動
```bash
docker-compose up -d
```

#### 4.2 データベースの停止
```bash
docker-compose down
```

#### 4.3 docker execでのデータベース接続
```bash
docker exec -it linebot-db psql -U admin -d linebot-db
```

#### 4.4 DBeaver でのデータベース接続
1. DBeaverを起動し、新しい接続を作成
2. 接続設定：
   - **データベース種類**: PostgreSQL
   - **ホスト**: localhost
   - **ポート**: 5432
   - **データベース名**: linebot-db
   - **ユーザー名**: admin
   - **パスワード**: hoge
3. 「接続をテスト」で接続確認後、「完了」をクリック


### 5. 開発サーバーの起動

#### 5.1 ローカルサーバーを起動
```bash
bun --env-file=.env.local run src/index.ts
```
localhost:3000でサーバーが起動する。

#### 5.2 ngrokでトンネリング（開発時のみ）
```bash
ngrok http 3000
```

#### 5.3 LINE Bot の Webhook URL を設定
1. ngrok の出力から `Forwarding` のURLをコピー
   ```
   Forwarding  https://89db444694f2.ngrok-free.app -> http://localhost:3000
   ```
2. LINE Developer Console の「Messaging API」タブで Webhook URL を設定：
   ```
   https://89db444694f2.ngrok-free.app/webhook
   ```
3. 「Use webhook」を有効にする

### 6. 動作確認
1. LINE Developer Console で友だち追加用のQRコードを取得
2. LINEアプリでBotを友だち追加
3. 食事に関するメッセージや画像を送信して動作確認

### 7.リンター%フォーマッター(Biome)
https://biomejs.dev/ja/guides/getting-started/


1. インストール
```bash
bun add --dev --exact @biomejs/biome
```

2. 設定ファイル biome.jsonの初期化（存在しない場合に実行）
```bash
bunx --bun biome init
```

3. リンターとフォーマッターを同時に適用
```bash
bunx --bun biome check --write <files>
```


## 機能

- **テキスト分析**: 食事に関するテキストメッセージを分析してPFCバランスとカロリーを評価
- **画像分析**: 食事の画像を解析してメニュー名とPFCバランスを推定
- **通知機能**: 「通知ON」でプッシュメッセージの受信を開始
- **ハム太郎風のコメント**: かわいいキャラクターによる食事アドバイス

## 使用技術

- **Runtime**: Bun
- **Language**: TypeScript
- **Framework**: Express.js
- **LINE SDK**: @line/bot-sdk
- **AI**: Google Gemini 2.0 Flash
- **Linter&Formatter**: Biome


## prisma関連

スキーマの更新
* スキーマの更新は、prisma/migrationsの作成と、対応するdbへの反映を意味する
* .env.localにdatabase_urlを定義した状態で以下を実行すると、ローカルのpsqlのスキーマ更新がされる
```bash
bun run dotenv -e .env.local -- prisma migrate dev --name
[更新内容を記載]
```

* 特定のバージョンまでロールバックしたい場合
   * 20250822135145_update_test_prisma_add_comment_nullable_name まで戻したいとき
```bash
bun run dotenv -e .env.local -- prisma migrate resolve --rolled-back 20250822135145_update_test_prisma_add_comment_nullable_name
```

* マイグレーション履歴の確認
```bash
bun run dotenv -e .env.local -- prisma migrate status
```


* prisma studioの起動: データの確認
```bash
bun run dotenv -e .env.local -- prisma studio &
```

* ER図の生成
前提条件. prisma/schema.prismaで"prisma-erd-generator"の設定をしておく
```bash
bun prisma generate
```

* mmdからsvg生成
docs/architecture.mmdからsvgを生成する場合
```bash
./node_modules/.bin/mmdc -i docs/system_overview.md -o docs/system_overview.md -b transparent -t neutral
```

## 関連READMEの役割
- `README.md`（本ファイル）: 動作確認・統合テストをしたい人向けの最短ガイド
- `docs/README.md`: 機能追加や保守運用を行う開発者向け。設計書の索引、関係性、実装入力のガイド