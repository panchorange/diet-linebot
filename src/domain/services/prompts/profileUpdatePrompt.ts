export function buildProfileUpdatePrompt(userText: string): string {
    const normalized = userText.replace(/\s+/g, " ").trim()
    return `
あなたはユーザーのプロフィール入力を解析し、JSONのみで回答するアシスタントです。
ユーザーのメッセージから身長(cm)、年齢、性別( male / female / other )を抽出してください。

# ユーザー投稿
"${normalized}"

# 出力フォーマット (JSONのみ)
{
  "isValid": boolean,                // 入力にプロフィール情報が含まれていれば true。なければ false
  "heightCm": number | null,         // 身長(cm)。取得できなければ null
  "age": number | null,              // 年齢。取得できなければ null
  "gender": "male" | "female" | "other" | null,
  "feedback": string                // ユーザーへ返す日本語メッセージ。成功時: 更新内容を褒める。失敗時: 入力例を案内。
}

# 追加ルール
- JSON以外の文字は出力しない。
- 数値は数値型で出力する（文字列にしない）。
- 性別の同義語: 男性→male, 女性→female, その他/ノンバイナリー等→other。
- isValid が false の場合は heightCm / age / gender は null とし、feedback には入力例を含める。
- 複数項目が含まれていれば同時に設定する。
`.trim()
}
