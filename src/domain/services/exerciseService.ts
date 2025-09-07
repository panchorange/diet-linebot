import { prisma } from "../../infrastructure/prisma/client"

export interface ExerciseSavedView {
    exerciseName: string
    duration: number
    caloriesBurned: number
    message: string
}

export class ExerciseService {
    async recordExercise(userId: string, text: string): Promise<ExerciseSavedView> {
        console.log(`[ExerciseService] Processing: userId=${userId}, text="${text}"`)

        // 1. 簡易分析（LLMの代わり）
        const name = text.includes("ジョギング")
            ? "ジョギング"
            : text.includes("筋トレ")
              ? "筋力トレーニング"
              : text.includes("ストレッチ")
                ? "ストレッチ"
                : "ウォーキング"

        const durationMatch = text.match(/(\d+)分/)
        const duration = durationMatch ? parseInt(durationMatch[1]!) : 30
        const calories = duration * 8 // 1分8kcalで計算

        // 2. DB保存（内部スキーマ）
        // まず運動マスタを取得または作成
        const exerciseMaster = await prisma.exerciseMaster.upsert({
            where: { id: 1 },
            update: {},
            create: {
                id: 1,
                name: "デフォルト運動",
                exerciseType: "aerobicExercise",
                calorieConsumedPer1min: 8
            }
        })

        // 運動記録を保存
        await prisma.exerciseRecord.create({
            data: {
                userId,
                exerciseId: exerciseMaster.id,
                durationMinutes: duration,
                caloriesBurned: calories,
                recordedAt: new Date()
            }
        })

        // 3. 返信データ（外部スキーマ）
        return {
            exerciseName: name,
            duration,
            caloriesBurned: calories,
            message: `✅ 運動を記録しました\n🏃‍♂️ ${name}\n⏰ ${duration}分\n🔥 ${calories}kcal`
        }
    }
}

export const exerciseService = new ExerciseService()
