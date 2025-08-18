# diet-linebot
ダイエット継続を目的としたLINEbot

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

### 4. 開発サーバーの起動

#### 4.1 ローカルサーバーを起動
```bash
bun run src/test_bot.ts
```

#### 4.2 ngrokでトンネリング（開発時のみ）
```bash
ngrok http 3000
```

#### 4.3 LINE Bot の Webhook URL を設定
1. ngrok の出力から `Forwarding` のURLをコピー
   ```
   Forwarding  https://89db444694f2.ngrok-free.app -> http://localhost:3000
   ```
2. LINE Developer Console の「Messaging API」タブで Webhook URL を設定：
   ```
   https://89db444694f2.ngrok-free.app/webhook
   ```
3. 「Use webhook」を有効にする

### 5. 動作確認
1. LINE Developer Console で友だち追加用のQRコードを取得
2. LINEアプリでBotを友だち追加
3. 食事に関するメッセージや画像を送信して動作確認

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