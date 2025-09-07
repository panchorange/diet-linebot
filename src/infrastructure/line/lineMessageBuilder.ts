// 役割: LINE返信メッセージの生成（テンプレート/定型文の集約）
import type { TextMessage } from "@line/bot-sdk"

export function buildHelloMessage(name: string): TextMessage {
    return { type: "text", text: `こんにちは、${name}さん！` }
}
