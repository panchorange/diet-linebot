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

export type WeeklyReportView = {
    userName: string
    startDate: string
    endDate: string
    image?: ReportImage | null
    weightSummary: {
        weightChangeFromLastWeek: number
        weightChangeFromStart: number
        cntRecordsThisWeek: number
    }
    mealSummary: {
        totalCalories: number
        avgCalories: number
        cntRecordDaysThisWeek: number
        avgProtein: number
        avgFat: number
        avgCarbohydrate: number
    }
    exerciseSummary: {
        totalDuration: number
        totalCalories: number
        cntExercises: number
        cntRecordDaysThisWeek: number
        modeExercise: string
    }
    message: string // LLMからの分析結果
}

// レポート用の画像情報（LINEのImageMessageに対応）
export interface ReportImage {
    url: string
    previewUrl?: string | null
    alt?: string | null
}

// 食事保存時に返信に使う外部ビュー（単一インターフェースに集約）
export interface MealSavedView {
    // 返信用の整形済みメッセージ（区分/合計/24hサマリ/スコア/アドバイスを含む）
    message: string
    // LLMからのアドバイス文言のみ
    advice: string
    // 固定スキーマ（連携や将来のUIで再利用可能）
    isMeal: boolean
    mealType: "breakfast" | "lunch" | "dinner" | "snack" | null
    items: Array<{
        mealId: number | null
        name: string | null
        amountGrams: number
    }>
    totals: {
        calories: number
        protein: number
        fat: number
        carbohydrate: number
    }
    dailySummary: {
        totalCalories: number
        mealCount: number
        avgProtein: number
        avgFat: number
        avgCarbohydrate: number
    }
    // 最低限のメタ情報
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
