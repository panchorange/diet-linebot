-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "public"."ExerciseType" AS ENUM ('aerobicExercise', 'strengthTraining', 'stretching', 'other');

-- CreateEnum
CREATE TYPE "public"."MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "public"."EvaluationType" AS ENUM ('meal', 'exercise', 'weight', 'overall');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "age" INTEGER,
    "gender" "public"."Gender",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mst_meals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "caloriePer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "carbohydratePer100g" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mst_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meal_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "mealType" "public"."MealType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mst_exercises" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "exerciseType" "public"."ExerciseType" NOT NULL,
    "calorieConsumedPer1min" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mst_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exercise_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "caloriesBurned" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weight_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."llm_evaluations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "evaluationType" "public"."EvaluationType" NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "evaluation" TEXT NOT NULL,
    "score" INTEGER,
    "suggestions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "llm_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_lineUserId_key" ON "public"."users"("lineUserId");

-- CreateIndex
CREATE INDEX "meal_records_userId_idx" ON "public"."meal_records"("userId");

-- CreateIndex
CREATE INDEX "meal_records_mealId_idx" ON "public"."meal_records"("mealId");

-- CreateIndex
CREATE INDEX "meal_records_recordedAt_idx" ON "public"."meal_records"("recordedAt");

-- CreateIndex
CREATE INDEX "mst_exercises_exerciseType_idx" ON "public"."mst_exercises"("exerciseType");

-- CreateIndex
CREATE INDEX "exercise_records_userId_idx" ON "public"."exercise_records"("userId");

-- CreateIndex
CREATE INDEX "exercise_records_exerciseId_idx" ON "public"."exercise_records"("exerciseId");

-- CreateIndex
CREATE INDEX "exercise_records_recordedAt_idx" ON "public"."exercise_records"("recordedAt");

-- CreateIndex
CREATE INDEX "weight_records_userId_idx" ON "public"."weight_records"("userId");

-- CreateIndex
CREATE INDEX "weight_records_recordedAt_idx" ON "public"."weight_records"("recordedAt");

-- CreateIndex
CREATE INDEX "llm_evaluations_userId_idx" ON "public"."llm_evaluations"("userId");

-- CreateIndex
CREATE INDEX "llm_evaluations_evaluationType_idx" ON "public"."llm_evaluations"("evaluationType");

-- CreateIndex
CREATE INDEX "llm_evaluations_targetDate_idx" ON "public"."llm_evaluations"("targetDate");

-- AddForeignKey
ALTER TABLE "public"."meal_records" ADD CONSTRAINT "meal_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meal_records" ADD CONSTRAINT "meal_records_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "public"."mst_meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exercise_records" ADD CONSTRAINT "exercise_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exercise_records" ADD CONSTRAINT "exercise_records_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."mst_exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weight_records" ADD CONSTRAINT "weight_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."llm_evaluations" ADD CONSTRAINT "llm_evaluations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
