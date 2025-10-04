/*
  Warnings:

  - The primary key for the `mst_meals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `mst_meals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `mealId` on the `meal_records` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."meal_records" DROP CONSTRAINT "meal_records_mealId_fkey";

-- AlterTable
ALTER TABLE "public"."meal_records" DROP COLUMN "mealId",
ADD COLUMN     "mealId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."mst_meals" DROP CONSTRAINT "mst_meals_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "mst_meals_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "meal_records_mealId_idx" ON "public"."meal_records"("mealId");

-- AddForeignKey
ALTER TABLE "public"."meal_records" ADD CONSTRAINT "meal_records_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "public"."mst_meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
