-- AlterTable
ALTER TABLE "public"."test_prisma" ADD COLUMN     "comment" TEXT,
ALTER COLUMN "name" DROP NOT NULL;
