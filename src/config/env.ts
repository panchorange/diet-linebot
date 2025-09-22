// 役割: 環境変数の読み込みと必須値の検証を行う
function requireEnv(key: string): string {
    const v = process.env[key]
    if (!v) throw new Error(`Missing required environment variable: ${key}`)
    return v
}

export const env = {
    line: {
        channelAccessToken: requireEnv("LINE_CHANNEL_ACCESS_TOKEN"),
        channelSecret: requireEnv("LINE_CHANNEL_SECRET")
    },
    gemini: {
        apiKey: requireEnv("GEMINI_API_KEY")
    },
    imageHost: {
        imgbbApiKey: process.env.IMGBB_API_KEY ?? null
    },
    server: {
        port: Number(process.env.PORT ?? 3000)
    }
}

export const lineConfig = {
    channelAccessToken: env.line.channelAccessToken,
    channelSecret: env.line.channelSecret
}
