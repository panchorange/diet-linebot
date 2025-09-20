import { v4 as uuidv4 } from "uuid"
import { aiClient } from "../../config/aiClient"
import { prisma } from "../../infrastructure/prisma/client"
import type { MealSavedView } from "../models/ExternalViews"
import { buildMealExtractionPrompt } from "./prompts/mealAdvice"

export class MealAdviceService {
    async recordMeal(_userId: string, text: string, imageBase64?: string | null): Promise<MealSavedView> {
        // 1) 食事マスタを全件取得し、LLMに選定させる
        const masters = await prisma.mealMaster.findMany()
        const mealsWithin24hours = await prisma.mealRecord.findMany({
            where: {
                userId: _userId,
                recordedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        })
        const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000)
        // 直近24時間サマリー
        const validMeals = mealsWithin24hours.filter((m) =>
            [m.calories, m.protein, m.fat, m.carbohydrate].some((v) => typeof v === "number")
        )
        const mealCount = new Set(validMeals.map((m) => m.userMealId)).size || 0
        const totals24h = validMeals.reduce(
            (acc, m) => {
                acc.calories += Number(m.calories || 0)
                acc.protein += Number(m.protein || 0)
                acc.fat += Number(m.fat || 0)
                acc.carbohydrate += Number(m.carbohydrate || 0)
                return acc
            },
            { calories: 0, protein: 0, fat: 0, carbohydrate: 0 }
        )
        const avgProtein = mealCount > 0 ? totals24h.protein / mealCount : 0
        const avgFat = mealCount > 0 ? totals24h.fat / mealCount : 0
        const avgCarbohydrate = mealCount > 0 ? totals24h.carbohydrate / mealCount : 0

        const prompt = buildMealExtractionPrompt(text, masters, imageBase64 ? "INLINE_IMAGE" : null, nowJst, {
            totalCalories: totals24h.calories,
            mealCount,
            avgProtein,
            avgFat,
            avgCarbohydrate
        })
        const model = "gemini-2.5-flash"
        const response = imageBase64
            ? await aiClient.models.generateContent({
                  model,
                  contents: [
                      {
                          role: "user",
                          parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }]
                      }
                  ]
              })
            : await aiClient.models.generateContent({ model, contents: prompt })

        type MinimalLLMResponse = { text?: string; output_text?: string }
        const resLike: MinimalLLMResponse = response as unknown as MinimalLLMResponse
        const raw = resLike.text ?? resLike.output_text ?? JSON.stringify(response)
        const jsonText = typeof raw === "string" ? raw : String(raw)

        let parsed: {
            isMeal?: boolean
            mealType?: "breakfast" | "lunch" | "dinner" | "snack" | null
            items?: Array<{ mealId?: number | null; mealName?: string | null; amountGrams?: number | null }>
            advice?: string
            score?: number
        }
        try {
            parsed = JSON.parse(jsonText)
        } catch {
            const candidate = jsonText.match(/\{[\s\S]*\}/)?.[0]
            if (!candidate) throw new Error("Gemini JSON parse failed (meal)")
            parsed = JSON.parse(candidate)
        }

        const advice = (parsed.advice ?? "").toString().trim()
        const mealType = parsed.mealType ?? null
        const isMeal = Boolean(parsed.isMeal)
        const items = Array.isArray(parsed.items) ? parsed.items : []

        const typeLabel =
            mealType === "breakfast"
                ? "朝食"
                : mealType === "lunch"
                  ? "昼食"
                  : mealType === "dinner"
                    ? "夕食"
                    : mealType === "snack"
                      ? "間食"
                      : "食事"
        // 栄養計算（マスタ × 量[g]）
        const idToMaster = new Map(masters.map((m) => [m.id, m]))
        const parsedScore = Number(parsed.score)
        type Totals = { calories: number; protein: number; fat: number; carbohydrate: number }
        const totals: Totals = { calories: 0, protein: 0, fat: 0, carbohydrate: 0 }
        const normalizedItems = items
            .map((it) => ({
                mealId: typeof it.mealId === "number" ? it.mealId : null,
                mealName: (it.mealName ?? "").toString().trim() || null,
                amountGrams: Number(it.amountGrams)
            }))
            .filter((it) => Number.isFinite(it.amountGrams))

        for (const it of normalizedItems) {
            const grams = Number(it.amountGrams)
            const master = it.mealId != null ? idToMaster.get(it.mealId) : undefined
            if (master) {
                totals.calories += (master.caloriePer100g * grams) / 100
                totals.protein += (master.proteinPer100g * grams) / 100
                totals.fat += (master.fatPer100g * grams) / 100
                totals.carbohydrate += (master.carbohydratePer100g * grams) / 100
            }
        }

        const lines: string[] = []
        if (mealType) lines.push(`区分: ${typeLabel}`)
        if (mealType) lines.push("")
        for (const it of normalizedItems) {
            const name = it.mealName || (it.mealId != null ? idToMaster.get(it.mealId)?.name : undefined) || "(不明)"
            lines.push(`🍽️ ${name} ${Math.round(Number(it.amountGrams))}g`)
        }
        if (normalizedItems.length > 0) {
            lines.push("合計:")
            lines.push(`エネルギー: ${Math.round(totals.calories)} kcal`)
            lines.push(`たんぱく質: ${Math.round(totals.protein)} g`)
            lines.push(`脂質: ${Math.round(totals.fat)} g`)
            lines.push(`炭水化物: ${Math.round(totals.carbohydrate)} g`)
        }

        const summary = lines.filter(Boolean).join("\n")

        const summary24h = [
            "📅 直近24時間のサマリ:",
            `合計: ${Math.round(totals24h.calories)} kcal / 食事回数 ${mealCount}`,
            `平均/食: たんぱく質 ${Math.round(avgProtein)} g | 脂質 ${Math.round(avgFat)} g | 炭水化物 ${Math.round(avgCarbohydrate)} g`
        ].join("\n")

        const scoreLine = Number.isFinite(parsedScore) ? `\n\n📊 スコア: ${Math.round(parsedScore)}/100` : ""
        const message = isMeal
            ? `✅ 食事投稿を解析しました\n${summary || "(詳細不明)"}\n\n${summary24h}${scoreLine}\n\n💡 ${advice || "必要に応じて量や品目を教えてください。"}`
            : `ℹ️ 食事の投稿ではない可能性があります。\n${advice || "食事の内容や量をもう少し具体的に教えてください。"}\n${summary24h}`

        // 2 ) DB保存（内部スキーマ）: 同一 userMealId で複数行
        if (isMeal && normalizedItems.length > 0) {
            const mealTypeEnum = mealType as "breakfast" | "lunch" | "dinner" | "snack" | null
            const userMealId = uuidv4()
            const rows = normalizedItems.map((it) => {
                const master = it.mealId != null ? idToMaster.get(it.mealId) : undefined
                const grams = Number(it.amountGrams)
                const cals = master ? (master.caloriePer100g * grams) / 100 : null
                const prot = master ? (master.proteinPer100g * grams) / 100 : null
                const fat = master ? (master.fatPer100g * grams) / 100 : null
                const carb = master ? (master.carbohydratePer100g * grams) / 100 : null
                return {
                    userMealId,
                    userId: _userId,
                    mealId: it.mealId ?? null,
                    mealType: mealTypeEnum || "snack",
                    amountGrams: Number.isFinite(grams) ? grams : null,
                    calories: cals != null ? cals : null,
                    protein: prot != null ? prot : null,
                    fat: fat != null ? fat : null,
                    carbohydrate: carb != null ? carb : null,
                    score: Number.isFinite(parsedScore) ? Math.max(0, Math.min(100, Math.round(parsedScore))) : null,
                    advice: advice || null,
                    recordedAt: nowJst
                }
            })
            await prisma.mealRecord.createMany({ data: rows })
        }

        return {
            message,
            advice,
            mealTypeLabel: mealType ? typeLabel : null,
            score: Number.isFinite(parsedScore) ? Math.round(parsedScore) : null
        }
    }
}

export const mealAdviceService = new MealAdviceService()
