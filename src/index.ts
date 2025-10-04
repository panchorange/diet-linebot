// 役割: Bun サーバのエントリポイント。/webhook を presentation 層に委譲
import { env } from "./config/env"
import { lineWebhookController } from "./presentation/controllers/lineWebhookController"
import { startWeeklyReportCron } from "./presentation/scheduler/weeklyReportCron"

// import { startExerciseWeeklyReportScheduler } from "./presentation/scheduler/weeklyReportScheduler"

// import { exerciseWeeklyReportService } from "./presentation/wiring/serviceLocator"

const server = Bun.serve({
    port: env.server.port,
    async fetch(req) {
        const url = new URL(req.url)
        // 画像の外部ホスティング(imgBB)へ切替済みのため、/images配信は不要
        if (req.method === "POST" && url.pathname === "/webhook") {
            return lineWebhookController(req)
        }
        // 週次レポートは一旦無効化(TODO: 後で有効化)
        return new Response("surver is running")
    }
})

// デバッグ用: 毎分自動で全ユーザーの週次レポートをログ出力
// startExerciseWeeklyReportScheduler(60_000)

console.log(`🚀 Server listening on http://localhost:${server.port}`)

// 週次レポートのCRONを起動（JST: 月曜06:00、日曜20:00）
startWeeklyReportCron()
