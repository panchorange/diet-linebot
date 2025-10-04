/*
  Warnings:

  - You are about to drop the column `amount` on the `meal_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."meal_records" DROP COLUMN "amount",
ADD COLUMN     "advice" TEXT,
ADD COLUMN     "calories" DOUBLE PRECISION,
ADD COLUMN     "carbohydrate" DOUBLE PRECISION,
ADD COLUMN     "fat" DOUBLE PRECISION,
ADD COLUMN     "protein" DOUBLE PRECISION;
