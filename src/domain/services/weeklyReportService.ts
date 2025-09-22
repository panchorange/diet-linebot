import { createCanvas } from "canvas"
import { Chart, registerables } from "chart.js"
import { aiClient } from "../../config/aiClient"
import { prisma } from "../../infrastructure/prisma/client"
import type { WeeklyReportView } from "../models/ExternalViews"

Chart.register(...registerables)

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

    private renderWeightChart(points: Array<{ recordedAt: Date; weight: number; bmi: number | null }>): Buffer | null {
        if (!points || points.length < 2) return null
        const width = 900
        const height = 500
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext("2d")
        // 背景を白で塗る（JPEGで真っ黒に見える問題を回避）
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)

        const labels = points.map((p) => p.recordedAt.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }))
        const w = points.map((p) => p.weight)
        const b = points.map((p) => (p.bmi == null ? null : p.bmi))
        // eslint-disable-next-line no-new
        new Chart(ctx as unknown as any, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "体重(kg)",
                        data: w,
                        borderColor: "#3b82f6", // 明るいブルー
                        backgroundColor: "rgba(59,130,246,0.18)",
                        pointBackgroundColor: "#3b82f6",
                        pointBorderColor: "#ffffff",
                        pointRadius: 6,
                        borderWidth: 4,
                        tension: 0.25,
                        yAxisID: "y",
                        fill: true
                    },
                    {
                        label: "BMI",
                        data: b as unknown as number[],
                        borderColor: "#f59e0b", // ポップなオレンジ
                        backgroundColor: "rgba(245,158,11,0.12)",
                        pointBackgroundColor: "#f59e0b",
                        pointBorderColor: "#ffffff",
                        pointRadius: 3,
                        borderWidth: 3,
                        borderDash: [6, 3],
                        tension: 0.25,
                        yAxisID: "y1",
                        fill: true
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
                        text: "1週間の体重 / BMI",
                        color: "#111827",
                        font: { size: 28, weight: "bold" }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "#374151", font: { size: 16 } },
                        grid: { color: "#e5e7eb" }
                    },
                    y: {
                        position: "left",
                        title: { display: true, text: "kg", color: "#374151", font: { size: 16 } },
                        ticks: { color: "#374151", font: { size: 16 } },
                        grid: { color: "#e5e7eb" }
                    },
                    y1: {
                        position: "right",
                        grid: { drawOnChartArea: false, color: "#e5e7eb" },
                        title: { display: true, text: "BMI", color: "#374151", font: { size: 16 } },
                        ticks: { color: "#374151", font: { size: 16 } }
                    }
                }
            }
        })
        // JPEGに変換してBufferで返す
        const jpg = canvas.toBuffer("image/jpeg", { quality: 0.85 } as any)
        return jpg
    }

    private async uploadToImgBB(imageJpeg: Buffer): Promise<{ url: string; previewUrl: string } | null> {
        const apiKey = env.imageHost.imgbbApiKey
        if (!apiKey) return null
        const b64 = imageJpeg.toString("base64")
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

        const jpeg = this.renderWeightChart(
            weights.map((w) => ({ recordedAt: w.recordedAt, weight: w.weight, bmi: (w as any).bmi ?? null }))
        )
        const imagePair = jpeg ? await this.uploadToImgBB(jpeg) : null

        return {
            userName,
            startDate: start.toISOString(),
            endDate: new Date(end.getTime() - 1).toISOString(),
            image: imagePair ? { url: imagePair.url, previewUrl: imagePair.previewUrl, alt: "1週間の体重/BMI" } : null,
            weightSummary,
            mealSummary,
            exerciseSummary,
            message
        }
    }
}

export const weeklyReportService = new WeeklyReportService()
