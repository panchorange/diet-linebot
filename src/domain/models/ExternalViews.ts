// 外部スキーマ（ユーザーに返す最小情報）

export interface ExerciseSavedView {
    exerciseName: string
    duration: number
    caloriesBurned: number
    advice: string
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

// 食事保存時に返信に使う外部ビュー
export interface MealSavedView {
    // 返信用の整形済みメッセージ（区分/合計/24hサマリ/スコア/アドバイスを含む）
    message: string
    // LLMからのアドバイス文言のみ
    advice: string
    // 将来的な利用に備えて最低限のメタ情報を併せて返す
    mealTypeLabel?: string | null // "朝食" | "昼食" | "夕食" | "間食" | null
    score?: number | null
}

// 体重保存時に返信に使う外部ビュー
export interface WeightSavedView {
    // 返信用の整形済みメッセージ
    weight: number
    bmi: number
    advice: string
}
