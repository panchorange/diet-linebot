import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set")
}

export const aiClient = new GoogleGenAI({ apiKey: apiKey })
