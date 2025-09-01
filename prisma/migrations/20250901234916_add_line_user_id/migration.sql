/*
  Warnings:

  - A unique constraint covering the columns `[line_user_id]` on the table `test_prisma` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `line_user_id` to the `test_prisma` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."test_prisma" ADD COLUMN     "line_user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "test_prisma_line_user_id_key" ON "public"."test_prisma"("line_user_id");
