/*
  Warnings:

  - Added the required column `userMealId` to the `meal_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."meal_records" ADD COLUMN     "amountGrams" DOUBLE PRECISION,
ADD COLUMN     "userMealId" TEXT NOT NULL;
