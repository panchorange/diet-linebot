/**
 * Biomeに引っかからないTypeScriptサンプル
 * - 未使用変数なし
 * - 型注釈あり
 * - セミコロン不要（asNeeded）
 * - ダブルクォート
 * - インデント4スペース
 * - 120文字以内
 */

type User = {
    id: number
    name: string
    email: string
}

function greetUser(user: User): string {
    return `こんにちは、${user.name}さん！`
}

const users: User[] = [
    { id: 1, name: "田中太郎", email: "taro@example.com" },
    { id: 2, name: "山田花子", email: "hanako@example.com" }
]

for (const user of users) {
    const message = greetUser(user)
    console.log(message)
}
