// 役割: LINE返信メッセージの生成（テンプレート/定型文の集約）
import type { ImageMessage, TextMessage } from "@line/bot-sdk"
import type { WeeklyReportView } from "../../domain/models/ExternalViews"

export function buildHelloMessage(name: string): TextMessage {
    const lines = [
        `こんにちは、${name}さん！habitoriです🕊️✨`,
        "いつでも気軽に記録して、あなたの頑張りを可視化するお手伝いをします💪",
        "",
        "🎯 使い方ガイド",
        "⚖️ 体重 → 例: 体重 62.3",
        "🍽️ 食事 → 例: 食事 昼食 サラダとチキン（📸写真だけ送ってもOK👍）",
        "🏃 運動 → 例: 運動 ランニング 30分",
        "🧾 プロフィール(bmiの計算などに必要です🙏) → 例: プロフィール 身長 170 / プロフィール 性別 女性",
        "📅 週次レポート → 例: 週次レポート",
        "",
        "記録するとアドバイスや週次レポートが届きます📬",
        "一緒に楽しく続けていきましょうね😊"
    ]

    return { type: "text", text: lines.join("\n") }
}

export function buildWeeklyReportMessages(result: WeeklyReportView): Array<TextMessage | ImageMessage> {
    const messages: Array<TextMessage | ImageMessage> = []
    if (result.image?.url) {
        messages.push({
            type: "image",
            originalContentUrl: result.image.url,
            previewImageUrl: result.image.previewUrl ?? result.image.url
        })
    }

    const summary = [
        `📊 ${result.userName}さんの週次レポート`,
        `📅 期間: ${new Date(result.startDate).toLocaleDateString()} - ${new Date(result.endDate).toLocaleDateString()}`,
        "",
        "⚖️ 体重サマリ:",
        `📈 前週からの変化: ${result.weightSummary.weightChangeFromLastWeek >= 0 ? "+" : ""}${result.weightSummary.weightChangeFromLastWeek.toFixed(1)}kg`,
        `📝 記録日数: ${result.weightSummary.cntRecordsThisWeek}/7日`,
        "",
        "🍽️ 食事サマリ:",
        `🔥 総摂取カロリー: ${result.mealSummary.totalCalories}kcal`,
        `📊 1日平均: ${result.mealSummary.avgCalories}kcal`,
        `🥩 平均たんぱく質: ${result.mealSummary.avgProtein}g`,
        `📝 記録回数: ${result.mealSummary.cntRecordDaysThisWeek}/21回(1日3食×7日)`,
        "",
        "🏃‍♀️ 運動サマリ:",
        `⏱️ 総運動時間: ${result.exerciseSummary.totalDuration}分`,
        `🔥 総消費カロリー: ${result.exerciseSummary.totalCalories}kcal`,
        `💪 運動回数: ${result.exerciseSummary.cntExercises}回`,
        `🏅 よくやった運動: ${result.exerciseSummary.modeExercise || "なし"}`,
        ""
    ].join("\n")

    messages.push({ type: "text", text: summary })
    messages.push({ type: "text", text: result.message })

    return messages
}
