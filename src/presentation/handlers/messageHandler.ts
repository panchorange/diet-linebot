// 役割: LINE メッセージイベントのハンドリング（入力整形→ドメインサービス呼び出し→返信）
import type { WebhookEvent } from "@line/bot-sdk"
import { lineClient } from "../../config/lineClient"
import { buildHelloMessage } from "../../infrastructure/line/lineMessageBuilder"
import { exerciseService, userService } from "../../presentation/wiring/serviceLocator"

export async function messageHandler(event: WebhookEvent) {
    console.log("[MessageHandler] Starting message processing...")

    if (event.type !== "message" || event.message.type !== "text") {
        console.log("[MessageHandler] Not a text message, skipping")
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
    const userMessage = event.message.text
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

    // 既存のhelloメッセージ処理
    console.log(`[MessageHandler] Default hello message for: ${user.name}`)
    const reply = buildHelloMessage(user.name)
    await lineClient.replyMessage(event.replyToken, reply)
    console.log(`[MessageHandler] Hello message sent`)
}

//  運動投稿処理
async function handleExercisePost(replyToken: string, userId: string, message: string) {
    try {
        console.log(`[Exercise] Processing: ${message}`)

        // 運動サービスを呼び出し
        console.log(`[Exercise] Calling exerciseService.recordExercise with userId=${userId}`)
        const result = await exerciseService.recordExercise(userId, message)
        console.log(`[Exercise] Service returned:`, result)

        // 成功メッセージを返信（外部スキーマからのメッセージを使用）
        console.log(`[Exercise] Sending reply: ${result.message}`)
        await lineClient.replyMessage(replyToken, {
            type: "text",
            text: result.message
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
