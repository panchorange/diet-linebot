// 役割: User リポジトリのポート（インターフェース定義）
import type { User } from "../models/User"

export interface IUserRepository {
    findByLineUserId(lineUserId: string): Promise<User | null>
    upsertByLineUserId(input: { line_user_id: string; name: string }): Promise<User>
}
