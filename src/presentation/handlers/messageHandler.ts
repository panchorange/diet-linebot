// 役割: LINE メッセージイベントのハンドリング（入力整形→ドメインサービス呼び出し→返信）
import type { TextEventMessage, WebhookEvent } from "@line/bot-sdk"
import { lineClient } from "../../config/lineClient"
import { buildHelloMessage, buildWeeklyReportMessages } from "../../infrastructure/line/lineMessageBuilder"
import {
    exerciseService,
    mealAdviceService,
    userService,
    weeklyReportService,
    weightAdviceService
} from "../../presentation/wiring/serviceLocator"

export async function messageHandler(event: WebhookEvent) {
    console.log("[MessageHandler] Starting message processing...")

    if (event.type !== "message") {
        console.log("[MessageHandler] Not a message event, skipping")
        return
    }
    // グループとユーザーの両方からのメッセージを処理
    let userId: string | undefined
    if (event.source.type === "user") {
        userId = event.source.userId
    } else if (event.source.type === "group") {
        userId = event.source.userId // グループ内のユーザーID
    }

    if (!userId) {
        console.log("[MessageHandler] No userId found, skipping")
        return
    }

    const lineUserId = userId
    const isText = event.message.type === "text"
    const isImage = event.message.type === "image"
    const userMessage = isText ? (event.message as TextEventMessage).text : ""
    console.log(
        `[MessageHandler] Processing message: "${userMessage}" from user: ${lineUserId} (source: ${event.source.type})`
    )

    const profile = await lineClient.getProfile(lineUserId).catch(() => null)
    const name = profile?.displayName ?? "unknown"
    console.log(`[MessageHandler] User profile: name=${name}`)

    const user = await userService.registerOrFetchByLineId(lineUserId, name)
    console.log(`[MessageHandler] User registered/fetched: id=${user.id}`)

    // 🆕 運動投稿の判定
    if (userMessage.startsWith("運動")) {
        console.log(`[MessageHandler] Exercise message detected: "${userMessage}"`)
        await handleExercisePost(event.replyToken, user.id, userMessage)
        return
    }

    // 🆕 体重投稿の判定
    if (userMessage.startsWith("体重")) {
        console.log(`[MessageHandler] Weight message detected: "${userMessage}"`)
        await handleWeightPost(event.replyToken, user.id, userMessage)
        return
    }

    // 🆕 食事投稿の判定（テキストが「食事」で始まる、または画像）
    if ((isText && userMessage.startsWith("食事")) || isImage) {
        console.log(`[MessageHandler] Meal message/image detected`)
        let imageBase64: string | undefined
        if (isImage) {
            try {
                const messageId = (event.message as { type: "image"; id: string }).id
                const stream = await lineClient.getMessageContent(messageId)
                const chunks: Buffer[] = []
                imageBase64 = await new Promise<string>((resolve, reject) => {
                    stream.on("data", (chunk: Buffer) => chunks.push(chunk))
                    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")))
                    stream.on("error", reject)
                })
            } catch (e) {
                console.error("[MessageHandler] Failed to download image content:", e)
            }
        }
        await handleMealPost(event.replyToken, user.id, userMessage, imageBase64)
        return
    }
    // 🆕 週次レポートの判定
    if (userMessage.startsWith("週次レポート")) {
        console.log(`[MessageHandler] Weekly report message detected`)
        await handleWeeklyReport(event.replyToken, user.id, userMessage)
        return
    }

    // いずれにも当てはまらない場合は、挨拶と使い方を載せたメッセージを返信
    console.log(`[MessageHandler] Default hello message for: ${user.name}`)
    const reply = buildHelloMessage(user.name)
    await lineClient.replyMessage(event.replyToken, reply)
    console.log(`[MessageHandler] Hello message sent`)
}
//  食事投稿処理
async function handleMealPost(replyToken: string, userId: string, message: string, imageBase64?: string) {
    try {
        console.log(`[Meal] Processing: ${message}`)
        const result = await mealAdviceService.recordMeal(userId, message, imageBase64)
        console.log(`[Meal] Service returned:`, result)

        // 返信はサービスが整形した message をそのまま使用
        await lineClient.replyMessage(replyToken, { type: "text", text: result.message })
        console.log(`[Meal] Reply sent successfully`)
    } catch (error) {
        console.error("[Meal] Error:", error)
        await lineClient.replyMessage(replyToken, {
            type: "text",
            text: "申し訳ございません。食事記録の保存に失敗しました。もう一度お試しください。"
        })
    }
}

//  運動投稿処理
async function handleExercisePost(replyToken: string, userId: string, message: string) {
    try {
        console.log(`[Exercise] Processing: ${message}`)

        // 運動サービスを呼び出し
        console.log(`[Exercise] Calling exerciseService.recordExercise with userId=${userId}`)
        const result = await exerciseService.recordExercise(userId, message)
        console.log(`[Exercise] Service returned:`, result)

        // 成功メッセージを返信（外部スキーマからのアドバイスを使用）
        console.log(`[Exercise] Sending reply: ${result.advice}`)
        await lineClient.replyMessage(replyToken, {
            type: "text",
            text: result.advice
        })
        console.log(`[Exercise] Reply sent successfully`)
    } catch (error) {
        console.error("[Exercise] Error:", error)

        await lineClient.replyMessage(replyToken, {
            type: "text",
            text: "申し訳ございません。運動記録の保存に失敗しました。もう一度お試しください。"
        })
    }
}

//  体重投稿処理
async function handleWeightPost(replyToken: string, userId: string, message: string) {
    try {
        console.log(`[Weight] Processing: ${message}`)
        const result = await weightAdviceService.recordWeight(userId, message)
        console.log(`[Weight] Service returned:`, result)
        await lineClient.replyMessage(replyToken, { type: "text", text: result.advice })
        console.log(`[Weight] Reply sent successfully`)
    } catch (error) {
        console.error("[Weight] Error:", error)
        await lineClient.replyMessage(replyToken, {
            type: "text",
            text: "申し訳ございません。体重記録の保存に失敗しました。もう一度お試しください。"
        })
    }
}

//  週次レポートの判定
async function handleWeeklyReport(replyToken: string, userId: string, message: string) {
    try {
        console.log(`[WeeklyReport] Processing: ${message}`)
        const result = await weeklyReportService.generateWeeklyReport(userId)
        console.log(`[WeeklyReport] Service returned:`, result)
        const messages = buildWeeklyReportMessages(result)
        await lineClient.replyMessage(replyToken, messages)
        console.log(`[WeeklyReport] Reply sent successfully`)
    } catch (error) {
        console.error("[WeeklyReport] Error:", error)
        await lineClient.replyMessage(replyToken, {
            type: "text",
            text: "申し訳ございません。週次レポートの生成に失敗しました。もう一度お試しください。"
        })
    }
}
