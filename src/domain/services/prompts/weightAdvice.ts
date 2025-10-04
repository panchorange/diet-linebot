/**
 * 体重記録アドバイス用プロンプト
 * - 入力文と過去の体重履歴を与え、厳格JSONで解析させる
 */
export function buildWeightAdvicePrompt(
    userText: string,
    history: Array<{ recordedAt: string; weight: number }>
): string {
    const normalized = userText.replace(/\s+/g, " ").trim()
    const historyJson = JSON.stringify(history)
    return `
あなたは体重記録の抽出と助言を行うアシスタントです。以下のユーザー投稿と体重履歴をもとに、
1) 入力文から現在の体重(kg)を抽出し、2) その値が過去履歴と比較して異常かどうかを判定し、
3) ユーザーへの短い助言を生成してください。

# ユーザー投稿
"${normalized}"

# 体重履歴（新しい順, 最大30件程度）
${historyJson}



# 厳格な出力（JSONのみを出力すること。説明や余計な文字は出さない）
{
  "parsedWeightKg": number | null,   // 例: 72.3。抽出できなければ null
  "isAnomalous": boolean,           // 履歴と比較して明らかに不自然(例: 前回から±5kg以上/日など)なら true
  "advice": string                  // 1〜2文の日本語の助言（頻度や増減の傾向を含める）
}

# 追加ルール
- 数値は数値型で出力（文字列にしない）
- "parsedWeightKg" が null の場合は "isAnomalous" は false とし、助言には入力の明確化を促す
- 助言は中立で前向きな表現を使う
`.trim()
}
