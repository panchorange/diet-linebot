import type { ImageMessage, TextMessage } from "@line/bot-sdk"
import cron from "node-cron"
import { lineClient } from "../../config/lineClient"
import { buildWeeklyReportMessages } from "../../infrastructure/line/lineMessageBuilder"
import { prisma } from "../../infrastructure/prisma/client"
import { weeklyReportService } from "../../presentation/wiring/serviceLocator"

async function runWeeklyReportForAllUsers(trigger: string) {
    console.log(`[WeeklyReportCron] Triggered by ${trigger}`)
    const users = await prisma.user.findMany({ select: { id: true, displayName: true, lineUserId: true } })

    for (const user of users) {
        if (!user.lineUserId) continue
        try {
            const result = await weeklyReportService.generateWeeklyReport(user.id)
            const messages: Array<TextMessage | ImageMessage> = buildWeeklyReportMessages(result)
            await lineClient.pushMessage(user.lineUserId, messages)
            console.log(`[WeeklyReportCron] Sent to ${user.displayName} (${user.id})`)
        } catch (e) {
            console.error(`[WeeklyReportCron] Failed for user ${user.id}:`, e)
        }
    }
}

// 毎週月曜06:00と日曜20:00に実行。週次レポートのCRON
export function startWeeklyReportCron() {
    // 月曜 06:00 JST
    cron.schedule("0 6 * * 1", () => runWeeklyReportForAllUsers("Monday-06:00"), {
        timezone: "Asia/Tokyo"
    })

    // 日曜 20:00 JST
    cron.schedule("0 20 * * 0", () => runWeeklyReportForAllUsers("Sunday-20:00"), {
        timezone: "Asia/Tokyo"
    })

    console.log("[WeeklyReportCron] Schedules registered (JST: Mon 06:00, Sun 20:00)")
}
