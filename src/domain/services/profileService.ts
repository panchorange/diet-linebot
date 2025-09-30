import { aiClient } from "../../config/aiClient"
import type { IUserRepository } from "../interfaces/IUserRepository"
import type { User } from "../models/User"
import { buildProfileUpdatePrompt } from "./prompts/profileUpdatePrompt"

type ProfileLLMResponse = {
    isValid?: boolean
    heightCm?: number | null
    age?: number | null
    gender?: "male" | "female" | "other" | null
    feedback?: string
}

export class ProfileService {
    constructor(private readonly userRepository: IUserRepository) {}

    async updateProfileFromText(lineUserId: string, userText: string): Promise<{ user?: User; message: string }> {
        const prompt = buildProfileUpdatePrompt(userText)
        const res = await aiClient.models.generateContent({ model: "gemini-2.5-flash", contents: prompt })

        const minimal = res as { text?: string; output_text?: string }
        const raw = minimal.text ?? minimal.output_text ?? JSON.stringify(res)
        const jsonText = typeof raw === "string" ? raw : String(raw)

        let parsed: ProfileLLMResponse
        try {
            parsed = JSON.parse(jsonText)
        } catch (error) {
            const candidate = jsonText.match(/\{[\s\S]*\}/)?.[0]
            if (!candidate) throw error
            parsed = JSON.parse(candidate)
        }

        const feedback =
            typeof parsed.feedback === "string"
                ? parsed.feedback.trim()
                : "入力内容が認識できませんでした。もう一度フォーマットをご確認ください。"
        if (!parsed.isValid) {
            return { message: feedback }
        }

        const updatedUser = await this.userRepository.updateProfile(lineUserId, {
            height: parsed.heightCm ?? undefined,
            age: parsed.age ?? undefined,
            gender: parsed.gender ?? undefined
        })

        return { user: updatedUser, message: feedback }
    }
}
