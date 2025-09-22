import type { WeeklyReportView } from "../../models/ExternalViews"

export type WeeklyReportPromptInput = Omit<WeeklyReportView, "message"> // messageは出力しない

export function buildWeeklyReportPrompt(input: WeeklyReportPromptInput): string {
    const json = JSON.stringify(input, null, 2)
    return `
    あなたは健康管理のコーチです。以下の1週間サマリ(JSON)を読み、ユーザーに送る日本語メッセージを出力してください。
    ただし、以下それぞれの段落でまとまりを分けて、改行を1つ入れてください。

    段落構成:
      - 今週もお疲れ様でした。
      - 1️⃣体重
        - 体重の傾向(減っている/増えている/横ばい)を述べる
        - 記録が習慣化されているか？
        - 記録が習慣化されているか？を述べる
      - 2️⃣運動
        - 運動の良い点/改善点を述べる
      - 3️⃣食事
        - 食事の良い点/改善点を述べる
      - まとめ
        - まとめとねぎらいの言葉を述べる


    出力要件:
    - フォーマットはテキストのみ（コードブロックやJSONは禁止）
    - 各観点は15~30文字程度で簡潔に。絵文字をたくさん使って元気に親しみやすく。
    - ユーザー名は敬称付き（〜さん）で呼ぶ。
    - いいところは褒めるが、悪いところはきちんと指摘する。
    - 今週も頑張ったね！というような、ユーザーのモチベ

      サマリ(JSON):\n${json}
    `
}
