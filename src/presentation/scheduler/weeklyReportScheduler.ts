import { lineClient } from "../../config/lineClient"
import { exerciseWeeklyReportService } from "../../domain/services/exerciseWeeklyReportService"
import { prisma } from "../../infrastructure/prisma/client"

export class WeeklyReportScheduler {
    /**
     * 週次運動レポートを生成するスケジューラー
     */
    async scheduleWeeklyReport() {
        const users = await prisma.user.findMany({
            select: { id: true, displayName: true, lineUserId: true }
        })
        for (const user of users) {
            const report = await exerciseWeeklyReportService.generateWeeklyReport(user.id)
            console.log(`[ExerciseWeeklyReport] ${report.message}`)
            if (user.lineUserId) {
                await lineClient.pushMessage(user.lineUserId, {
                    type: "text",
                    text: report.message
                })
            }
        }
    }
}

// 毎分などで実行するための最小タイマー（再入防止つき）
const _scheduler = new WeeklyReportScheduler()
let _timer: ReturnType<typeof setInterval> | null = null
let _running = false

export function startExerciseWeeklyReportScheduler(intervalMs = 60_000) {
    if (_timer) return
    _timer = setInterval(_runOnceSafe, intervalMs)
}

async function _runOnceSafe() {
    if (_running) return
    _running = true
    try {
        await _scheduler.scheduleWeeklyReport()
    } catch (e) {
        console.error("[ExerciseWeeklyReportScheduler] Error:", e)
    } finally {
        _running = false
    }
}
