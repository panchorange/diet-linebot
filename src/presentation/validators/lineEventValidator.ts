// 役割: LINE 署名の検証（リクエスト改ざん防止）
import crypto from "crypto"
import { lineConfig } from "../../config/env"

export function verifyLineSignature(bodyRaw: string, signature?: string): boolean {
    if (!signature) return false
    const hmac = crypto.createHmac("sha256", lineConfig.channelSecret)
    hmac.update(bodyRaw)
    const expected = hmac.digest("base64")
    return signature === expected
}
