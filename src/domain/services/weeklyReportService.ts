import { createCanvas } from "canvas"
import { Chart, registerables } from "chart.js"
import { aiClient } from "../../config/aiClient"
import { prisma } from "../../infrastructure/prisma/client"
import type { WeeklyReportView } from "../models/ExternalViews"

const whiteBackgroundPlugin = {
    id: "whiteBackground",
    beforeDraw: (chart: Chart) => {
        const { ctx, width, height } = chart
        ctx.save()
        ctx.globalCompositeOperation = "destination-over"
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
        ctx.restore()
    }
}

Chart.register(...registerables, whiteBackgroundPlugin)

// グローバルな背景色をデフォルトで白に設定
Chart.defaults.backgroundColor = "#ffffff"
Chart.defaults.color = "#374151"

import { env } from "../../config/env"
import { buildWeeklyReportPrompt } from "./prompts/weeklyReport"

export class WeeklyReportService {
    private getRangeFromBase(baseTime = new Date()): { start: Date; end: Date } {
        const end = new Date(baseTime)
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { start, end }
    }

    private async fetchUserName(userId: string): Promise<string> {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } })
        return user?.displayName ?? "unknown"
    }

    private async fetchWeeklyData(userId: string, start: Date, end: Date) {
        const where = { userId, recordedAt: { gte: start, lt: end } } as const
        const [weights, meals, exercises] = await Promise.all([
            prisma.weightRecord.findMany({ where, orderBy: { recordedAt: "asc" } }),
            prisma.mealRecord.findMany({ where, orderBy: { recordedAt: "asc" } }),
            prisma.exerciseRecord.findMany({ where, orderBy: { recordedAt: "asc" } })
        ])
        return { weights, meals, exercises }
    }

    private async summarizeWeight(userId: string, start: Date, end: Date, weights: Array<{ weight: number }>) {
        const thisStartWeight = weights[0]?.weight ?? null
        const thisEndWeight = weights[weights.length - 1]?.weight ?? null
        const prev = await prisma.weightRecord.findFirst({
            where: { userId, recordedAt: { lt: start } },
            orderBy: { recordedAt: "desc" }
        })
        const lastWeekWeight = prev?.weight ?? thisStartWeight ?? thisEndWeight ?? 0
        return {
            weightChangeFromLastWeek: thisEndWeight != null ? thisEndWeight - lastWeekWeight : 0,
            weightChangeFromStart:
                thisStartWeight != null && thisEndWeight != null ? thisEndWeight - thisStartWeight : 0,
            cntRecordsThisWeek: weights.length
        }
    }

    private async summarizeMeals(
        meals: Array<{
            calories: number | null
            protein: number | null
            fat: number | null
            carbohydrate: number | null
        }>
    ) {
        const count = meals.length || 1
        const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
        const totalCalories = sum(meals.map((m) => Number(m.calories || 0)))
        const avgCalories = Math.round(totalCalories / count)
        const avgProtein = Math.round(sum(meals.map((m) => Number(m.protein || 0))) / count)
        const avgFat = Math.round(sum(meals.map((m) => Number(m.fat || 0))) / count)
        const avgCarbohydrate = Math.round(sum(meals.map((m) => Number(m.carbohydrate || 0))) / count)
        return { totalCalories, avgCalories, cntRecordDaysThisWeek: meals.length, avgProtein, avgFat, avgCarbohydrate }
    }

    private async summarizeExercises(
        exercises: Array<{ durationMinutes: number; caloriesBurned: number; exerciseId: number | null }>
    ) {
        const totalDuration = exercises.reduce((a, e) => a + (e.durationMinutes || 0), 0)
        const totalCalories = exercises.reduce((a, e) => a + (e.caloriesBurned || 0), 0)
        const cntExercises = exercises.length
        const counts = new Map<number, number>()

        for (const e of exercises) {
            if (typeof e.exerciseId === "number") {
                counts.set(e.exerciseId, (counts.get(e.exerciseId) || 0) + 1)
            }
        }

        let modeExercise = ""
        if (counts.size > 0) {
            const topId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
            const ex = await prisma.exerciseMaster.findUnique({ where: { id: topId }, select: { name: true } })
            modeExercise = ex?.name ?? ""
        }

        return { totalDuration, totalCalories, cntExercises, cntRecordDaysThisWeek: cntExercises, modeExercise }
    }

    private formatDateKey(date: Date): string {
        const y = date.getFullYear()
        const m = `${date.getMonth() + 1}`.padStart(2, "0")
        const d = `${date.getDate()}`.padStart(2, "0")
        return `${y}-${m}-${d}`
    }

    private buildWeeklyChartPoints(
        start: Date,
        end: Date,
        weights: Array<{ recordedAt: Date; weight: number | null }>,
        meals: Array<{ recordedAt: Date; calories: number | null }>
    ): Array<{ dateISO: string; weight: number | null; totalCalories: number | null }> {
        const weightMap = new Map<string, { weight: number | null; timestamp: number }>()
        for (const w of weights) {
            const key = this.formatDateKey(w.recordedAt)
            const existing = weightMap.get(key)
            const timestamp = w.recordedAt.getTime()
            if (!existing || timestamp > existing.timestamp) {
                weightMap.set(key, { weight: w.weight, timestamp })
            }
        }

        const calorieMap = new Map<string, { total: number; count: number }>()
        for (const meal of meals) {
            if (meal.calories == null) continue
            const key = this.formatDateKey(meal.recordedAt)
            const entry = calorieMap.get(key) ?? { total: 0, count: 0 }
            entry.total += Number(meal.calories)
            entry.count += 1
            calorieMap.set(key, entry)
        }

        const points: Array<{ dateISO: string; weight: number | null; totalCalories: number | null }> = []
        for (
            let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            current < end;
            current.setDate(current.getDate() + 1)
        ) {
            const key = this.formatDateKey(current)
            const dateISO = new Date(
                Date.UTC(current.getFullYear(), current.getMonth(), current.getDate())
            ).toISOString()
            const weightEntry = weightMap.get(key)
            const calorieEntry = calorieMap.get(key)
            const totalCalories = calorieEntry ? Math.round(calorieEntry.total) : null
            points.push({
                dateISO,
                weight: weightEntry?.weight ?? null,
                totalCalories
            })
        }

        const hasWeight = points.some((p) => p.weight != null)
        const hasCalories = points.some((p) => p.totalCalories != null)
        if (!hasWeight && !hasCalories) return []
        return points
    }

    private renderWeightChart(
        points: Array<{ dateISO: string; weight: number | null; totalCalories: number | null }>
    ): Buffer | null {
        if (!points || points.length < 2) return null
        const width = 900
        const height = 500
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext("2d")
        // 背景を白で塗る（JPEGで真っ黒に見える問題を回避）
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)

        const labels = points.map((p) =>
            new Date(p.dateISO).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
        )
        const weightData: Array<number | null> = points.map((p) => (p.weight == null ? null : Number(p.weight)))
        const totalCalorieData: Array<number | null> = points.map((p) =>
            p.totalCalories == null ? null : Math.round(Number(p.totalCalories))
        )
        const hasWeightData = weightData.some((v) => v != null)
        const hasCalorieData = totalCalorieData.some((v) => v != null)
        if (!hasWeightData && !hasCalorieData) return null
        // eslint-disable-next-line no-new
        new Chart(ctx as unknown as any, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "体重(kg)",
                        data: weightData,
                        type: "line",
                        order: 1,
                        yAxisID: "y",
                        borderColor: "#1d4ed8",
                        backgroundColor: "rgba(29, 78, 216, 0.18)",
                        pointBackgroundColor: "#1d4ed8",
                        pointBorderColor: "#ffffff",
                        pointRadius: 5,
                        borderWidth: 4,
                        tension: 0.25,
                        fill: false
                    },
                    {
                        label: "総摂取カロリー(kcal)",
                        data: totalCalorieData,
                        type: "bar",
                        order: 2,
                        yAxisID: "yCalories",
                        backgroundColor: "rgba(242, 142, 43, 0.55)",
                        borderColor: "rgba(242, 142, 43, 0.9)",
                        borderWidth: 1,
                        borderRadius: 4,
                        maxBarThickness: 40
                    }
                ]
            },
            options: {
                responsive: false,
                backgroundColor: "#ffffff",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: "#1f2937", boxWidth: 18, font: { size: 18 } }
                    },
                    title: {
                        display: true,
                        text: "1週間の体重 / 総摂取カロリー",
                        color: "#111827",
                        font: { size: 28, weight: "bold" }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "#374151", font: { size: 16 } },
                        grid: { display: false },
                        border: { display: false }
                    },
                    y: {
                        position: "left",
                        title: { display: true, text: "kg", color: "#374151", font: { size: 16 } },
                        ticks: { color: "#374151", font: { size: 16 } },
                        grid: { display: false },
                        border: { display: false }
                    },
                    yCalories: {
                        position: "right",
                        grid: { display: false },
                        border: { display: false },
                        title: { display: true, text: "総摂取カロリー(kcal)", color: "#f28e2b", font: { size: 16 } },
                        ticks: { color: "#f28e2b", font: { size: 16 } }
                    }
                }
            }
        })
        return canvas.toBuffer("image/png")
    }

    private async uploadToImgBB(imageBuffer: Buffer): Promise<{ url: string; previewUrl: string } | null> {
        const apiKey = env.imageHost.imgbbApiKey
        if (!apiKey) return null
        const b64 = imageBuffer.toString("base64")
        const body = new URLSearchParams({ image: b64, expiration: String(60 * 30) }) // 30分
        const url = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body
        })
        if (!res.ok) return null
        const json = (await res.json()) as { data?: { display_url?: string; thumb?: { url?: string } } }
        const display = json?.data?.display_url
        const preview = json?.data?.thumb?.url ?? display
        if (!display) return null
        return { url: display, previewUrl: preview ?? display }
    }

    async generateWeeklyReport(userId: string, baseTime = new Date()): Promise<WeeklyReportView> {
        const { start, end } = this.getRangeFromBase(baseTime)
        const userName = await this.fetchUserName(userId)
        const { weights, meals, exercises } = await this.fetchWeeklyData(userId, start, end)
        const [weightSummary, mealSummary, exerciseSummary] = await Promise.all([
            this.summarizeWeight(userId, start, end, weights),
            this.summarizeMeals(meals),
            this.summarizeExercises(exercises)
        ])

        const prompt = buildWeeklyReportPrompt({
            userName,
            startDate: start.toISOString(),
            endDate: new Date(end.getTime() - 1).toISOString(),
            weightSummary,
            mealSummary,
            exerciseSummary
        })
        const model = "gemini-2.5-flash"
        const res = await aiClient.models.generateContent({ model, contents: prompt })

        console.log("[WeeklyReport] LLM raw response:", JSON.stringify(res, null, 2))

        type MinimalLLMResponse = { text?: string; output_text?: string }
        const resLike: MinimalLLMResponse = res as unknown as MinimalLLMResponse
        let message = (resLike.text ?? resLike.output_text ?? "").toString()

        // Gemini応答の構造を確認
        if (!message && res && typeof res === "object") {
            const response = res as any
            if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
                message = response.candidates[0].content.parts[0].text
            } else if (response.response?.text) {
                message = response.response.text
            }
        }

        console.log("[WeeklyReport] Extracted message:", message)

        const chartPoints = this.buildWeeklyChartPoints(start, end, weights, meals)
        const chartBuffer = this.renderWeightChart(chartPoints)
        const imagePair = chartBuffer ? await this.uploadToImgBB(chartBuffer) : null

        return {
            userName,
            startDate: start.toISOString(),
            endDate: new Date(end.getTime() - 1).toISOString(),
            image: imagePair
                ? { url: imagePair.url, previewUrl: imagePair.previewUrl, alt: "1週間の体重/総摂取カロリー" }
                : null,
            weightSummary,
            mealSummary,
            exerciseSummary,
            message
        }
    }
}

export const weeklyReportService = new WeeklyReportService()
