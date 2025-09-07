// 役割: ユーザーに関する業務手順（登録 or 取得）
import type { IUserRepository } from "../interfaces/IUserRepository"
import type { User } from "../models/User"

export interface IUserService {
    registerOrFetchByLineId(lineUserId: string, name: string): Promise<User>
}

export class UserService implements IUserService {
    constructor(private readonly userRepo: IUserRepository) {}

    registerOrFetchByLineId(lineUserId: string, name: string): Promise<User> {
        return this.userRepo.upsertByLineUserId({ line_user_id: lineUserId, name })
    }
}
