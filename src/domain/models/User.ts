// 役割: User ドメインモデルの型定義
export type User = {
    id: string // Prismaスキーマに合わせてstring型に変更
    name: string
    line_user_id: string
    height?: number | null
    age?: number | null
    gender?: "male" | "female" | "other" | null
    createdAt: Date
    updatedAt: Date
}
