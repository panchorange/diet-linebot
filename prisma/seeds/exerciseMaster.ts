// prisma/seeds/exerciseMaster.ts
import { ExerciseType, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type Row = { id: number; name: string; exerciseType: ExerciseType; calorieConsumedPer1min: number }

export async function seedExerciseMaster() {
    const rows: Row[] = [
        { id: 1, name: "デフォルト運動", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 8 },
        { id: 2, name: "ジャグリング", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 4 },
        { id: 3, name: "ダイビング", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 7 },
        { id: 4, name: "散歩", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 3 },
        { id: 5, name: "通勤", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 3 },
        { id: 6, name: "ランニング", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 10 },
        { id: 7, name: "サイクリング", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 8 },
        { id: 8, name: "水泳", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 9 },
        { id: 9, name: "縄跳び", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 12 },
        { id: 10, name: "ジャンピングジャック", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 8 },
        { id: 11, name: "階段昇降", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 9 },
        { id: 12, name: "ダンス", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 7 },
        { id: 13, name: "ハイキング", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 6 },
        { id: 14, name: "バドミントン", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 7 },
        { id: 15, name: "テニス", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 8 },
        { id: 16, name: "サッカー練習", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 9 },
        { id: 17, name: "バスケットボール", exerciseType: ExerciseType.aerobicExercise, calorieConsumedPer1min: 8 },
        { id: 18, name: "ヨガ", exerciseType: ExerciseType.stretching, calorieConsumedPer1min: 3 },
        { id: 19, name: "ピラティス", exerciseType: ExerciseType.stretching, calorieConsumedPer1min: 4 },
        { id: 20, name: "スクワット", exerciseType: ExerciseType.strengthTraining, calorieConsumedPer1min: 7 }
    ]
    const keepIds = rows.map((r) => r.id)

    await prisma.$transaction(async (tx) => {
        // 追加/更新（idempotent）
        for (const r of rows) {
            await tx.exerciseMaster.upsert({
                where: { id: r.id },
                update: {
                    name: r.name,
                    exerciseType: r.exerciseType,
                    calorieConsumedPer1min: r.calorieConsumedPer1min
                },
                create: r
            })
        }

        // 同期対象外のうち、参照されていないレコードのみ物理削除（find → deleteMany の二段階で安全に）
        const staleWithoutRefs = await tx.exerciseMaster.findMany({
            where: {
                id: { notIn: keepIds },
                exerciseRecords: { none: {} }
            },
            select: { id: true }
        })
        if (staleWithoutRefs.length > 0) {
            const ids = staleWithoutRefs.map((x) => x.id)
            const deleted = await tx.exerciseMaster.deleteMany({ where: { id: { in: ids } } })
            if (deleted.count > 0) {
                console.log(`[seedExerciseMaster] deleted ${deleted.count} stale masters`)
            }
        }

        // 参照があるため削除できないものがあればログ
        const stillReferenced = await tx.exerciseMaster.findMany({
            where: {
                id: { notIn: keepIds },
                exerciseRecords: { some: {} }
            },
            select: { id: true, name: true }
        })
        if (stillReferenced.length > 0) {
            console.warn(
                `[seedExerciseMaster] cannot delete referenced masters: ${stillReferenced.map((x) => `${x.id}:${x.name}`).join(", ")}`
            )
        }

        // SERIALシーケンスを現在の最大IDに合わせる（次のINSERTで+1から始まる）
        await tx.$executeRawUnsafe(
            `SELECT setval(pg_get_serial_sequence('"mst_exercises"','id'), (SELECT COALESCE(MAX(id),0) FROM "mst_exercises"))`
        )
    })
}
