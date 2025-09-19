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
    imageHint?: string | null,
    nowJst?: Date,
    dailyStats?: {
        totalCalories: number
        mealCount: number
        avgProtein: number
        avgFat: number
        avgCarbohydrate: number
    }
): string {
    const normalized = (userText ?? "").replace(/\s+/g, " ").trim()
    const mastersJson = JSON.stringify(masters ?? [])
    const parts: string[] = []
    // 入力部は存在するものだけを列挙
    if (normalized) parts.push(`- 食事テキスト: "${normalized}"`)
    if (imageHint) parts.push(`- 画像: 添付あり`)
    parts.push(`- 食事マスタ(100g当たり栄養): ${mastersJson}`)
    if (nowJst) parts.push(`- 時刻: ${nowJst.toISOString()}`)
    if (dailyStats) {
        const { totalCalories, mealCount, avgProtein, avgFat, avgCarbohydrate } = dailyStats
        parts.push(
            `- 直近24hサマリー: ${Math.round(totalCalories)}kcal / 回数 ${mealCount} / 平均 P ${Math.round(
                avgProtein
            )}g F ${Math.round(avgFat)}g C ${Math.round(avgCarbohydrate)}g`
        )
    }

    const userPrompt = `
        あなたは食事記録の抽出アシスタントです。
        テキスト、あるいは、画像に載った食事を解析し、JSONで返してください。
        解析して欲しい内容は以下です（複数メニューに対応）。
        - 食事タイプ（朝食/昼食/夕食/間食）
        - メニューの配列（各要素に 食事名/マスタID/量[g]）
        - アドバイス(30~50文字程度。絵文字ありで楽しく。今の食事へのアドバイスをした後、直近24時間のサマリを踏まえたアドバイスがある場合のみ追記する。)
        - 食事スコア(1-100), 食事以外の情報の場合は0, 直近24時間のサマリはスコアに含めない。

        参考情報として、直近24時間の食事サマリーが与えられています。アドバイスの中に、これを踏まえた情報を入れてください。

        # ルール
        - JSONのみ出力（説明文やコードブロックは禁止）
        - 数値は数値型で返す
        - 各メニューは食事マスタから最も近いものを1つ選び、そのidを設定
        - テキストや画像から根拠がない品目は出力しない（推測で白ごはん/味噌汁/サラダなどを補完しない）
        - 画像/テキストのどちらでも品目が判別できない場合は items は空配列、score は 0、isMeal は false
        - 食べ過ぎ/栄養バランスが偏っている/食事回数が多いなどあればスコアを下げ、アドバイスに追加
        - 栄養バランスが整っている場合はスコアを上げて、アドバイスとしてめちゃくちゃ褒めまくる

        # 入力
        ${parts.join("\n")}

        # 出力形式（JSONのみ。説明文は出力しない）
        {
            "isMeal": boolean,
            "mealType": "breakfast" | "lunch" | "dinner" | "snack" | null,
            "items": [
                {
                    "mealId": number | null,
                    "mealName": string | null,
                    "amountGrams": number | null
                }
            ],
            "advice": string,
            "score": number
        }


        `
    return userPrompt
}
