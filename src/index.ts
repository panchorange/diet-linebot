// 役割: Bun サーバのエントリポイント。/webhook を presentation 層に委譲
import { env } from "./config/env"
import { lineWebhookController } from "./presentation/controllers/lineWebhookController"
import { startExerciseWeeklyReportScheduler } from "./presentation/scheduler/weeklyReportScheduler"
import { exerciseWeeklyReportService } from "./presentation/wiring/serviceLocator"

const server = Bun.serve({
    port: env.server.port,
    async fetch(req) {
        const url = new URL(req.url)
        if (req.method === "POST" && url.pathname === "/webhook") {
            return lineWebhookController(req)
        }
        if (req.method === "GET" && url.pathname === "/reports/exercise/weekly") {
            const userId = url.searchParams.get("userId")
            if (!userId) {
                return new Response("Missing userId", { status: 400 })
            }
            try {
                const report = await exerciseWeeklyReportService.generateWeeklyReport(userId)
                return new Response(JSON.stringify(report), {
                    status: 200,
                    headers: { "content-type": "application/json" }
                })
            } catch (e) {
                console.error(e)
                return new Response("failed", { status: 500 })
            }
        }
        return new Response("surver is running")
    }
})

// デバッグ用: 毎分自動で全ユーザーの週次レポートをログ出力
startExerciseWeeklyReportScheduler(60_000)

console.log(`🚀 Server listening on http://localhost:${server.port}`)
