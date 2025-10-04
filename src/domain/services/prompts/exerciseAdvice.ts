/**
 * LLMへ「ユーザー入力」と「運動マスタ一覧」を渡し、必ずマスタから選定させるプロンプト。
 * カロリーは選定したマスタの calorieConsumedPer1min × durationMinutes で計算させる。
 */
export function buildExerciseExtractionPrompt(
    userText: string,
    masters: Array<{ id: number; name: string; calorieConsumedPer1min: number }>
): string {
    const normalized = userText.replace(/\s+/g, " ").trim()
    const mastersJson = JSON.stringify(masters)
    const userPrompt = `
あなたは運動記録の抽出器です。以下の運動マスタ一覧から最も適切な1件を必ず選び、
運動名、運動時間（分）、消費カロリー、運動IDをJSONで返してください。

# 運動マスタ一覧（必ずこの中から選ぶ。見つからない場合は id=1 を選ぶ）
${mastersJson}

# 入力文
"${normalized}"

# 厳格な出力形式（JSONのみを出力。説明や余計な文字は出力しない）
{
  "exerciseName": string,            // 選定したマスタの name
  "durationMinutes": number,        // ユーザー入力から推定（分）
  "caloriesBurned": number,         // Math.round(selected.calorieConsumedPer1min * durationMinutes)
  "exerciseId": number              // 選定したマスタの id
}

# 制約
- JSON以外の文字は一切出力しない
- 数値は数値型で返す
- 名前の類似や同義語を考慮して最も近いものを1件選ぶ
- 明確に該当が無い場合は id=1（デフォルト運動）を選ぶ
- caloriesBurned は選定したマスタの 1分あたりカロリー × durationMinutes を四捨五入した整数
`.trim()
    return userPrompt
}
