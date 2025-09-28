// 役割: LINE 署名の検証（リクエスト改ざん防止）
import crypto from "crypto"
import { lineConfig } from "../../config/env"

export function verifyLineSignature(bodyRaw: Uint8Array | ArrayBuffer, signature?: string): boolean {
    if (process.env.DISABLE_LINE_SIGNATURE === "1") return true
    if (!signature) return false
    const hmac = crypto.createHmac("sha256", lineConfig.channelSecret)
    // 生バイトでHMACを計算（文字列化による差異を避ける）
    const data = bodyRaw instanceof ArrayBuffer ? new Uint8Array(bodyRaw) : bodyRaw
    hmac.update(data)
    const expected = hmac.digest("base64")
    if (process.env.LOG_LINE_SIGNATURE === "1") {
        // 署名の先頭数文字のみ出力（漏洩防止）
        const s = signature.slice(0, 8)
        const e = expected.slice(0, 8)
        console.log(`[Webhook][SigDebug] got=${s}... expected=${e}...`)
    }
    return signature === expected
}
