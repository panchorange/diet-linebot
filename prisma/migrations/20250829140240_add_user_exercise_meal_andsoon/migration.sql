-- CreateEnum
CREATE TYPE "public"."ExerciseType" AS ENUM ('aerobic_exercise', 'strength_training', 'stretching', 'other');

-- CreateEnum
CREATE TYPE "public"."MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."log_meals" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "meal_id" INTEGER NOT NULL,
    "meal_type" "public"."MealType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."log_measure_weight" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_measure_weight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."log_exercise" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "exercise_time" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mst_meals" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "calorie_per_100g" DOUBLE PRECISION NOT NULL,
    "protein_per_100g" DOUBLE PRECISION NOT NULL,
    "fat_per_100g" DOUBLE PRECISION NOT NULL,
    "carbohydrate_per_100g" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mst_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mst_exercises" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "exercise_type" "public"."ExerciseType" NOT NULL,
    "calorie_consumed_per_1min" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mst_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_meals_user_id_idx" ON "public"."log_meals"("user_id");

-- CreateIndex
CREATE INDEX "log_meals_meal_id_idx" ON "public"."log_meals"("meal_id");

-- CreateIndex
CREATE INDEX "log_measure_weight_user_id_idx" ON "public"."log_measure_weight"("user_id");

-- CreateIndex
CREATE INDEX "log_exercise_user_id_idx" ON "public"."log_exercise"("user_id");

-- CreateIndex
CREATE INDEX "log_exercise_exercise_id_idx" ON "public"."log_exercise"("exercise_id");

-- CreateIndex
CREATE INDEX "mst_exercises_exercise_type_idx" ON "public"."mst_exercises"("exercise_type");
