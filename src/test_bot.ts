import { Client, middleware, MiddlewareConfig, WebhookEvent, TextMessage } from "@line/bot-sdk";
import express, { Request, Response } from "express";


// 環境変数の型安全性を確保
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LINE_CHANNEL_ACCESS_TOKEN: string;
      LINE_CHANNEL_SECRET: string;
      PORT?: string;
    }
  }
}

// 1. LINEボットの設定
const config: MiddlewareConfig = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

// 2. LINEクライアントを作成
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