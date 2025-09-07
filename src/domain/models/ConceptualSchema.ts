// 概念スキーマ（運動のみの最小定義）

export type ExerciseType = "aerobicExercise" | "strengthTraining" | "stretching" | "other"

export interface ExerciseDomain {
    id: number
    name: string
    exerciseType: ExerciseType
    calorieConsumedPer1min: number
}

export interface ExerciseRecordDomain {
    id: string
    userId: string
    exerciseId: number
    durationMinutes: number
    caloriesBurned: number
    recordedAt: Date
}
