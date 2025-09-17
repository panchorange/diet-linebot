import { v4 as uuidv4 } from "uuid"
import { aiClient } from "../../config/aiClient"
import { prisma } from "../../infrastructure/prisma/client"
import { buildMealExtractionPrompt } from "./prompts/mealAdvice"
export interface MealSavedView {
    message: string
}

export class MealAdviceService {
    async recordMeal(_userId: string, text: string, imageUrl?: string | null): Promise<MealSavedView> {
        // 1) 食事マスタを全件取得し、LLMに選定させる
        const masters = await prisma.mealMaster.findMany()
        const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000)
        const prompt = buildMealExtractionPrompt(text, masters, imageUrl, nowJst)
        const model = "gemini-2.5-flash"
        const response = await aiClient.models.generateContent({ model, contents: prompt })

        type MinimalLLMResponse = { text?: string; output_text?: string }
        const resLike: MinimalLLMResponse = response as unknown as MinimalLLMResponse
        const raw = resLike.text ?? resLike.output_text ?? JSON.stringify(response)
        const jsonText = typeof raw === "string" ? raw : String(raw)

        let parsed: {
            isMeal?: boolean
            mealId?: number | null
            mealName?: string | null
            amountGrams?: number | null
            calories?: number | null
            protein?: number | null
            fat?: number | null
            carbohydrate?: number | null
            mealType?: "breakfast" | "lunch" | "dinner" | "snack" | null
            advice?: string
        }
        try {
            parsed = JSON.parse(jsonText)
        } catch {
            const candidate = jsonText.match(/\{[\s\S]*\}/)?.[0]
            if (!candidate) throw new Error("Gemini JSON parse failed (meal)")
            parsed = JSON.parse(candidate)
        }

        const advice = (parsed.advice ?? "").toString().trim()
        const mealName = (parsed.mealName ?? "").toString().trim()
        const calories = Number(parsed.calories)
        const protein = Number(parsed.protein)
        const fat = Number(parsed.fat)
        const carbohydrate = Number(parsed.carbohydrate)
        const mealType = parsed.mealType ?? null
        const isMeal = Boolean(parsed.isMeal)
        const amountGrams = Number(parsed.amountGrams)

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
        const mealId = parsed.mealId

        const nutritionInfo = [
            Number.isFinite(calories) ? `カロリー: ${Math.round(calories)}kcal` : "",
            Number.isFinite(protein) ? `タンパク質: ${Math.round(protein)}g` : "",
            Number.isFinite(fat) ? `脂質: ${Math.round(fat)}g` : "",
            Number.isFinite(carbohydrate) ? `炭水化物: ${Math.round(carbohydrate)}g` : ""
        ]
            .filter(Boolean)
            .join(" | ")

        const summary = [
            mealName ? `🍽️ ${mealName}` : "",
            mealType ? `区分: ${typeLabel}` : "",
            nutritionInfo ? `栄養: ${nutritionInfo}` : ""
        ]
            .filter(Boolean)
            .join("\n")

        const message = isMeal
            ? `✅ 食事投稿を解析しました\n${summary || "(詳細不明)"}\n💡 ${advice || "必要に応じて量や品目を教えてください。"}`
            : `ℹ️ 食事の投稿ではない可能性があります。\n${advice || "食事の内容や量をもう少し具体的に教えてください。"}`

        // 2 ) DB保存（内部スキーマ）
        if (isMeal) {
            // mealTypeをPrismaのenumに変換
            const mealTypeEnum = mealType as "breakfast" | "lunch" | "dinner" | "snack" | null

            await prisma.mealRecord.create({
                data: {
                    userMealId: uuidv4(),
                    userId: _userId, // _userIdを使用（引数名と一致）
                    mealId: parsed.mealId, // マスタから選択されたID
                    mealType: mealTypeEnum || "snack", // nullの場合はデフォルト値]
                    amountGrams: Number.isFinite(amountGrams) ? amountGrams : null,
                    calories: Number.isFinite(calories) ? calories : null,
                    protein: Number.isFinite(protein) ? protein : null,
                    fat: Number.isFinite(fat) ? fat : null,
                    carbohydrate: Number.isFinite(carbohydrate) ? carbohydrate : null,
                    advice: advice || null,
                    recordedAt: nowJst
                }
            })
        }

        return { message }
    }
}

export const mealAdviceService = new MealAdviceService()
