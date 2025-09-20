import { aiClient } from "../../config/aiClient"
import { prisma } from "../../infrastructure/prisma/client"
import type { ExerciseSavedView } from "../models/ExternalViews"
import { buildExerciseExtractionPrompt } from "./prompts/exerciseAdvice"

export class ExerciseAdviceService {
    async recordExercise(userId: string, text: string): Promise<ExerciseSavedView> {
        // 1) 運動マスタを全件取得し、LLMに選定させる
        const masters = await prisma.exerciseMaster.findMany({
            select: { id: true, name: true, calorieConsumedPer1min: true }
        })
        const prompt = buildExerciseExtractionPrompt(text, masters)
        const model = "gemini-2.5-flash"
        const res = await aiClient.models.generateContent({ model, contents: prompt })
        type MinimalLLMResponse = { text?: string; output_text?: string }
        const resLike: MinimalLLMResponse = res as unknown as MinimalLLMResponse
        const raw = resLike.text ?? resLike.output_text ?? JSON.stringify(res)
        const jsonText = typeof raw === "string" ? raw : String(raw)
        let parsed: { exerciseName?: string; durationMinutes?: number; caloriesBurned?: number; exerciseId?: number }
        try {
            parsed = JSON.parse(jsonText)
        } catch {
            const candidate = jsonText.match(/\{[\s\S]*\}/)?.[0]
            if (!candidate) throw new Error("Gemini JSON parse failed")
            parsed = JSON.parse(candidate)
        }

        const name = typeof parsed.exerciseName === "string" ? parsed.exerciseName.trim() : ""
        const durationRaw = parsed.durationMinutes
        const exerciseIdRaw = parsed.exerciseId
        if (!name) throw new Error("LLM output missing exerciseName")
        if (!Number.isFinite(durationRaw)) throw new Error("LLM output missing durationMinutes")
        if (!Number.isFinite(exerciseIdRaw)) throw new Error("LLM output missing exerciseId")

        const duration = Math.max(1, Math.round(Number(durationRaw)))

        // 2) DB保存（内部スキーマ）: LLMが選んだIDで確定
        const requestedId = Number(exerciseIdRaw)
        const exerciseMaster = await prisma.exerciseMaster.findUnique({ where: { id: requestedId } })
        if (!exerciseMaster) throw new Error(`exerciseMaster(id=${requestedId}) not found. Seed mismatch.`)
        const caloriesToStore = Math.round(exerciseMaster.calorieConsumedPer1min * duration)

        await prisma.exerciseRecord.create({
            data: {
                userId,
                exerciseId: exerciseMaster.id,
                durationMinutes: duration,
                caloriesBurned: caloriesToStore,
                recordedAt: new Date()
            }
        })

        // 3) 解析結果の返却（保存値と整合）
        return {
            exerciseName: name,
            duration,
            caloriesBurned: caloriesToStore,
            advice: `✅ 運動を記録しました\n🏃‍♂️ ${name}\n⏰ ${duration}分\n🔥 ${caloriesToStore}kcal`
        }
    }
}

// 既存呼び出し互換のため、インスタンス名は従来どおり `exerciseService`
export const exerciseService = new ExerciseAdviceService()
