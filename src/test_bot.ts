import type { MiddlewareConfig, WebhookEvent, TextMessage, ImageMessage } from "@line/bot-sdk";
import { Client, middleware } from "@line/bot-sdk";
import express from "express";
import type { Request, Response } from "express";
import {GoogleGenAI} from '@google/genai';
import fs from 'fs/promises';
import path from 'path';


// 環境変数の型安全性を確保
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CHANNEL_ACCESS_TOKEN: string;
      CHANNEL_SECRET: string;
      GEMINI_API_KEY: string;
      PORT?: string;
      LINE_USER_ID?: string;  // プッシュメッセージ送信先のユーザーID
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

// geminiの設定
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

// デバッグ：configオブジェクトの中身を確認
console.log("Config object: ", config);
console.log("Config channelAccessToken: ", config.channelAccessToken);
console.log("Config channelSecret: ", config.channelSecret);

// 2. LINEクライアントを作成（同じconfigオブジェクトを使用）
const client = new Client(config);

// ユーザーIDを保存する配列（実際の本番環境ではデータベースを使用）
let registeredUserIds: string[] = [];

// 統一されたプロンプトを生成する関数
function createAnalysisPrompt(userInput: string, isImage: boolean = false): string {
  const inputDescription = isImage 
    ? "ユーザーが送信した食事の画像を分析して"
    : `ユーザーが送信した食事メッセージ「${userInput}」に対して`;
  
  const menuField = isImage 
    ? `"menu": "推定されるメニュー名(string型)",\n        `
    : '';

  return `
    あなたはダイエットアドバイスを行うLINE-botです。
    ${inputDescription}、以下の形式でアドバイスをしてください。
    
    ## ルール
    * 0~100点で食事を評価してください
      * 判断基準: PFCバランスとカロリーの量の二点を重視してください。
      * protein: 25g, fat: 20g, carbohydrate: 50g, calorie: 700kcalに近いほど、スコアが高くなります。
        * スコアは優しめにつけて大丈夫。上を100点満点に正規化して、ユーザーの値と理想が75%以上あれば、100点くらいのイメージ
    * Line botのため、返信は100文字以内で行ってください。
    ${isImage ? '* 画像から食事の内容を推定して、メニュー名も含めてください。' : ''}
    
    ## 出力形式 
    * JSON.parseでパースできるようにしてください。
    * Markdownのコードブロックは使用しないでください。
    {
      ${menuField}"score": "0~100の整数(number型)",
      "protein": "タンパク質のグラム数(0.0~999.9の小数点以下1桁までのnumber型)",
      "carbohydrate": "炭水化物のグラム数(0.0~999.9の小数点以下1桁までのnumber型)",
      "fat": "脂質のグラム数(0.0~999.9の小数点以下1桁までのnumber型)",
      "calorie": "カロリー: 推定値(kcal)(number型)",
      "reasoning": "判断理由(ハム太郎🐹になりきったうざ可愛い構文。のだ！へけ！なのだ！や絵文字をよく使う、100文字以内で. string型)"
    }
  `;
}

// 画像を取得する関数
async function getImageContent(messageId: string): Promise<Buffer> {
  try {
    const stream = await client.getMessageContent(messageId);
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Error getting image content:', error);
    throw error;
  }
}

// 画像を分析する関数
async function analyzeImage(imageBuffer: Buffer): Promise<any> {
  try {
    // 統一されたプロンプトを使用
    const prompt = createAnalysisPrompt("", true);

    // 画像をBase64エンコード
    const base64Image = imageBuffer.toString('base64');

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    const responseText = response.text;
    console.log("🤖 AI Response: ", responseText);
    
    if (!responseText) {
      throw new Error('AI response is empty');
    }
    
    // Markdownのコードブロックを除去
    const cleanedText = responseText
      .replace(/```json\s*\n?/g, '')
      .replace(/```\s*\n?/g, '')
      .trim();
    
    return cleanedText;
  } catch (error) {
    console.error('❌ Error analyzing image:', error);
    throw error;
  }
}

// プッシュメッセージを送信する関数
async function sendScheduledMessage(message: string) {
  console.log(`📤 Sending scheduled message: ${message}`);
  console.log(`👥 Registered users count: ${registeredUserIds.length}`);
  console.log(`👤 Registered user IDs: ${registeredUserIds.join(', ')}`);
  
  if (registeredUserIds.length === 0) {
    console.log('⚠️ No registered users found. Users need to send a message first to register.');
    return;
  }
  
  // 登録されている全ユーザーにメッセージを送信
  for (const userId of registeredUserIds) {
    try {
      await client.pushMessage(userId, {
        type: 'text',
        text: message
      });
      console.log(`✅ Message sent to user: ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to send message to user ${userId}:`, error);
    }
  }
}

// 4. イベントを処理する関数
async function handleEvent(event: WebhookEvent): Promise<any> {
  // ユーザーIDを記録（フォローイベントまたはメッセージイベント時）
  if (event.source.type === 'user' && event.source.userId) {
    if (!registeredUserIds.includes(event.source.userId)) {
      registeredUserIds.push(event.source.userId);
      console.log(`📝 Registered new user: ${event.source.userId}`);
    }
  }

  // 通知登録コマンドの処理
  if (event.type === 'message' && event.message.type === 'text') {
    const userMessage = event.message.text;
    
    if (userMessage === '通知ON' || userMessage === '通知オン' || userMessage === '通知開始') {
      const replyMessage: TextMessage = {
        type: 'text',
        text: '🔔 定期通知を開始しました！\n毎日以下の時間にメッセージをお送りします：\n・朝6:30 - おはようの挨拶\n・昼12:00 - 健康的な食事の提案\n・夜18:00 - 一日お疲れさまの挨拶'
      };
      return client.replyMessage(event.replyToken, replyMessage);
    }
    
    if (userMessage === '通知OFF' || userMessage === '通知オフ' || userMessage === '通知停止') {
      // ユーザーIDを削除
      registeredUserIds = registeredUserIds.filter(id => id !== event.source.userId);
      const replyMessage: TextMessage = {
        type: 'text',
        text: '🔕 定期通知を停止しました。'
      };
      return client.replyMessage(event.replyToken, replyMessage);
    }
  }

  // リアクションイベントの処理（スタンプメッセージ）
  if (event.type === 'message' && event.message.type === 'sticker') {
    console.log('👍 Received sticker reaction');
    
    try {
      const reactionMessage: TextMessage = {
        type: 'text',
        text: 'ご意見ありがとうございます！😊\n今後もより良いアドバイスができるよう頑張ります💪',
      };

      return client.replyMessage(event.replyToken, reactionMessage);
    } catch (error) {
      console.error('❌ Error processing sticker reaction:', error);
      return Promise.resolve(null);
    }
  }

  // テキストメッセージの処理
  if (event.type === 'message' && event.message.type === 'text') {
    // ユーザーが送信したメッセージを取得
    const userMessage: string = event.message.text;
    console.log(`📨 Received text: ${userMessage}`);

    // 食事関連のキーワードをチェック
    const foodKeywords = ['ご飯', 'おやつ', '食事', '食べ', 'ランチ', 'ディナー', '朝食', '昼食', '夕食', 'メシ', '飯', 'ごはん', 'おかず', 'スイーツ', 'デザート'];
    const containsFoodKeyword = foodKeywords.some(keyword => userMessage.includes(keyword));

    // 食事に関する内容でない場合は処理を終了
    if (!containsFoodKeyword) {
      console.log('🚫 No food-related keywords found in message');
      return Promise.resolve(null);
    }

    console.log('✅ Food-related message detected, proceeding with analysis');

    // 統一されたプロンプトを使用
    const prompt = createAnalysisPrompt(userMessage, false);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });
    
    let responseText: string = response.text!;
    
    // Markdownのコードブロックを除去
    responseText = responseText
      .replace(/```json\s*\n?/g, '')
      .replace(/```\s*\n?/g, '')
      .trim();

    // JSON文字列をパースしてオブジェクトに変換
    let responseJson;
    try {
      responseJson = JSON.parse(responseText);
    } catch (error) {
      console.error('❌ Failed to parse JSON response:', error);
      // Find the first { and last } to extract just the JSON object
      const match = responseText.match(/\{.*\}/s);
      if (match) {
        try {
          responseJson = JSON.parse(match[0]);
        } catch (e) {
          console.error('❌ Failed to parse extracted JSON:', e);
          responseJson = {
            score: 0,
            reasoning: 'JSONの解析に失敗しました'
          };
        }
      } else {
        responseJson = {
          score: 0,
          reasoning: 'JSONの解析に失敗しました'
        };
      }
    }

    const replyMessage_str: string = `食事スコア、${responseJson.score}/100点🤔。
💪 タンパク質: ${responseJson.protein} % (理想15%)
🧈 脂質: ${responseJson.fat} % (理想25%)
🍚 炭水化物: ${responseJson.carbohydrate} % (理想60%)
🔥 カロリー: ${responseJson.calorie} kcal
${responseJson.reasoning}`;

    // 返信するメッセージを作成
    const replyMessage: TextMessage = {
      type: 'text',
      text: replyMessage_str,
    };

    // メッセージを返信
    return client.replyMessage(event.replyToken, replyMessage);
  }
  
  // 画像メッセージの処理
  else if (event.type === 'message' && event.message.type === 'image') {
    console.log('📸 Received image message');
    
    try {
      // 画像を取得
      const imageBuffer = await getImageContent(event.message.id);
      console.log('✅ Image downloaded successfully');

      // 画像を分析
      const responseText = await analyzeImage(imageBuffer);

      // JSON文字列をパースしてオブジェクトに変換
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch (error) {
        console.error('❌ Failed to parse JSON response:', error);
        // Find the first { and last } to extract just the JSON object
        const match = responseText.match(/\{.*\}/s);
        if (match) {
          try {
            responseJson = JSON.parse(match[0]);
          } catch (e) {
            console.error('❌ Failed to parse extracted JSON:', e);
            responseJson = {
              menu: '不明な料理',
              score: 0,
              protein: 0,
              carbohydrate: 0,
              fat: 0,
              calorie: 0,
              reasoning: '画像の解析に失敗しました😅'
            };
          }
        } else {
          responseJson = {
            menu: '不明な料理',
            score: 0,
            protein: 0,
            carbohydrate: 0,
            fat: 0,
            calorie: 0,
            reasoning: '画像の解析に失敗しました😅'
          };
        }
      }

      const replyMessage_str: string = `📸 画像から分析させていただきました🌸
🍽️ メニュー: ${responseJson.menu}
食事スコア: ${responseJson.score}/100だぞ✨
💪 タンパク質: ${responseJson.protein}g (目安25g)
🧈 脂質: ${responseJson.fat}g (目安20g)  
🍚 炭水化物: ${responseJson.carbohydrate}g (目安50g)
🔥 カロリー: ${responseJson.calorie} kcal
${responseJson.reasoning}`;

      // 返信するメッセージを作成
      const replyMessage: TextMessage = {
        type: 'text',
        text: replyMessage_str,
      };

      // メッセージを返信
      return client.replyMessage(event.replyToken, replyMessage);
    } catch (error) {
      console.error('❌ Error processing image:', error);
      
      // エラーメッセージを返信
      const errorMessage: TextMessage = {
        type: 'text',
        text: '画像の処理中にエラーが発生しました😢\nもう一度お試しください。',
      };
      
      return client.replyMessage(event.replyToken, errorMessage);
    }
  }

  // その他のメッセージタイプは無視
  return Promise.resolve(null);
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
    res.send('🍎 Diet LINE Bot is running with scheduled messages!');
});



// 5. サーバーを起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`📱 Webhook URL: http://localhost:${port}/webhook`);
  console.log(`📸 Image processing enabled!`);
  console.log(`⏰ Scheduled messages enabled!`);
  console.log(`📅 Scheduled times (JST):`);
  console.log(`   - 6:30 AM: Morning greeting`);
  console.log(`   - 12:00 PM: Lunch reminder`);
  console.log(`   - 6:00 PM: Evening greeting`);
});