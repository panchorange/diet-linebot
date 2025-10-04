import { aiClient } from "../../config/aiClient"
import { prisma } from "../../infrastructure/prisma/client"
import type { WeightSavedView } from "../models/ExternalViews"
import { buildWeightAdvicePrompt } from "./prompts/weightAdvice"

export class WeightAdviceService {
    async recordWeight(userId: string, text: string): Promise<WeightSavedView> {
        // 1) 履歴取得（直近30件程度）
        const historyRaw = await prisma.weightRecord.findMany({
            where: { userId },
            orderBy: { recordedAt: "desc" },
            take: 30,
            select: { recordedAt: true, weight: true }
        })
        const history = historyRaw.map((h) => ({ recordedAt: h.recordedAt.toISOString(), weight: h.weight }))

        // 2) LLM解析
        const prompt = buildWeightAdvicePrompt(text, history)
        const model = "gemini-2.5-flash"
        const res = await aiClient.models.generateContent({ model, contents: prompt })
        type MinimalLLMResponse = { text?: string; output_text?: string }
        const resLike: MinimalLLMResponse = res as unknown as MinimalLLMResponse
        const raw = resLike.text ?? resLike.output_text ?? JSON.stringify(res)
        const jsonText = typeof raw === "string" ? raw : String(raw)
        let parsed: { parsedWeightKg?: number | null; isAnomalous?: boolean; advice?: string }
        try {
            parsed = JSON.parse(jsonText)
        } catch {
            const candidate = jsonText.match(/\{[\s\S]*\}/)?.[0]
            if (!candidate) throw new Error("Gemini JSON parse failed")
            parsed = JSON.parse(candidate)
        }

        const weight = parsed.parsedWeightKg
        const isAnomalous = Boolean(parsed.isAnomalous)
        const advice = typeof parsed.advice === "string" ? parsed.advice.trim() : ""

        // 3) 異常なら保存せずリプライ
        if (isAnomalous) {
            return {
                weight: weight || 0,
                bmi: 0,
                advice: `⚠️ 体重の変化が急すぎる可能性があります。\n${advice || "記録をもう一度ご確認ください。"}`
            }
        }

        // 4) 正常ならBMI計算とINSERT（kgが取れている場合のみ）
        //    - 身長は users.height[cm] を取得してBMIを計算
        //    - 身長が未設定の場合はBMIは計算しない
        let bmiValue: number | null = null
        let bmiLine = "BMIは計算できません（身長未設定）"
        if (Number.isFinite(weight)) {
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { height: true } })
            if (user?.height && Number.isFinite(user.height)) {
                const heightMeters = Number(user.height) / 100
                if (heightMeters > 0) {
                    bmiValue = Number((Number(weight) / (heightMeters * heightMeters)).toFixed(1))
                    bmiLine = `BMI: ${bmiValue}`
                }
            }
        }

        // INSERT（体重が取得できた場合のみ）
        if (Number.isFinite(weight)) {
            await prisma.weightRecord.create({
                data: {
                    userId,
                    weight: Number(weight),
                    bmi: bmiValue,
                    recordedAt: new Date()
                }
            })
        }

        const adviceAsMessage = `✅ 体重を記録しました。\n${
            Number.isFinite(weight) ? `体重: ${Number(weight)}kg\n${bmiLine}` : "体重の数値が取得できませんでした"
        }\n${advice || "引き続き無理のない範囲で継続しましょう。"}`

        return {
            weight: Number.isFinite(weight) ? Number(weight) : 0,
            bmi: bmiValue || 0,
            advice: adviceAsMessage
        }
    }
}

export const weightAdviceService = new WeightAdviceService()
