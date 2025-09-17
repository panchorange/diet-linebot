export function buildMealExtractionPrompt(
    userText?: string | null,
    masters?: Array<{
        id: number
        name: string
        caloriePer100g: number
        proteinPer100g: number
        fatPer100g: number
        carbohydratePer100g: number
    }>,
    imageUrl?: string | null,
    nowJst?: Date
): string {
    const normalized = (userText ?? "").replace(/\s+/g, " ").trim()
    const mastersJson = JSON.stringify(masters ?? [])
    const parts: string[] = []
    // 入力部は存在するものだけを列挙
    if (normalized) parts.push(`- テキスト: "${normalized}"`)
    if (imageUrl) parts.push(`- 画像URL: ${imageUrl}`)
    parts.push(`- 食事マスタ(100g当たり栄養): ${mastersJson}`)
    if (nowJst) parts.push(`- 時刻: ${nowJst.toISOString()}`)

    const userPrompt = `
        あなたは食事記録の抽出アシスタントです。
        与えられた情報から食事内容を解析し、JSONで返してください。
        解析して欲しい内容は以下です。
        - 食事名
        - 量
        - 食事タイプ
        - カロリー
        - タンパク質
        - 脂質
        - 炭水化物
        - アドバイス(20~40文字程度。絵文字を使い、優しい巨人のキャラクターで楽しくアドバイスを生成してください。絵文字は使いまくりで)

        # 入力
        ${parts.join("\n")}

        # 出力形式
        {
            "isMeal": boolean,
            "mealId": number | null,
            "mealName": string | null,
            "amountGrams": number | null,
            "calories": number | null,
            "protein": number | null,
            "fat": number | null,
            "carbohydrate": number | null,
            "mealType": "breakfast" | "lunch" | "dinner" | "snack" | null,
            "advice": string
        }

        # ルール
        - JSONのみ出力
        - 数値は数値型で返す
        - 食事マスタから最も近いものを選択
        `
    return userPrompt
}
