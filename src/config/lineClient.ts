// 役割: LINE SDK クライアントの生成（設定は env.ts 経由）
import { Client } from "@line/bot-sdk"
import { lineConfig } from "./env"

export const lineClient = new Client(lineConfig)
