// 役割: LINE Webhook のエンドポイント実装（署名検証→イベント分岐→各ハンドラ呼び出し）
import type { WebhookEvent } from "@line/bot-sdk"
import { messageHandler } from "../handlers/messageHandler"
import { verifyLineSignature } from "../validators/lineEventValidator"

export async function lineWebhookController(req: Request): Promise<Response> {
    console.log("[Webhook] Received webhook request")

    const signature = req.headers.get("x-line-signature") ?? undefined // 署名検証
    const bodyBuffer = await req.arrayBuffer() // 生バイトを取得

    if (!verifyLineSignature(bodyBuffer, signature)) {
        console.log("[Webhook] Signature verification failed")
        return new Response("invalid signature", { status: 403 }) // 署名検証失敗
    }

    const body = JSON.parse(new TextDecoder().decode(new Uint8Array(bodyBuffer))) // 署名検証後にJSONへパース
    const events: WebhookEvent[] = body.events ?? []
    console.log(`[Webhook] Processing ${events.length} events`)

    // 受信イベントの概要ログ（テキスト内容も表示）
    events.forEach((e: any) => {
        console.log(
            "[Webhook] type=%s msgType=%s text=%s source=%s",
            e?.type,
            e?.message?.type,
            e?.message?.text,
            e?.source?.type
        )
    })

    // 重複していたPromise.allを1つに修正
    await Promise.all(
        events.map(async (e) => {
            if (e.type === "message") {
                console.log(`[Webhook] Calling messageHandler for event type: ${e.type}`)
                return messageHandler(e)
            }
        })
    )

    console.log("[Webhook] All events processed, returning 200")
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
