-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'custom');

-- CreateEnum
CREATE TYPE "RecurrenceSeriesState" AS ENUM ('active', 'paused', 'ended');

-- CreateEnum
CREATE TYPE "RecurrenceOccurrenceState" AS ENUM ('scheduled', 'completed', 'skipped', 'cancelled');

-- CreateEnum
CREATE TYPE "RecurrenceTargetType" AS ENUM ('task', 'reminder');

-- CreateEnum
CREATE TYPE "RecurrenceMonthEndPolicy" AS ENUM ('clamp', 'skip', 'last_day');

-- CreateTable
CREATE TABLE "RecurrenceSeries" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "targetType" "RecurrenceTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "byDay" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dayOfMonth" INTEGER,
    "monthEndPolicy" "RecurrenceMonthEndPolicy" NOT NULL DEFAULT 'clamp',
    "localTime" TEXT NOT NULL DEFAULT '09:00',
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3),
    "occurrenceLimit" INTEGER,
    "state" "RecurrenceSeriesState" NOT NULL DEFAULT 'active',
    "nextGenerationAt" TIMESTAMP(3),
    "createdByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurrenceSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurrenceOccurrence" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "localDate" TEXT NOT NULL,
    "state" "RecurrenceOccurrenceState" NOT NULL DEFAULT 'scheduled',
    "generatedItemId" TEXT,
    "overrideData" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurrenceOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurrenceSeries_householdId_state_idx" ON "RecurrenceSeries"("householdId", "state");

-- CreateIndex
CREATE INDEX "RecurrenceSeries_householdId_nextGenerationAt_idx" ON "RecurrenceSeries"("householdId", "nextGenerationAt");

-- CreateIndex
CREATE INDEX "RecurrenceSeries_targetType_targetId_idx" ON "RecurrenceSeries"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurrenceOccurrence_seriesId_scheduledFor_key" ON "RecurrenceOccurrence"("seriesId", "scheduledFor");

-- CreateIndex
CREATE INDEX "RecurrenceOccurrence_householdId_state_scheduledFor_idx" ON "RecurrenceOccurrence"("householdId", "state", "scheduledFor");

-- CreateIndex
CREATE INDEX "RecurrenceOccurrence_generatedItemId_idx" ON "RecurrenceOccurrence"("generatedItemId");

-- AddForeignKey
ALTER TABLE "RecurrenceSeries" ADD CONSTRAINT "RecurrenceSeries_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceSeries" ADD CONSTRAINT "RecurrenceSeries_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceOccurrence" ADD CONSTRAINT "RecurrenceOccurrence_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceOccurrence" ADD CONSTRAINT "RecurrenceOccurrence_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "RecurrenceSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
