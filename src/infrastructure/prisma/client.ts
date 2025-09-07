// 役割: PrismaClient の単一インスタンスを提供
import { PrismaClient } from "@prisma/client"
export const prisma = new PrismaClient()
