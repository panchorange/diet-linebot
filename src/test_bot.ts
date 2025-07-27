import type { MiddlewareConfig, WebhookEvent, TextMessage } from "@line/bot-sdk";
import { Client, middleware } from "@line/bot-sdk";
import express from "express";
import type { Request, Response } from "express";

// 環境変数の型安全性を確保
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CHANNEL_ACCESS_TOKEN: string;
      CHANNEL_SECRET: string;
      PORT?: string;
    }
  }
}

// 環境変数のデバッグ
console.log("CHANNEL_ACCESS_TOKEN: ", process.env.CHANNEL_ACCESS_TOKEN);
console.log("CHANNEL_SECRET: ", process.env.CHANNEL_SECRET);

// 1. LINEボットの設定（一つのconfigオブジェクトで統一）
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
    channelSecret: process.env.CHANNEL_SECRET!,
};

// デバッグ：configオブジェクトの中身を確認
console.log("Config object: ", config);
console.log("Config channelAccessToken: ", config.channelAccessToken);
console.log("Config channelSecret: ", config.channelSecret);

// 2. LINEクライアントを作成（同じconfigオブジェクトを使用）
const client = new Client(config);


// 4. イベントを処理する関数
async function handleEvent(event: WebhookEvent): Promise<any> {
  // メッセージイベント以外、またはテキストメッセージ以外は無視
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // ユーザーが送信したメッセージを取得
  const userMessage: string = event.message.text;
  console.log(`📨 Received: ${userMessage}`);

  // 返信するメッセージを作成
  const replyMessage: TextMessage = {
    type: 'text',
    text: `"${userMessage}" ですね！！ダイエット頑張りましょう💪`,
  };

  // メッセージを返信
  return client.replyMessage(event.replyToken, replyMessage);
}

// 3. Express アプリの設定
const app = express();

// Webhookエンドポイント
app.post('/webhook', middleware(config), async (req: Request, res: Response) => {
    const events: WebhookEvent[] = req.body.events;
    
    const results = await Promise.all(
        events.map(async (event) => {
            try {
                await handleEvent(event);
            } catch (error) {
                console.error('❌ Error handling event:', error);
            }
        })
    );
    
    res.status(200).json({ status: 'success' });
});

// ヘルスチェック用エンドポイント
app.get('/', (req: Request, res: Response) => {
    res.send('🍎 Diet LINE Bot is running!');
});

// 5. サーバーを起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`📱 Webhook URL: http://localhost:${port}/webhook`);
});