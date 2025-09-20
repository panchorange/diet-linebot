-- DropForeignKey
ALTER TABLE "public"."meal_records" DROP CONSTRAINT "meal_records_mealId_fkey";

-- AlterTable
ALTER TABLE "public"."meal_records" ALTER COLUMN "mealId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."meal_records" ADD CONSTRAINT "meal_records_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "public"."mst_meals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
