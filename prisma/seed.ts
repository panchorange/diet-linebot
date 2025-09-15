// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import { seedExerciseMaster } from "./seeds/exerciseMaster"

const prisma = new PrismaClient()

async function main() {
    await seedExerciseMaster()
}
main().finally(() => prisma.$disconnect())
