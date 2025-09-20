// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import { seedExerciseMaster } from "./seeds/exerciseMaster"
import { seedMealMaster } from "./seeds/mealMaster"

const prisma = new PrismaClient()

async function main() {
    await seedExerciseMaster()
    await seedMealMaster()
}
main().finally(() => prisma.$disconnect())
