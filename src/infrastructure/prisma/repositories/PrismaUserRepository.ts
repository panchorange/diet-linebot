// 役割: User リポジトリの Prisma 実装

import type { IUserRepository } from "../../../domain/interfaces/IUserRepository"
import type { User } from "../../../domain/models/User"
import { prisma } from "../../prisma/client"

export class PrismaUserRepository implements IUserRepository {
    async findByLineUserId(lineUserId: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { lineUserId }
        })

        if (!user) return null

        return {
            id: user.id,
            name: user.displayName,
            line_user_id: user.lineUserId,
            height: user.height,
            age: user.age,
            gender: user.gender ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    async upsertByLineUserId(input: { line_user_id: string; name: string }): Promise<User> {
        // 実際のPrismaでユーザーをDB保存
        const user = await prisma.user.upsert({
            where: { lineUserId: input.line_user_id },
            update: { displayName: input.name },
            create: {
                lineUserId: input.line_user_id,
                displayName: input.name
            }
        })

        return {
            id: user.id, // 実際のDBのcuidを使用
            name: user.displayName,
            line_user_id: user.lineUserId,
            height: user.height,
            age: user.age,
            gender: user.gender ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    async updateProfile(
        lineUserId: string,
        profile: { height?: number | null; age?: number | null; gender?: "male" | "female" | "other" | null }
    ): Promise<User> {
        const user = await prisma.user.upsert({
            where: { lineUserId },
            update: {
                height: profile.height ?? undefined,
                age: profile.age ?? undefined,
                gender: profile.gender ?? undefined
            },
            create: {
                lineUserId,
                displayName: "unknown",
                height: profile.height ?? undefined,
                age: profile.age ?? undefined,
                gender: profile.gender ?? undefined
            }
        })

        return {
            id: user.id,
            name: user.displayName,
            line_user_id: user.lineUserId,
            height: user.height,
            age: user.age,
            gender: user.gender ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }
}
