import { prisma } from "../../infrastructure/prisma/client"
import type { ExerciseWeeklyReportView } from "../models/ExternalViews"
/**
 * 週次運動レポートを生成するサービス
 */
export class ExerciseWeeklyReportService {
    private getWeekRange(base = new Date()): { start: Date; end: Date } {
        /**
         * 週次運動レポートを生成するための日付範囲を取得する
         * @param base - 基準日
         * @returns { start: Date, end: Date } - 週次運動レポートを生成するための日付範囲
         */
        const d = new Date(base)
        d.setHours(0, 0, 0, 0)
        // 月曜は週の始まり（Mon=0 になるよう補正）
        const day = d.getDay() // Sun=0 .. Sat=6
        const daysSinceMonday = (day + 6) % 7
        const start = new Date(d)
        start.setDate(d.getDate() - daysSinceMonday)
        const end = new Date(start)
        end.setDate(start.getDate() + 7)
        return { start, end }
    }

    /**
     * 週次運動レポートを生成する
     * @param userId - ユーザーID
     * @returns { ExerciseWeeklyReportView } - 週次運動レポート
     */
    async generateWeeklyReport(userId: string): Promise<ExerciseWeeklyReportView> {
        const { start, end } = this.getWeekRange()
        const where = {
            userId,
            recordedAt: { gte: start, lt: end }
        } as const

        // 1) ユーザー名
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { displayName: true }
        })
        const userName = user?.displayName ?? "unknown"

        // 2) 合計（時間・カロリー）、運動回数
        const agg = await prisma.exerciseRecord.aggregate({
            where,
            _sum: {
                durationMinutes: true,
                caloriesBurned: true
            },
            _count: { _all: true }
        })
        const totalDuration = agg._sum.durationMinutes ?? 0
        const totalCalories = agg._sum.caloriesBurned ?? 0
        const cntExercises = agg._count._all ?? 0

        // 3) mode(exerciseId) を求める
        const grouped = await prisma.exerciseRecord.groupBy({
            by: ["exerciseId"],
            where,
            _count: { _all: true }
        })
        let modeExerciseId: number | null = null
        if (grouped.length > 0) {
            grouped.sort((a, b) => b._count._all - a._count._all)
            modeExerciseId = grouped[0]?.exerciseId ?? null
        }

        // 4) 運動名（日本語）を取得
        let modeExercise = ""
        if (modeExerciseId !== null) {
            const ex = await prisma.exerciseMaster.findUnique({
                where: { id: modeExerciseId },
                select: { name: true }
            })
            modeExercise = ex?.name ?? ""
        }

        const roundedCalories = Math.round(totalCalories)
        const message =
            `🌟${userName}さんの今週の運動レポート🌟\n` +
            `🏃‍♀️ 合計 ${totalDuration}分 運動！\n` +
            `🔥 消費カロリー: 約${roundedCalories}kcal\n` +
            `🏅 一番多くやった運動: 「${modeExercise || "なし"}」\n` +
            `すごい！この調子で来週もがんばろう💪✨`

        return {
            userId,
            userName,
            startDate: start.toISOString(),
            endDate: new Date(end.getTime() - 1).toISOString(),
            cntExercises,
            totalDuration,
            totalCalories,
            modeExercise,
            message
        }
    }
}

export const exerciseWeeklyReportService = new ExerciseWeeklyReportService()
