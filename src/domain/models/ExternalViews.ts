// 外部スキーマ（ユーザーに返す最小情報）

export interface ExerciseSavedView {
    exerciseName: string
    duration: number
    caloriesBurned: number
    message: string
}

export interface ExerciseWeeklyReportView {
    userId: string
    userName: string
    startDate: string
    endDate: string
    cntExercises: number // 週間で行った運動の数
    totalDuration: number
    totalCalories: number
    modeExercise: string // 最も多く行った運動
    message: string
}
