-- CreateEnum
CREATE TYPE "ExtractionJobState" AS ENUM ('queued', 'processing', 'completed', 'needs_attention', 'failed', 'expired');

-- CreateEnum
CREATE TYPE "ExtractionStrategy" AS ENUM ('embedded_text', 'document_ocr');

-- CreateEnum
CREATE TYPE "IntakeDraftType" AS ENUM ('inbox', 'task', 'reminder', 'bill', 'renewal', 'source_reference');

-- CreateEnum
CREATE TYPE "IntakeDraftState" AS ENUM ('needs_review', 'confirmed', 'dismissed', 'expired');

-- CreateTable
CREATE TABLE "ExtractionJob" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "intakeEnvelopeId" TEXT NOT NULL,
    "sourceAssetId" TEXT,
    "strategy" "ExtractionStrategy" NOT NULL,
    "state" "ExtractionJobState" NOT NULL DEFAULT 'queued',
    "pageCount" INTEGER,
    "confidence" DOUBLE PRECISION,
    "redactionSummary" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceReferenceId" TEXT,

    CONSTRAINT "ExtractionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeDraft" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "intakeEnvelopeId" TEXT NOT NULL,
    "sourceReferenceId" TEXT NOT NULL,
    "proposedType" "IntakeDraftType" NOT NULL,
    "state" "IntakeDraftState" NOT NULL DEFAULT 'needs_review',
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "safeNotes" TEXT,
    "dueAt" TIMESTAMP(3),
    "renewalAt" TIMESTAMP(3),
    "proposedAssignedMemberId" TEXT,
    "sourcePageReference" TEXT,
    "confidence" DOUBLE PRECISION,
    "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "redactionSummary" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "confirmedByMemberId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeDraft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExtractionJob_householdId_state_idx" ON "ExtractionJob"("householdId", "state");
CREATE INDEX "ExtractionJob_intakeEnvelopeId_idx" ON "ExtractionJob"("intakeEnvelopeId");
CREATE INDEX "ExtractionJob_state_expiresAt_idx" ON "ExtractionJob"("state", "expiresAt");
CREATE UNIQUE INDEX "IntakeDraft_intakeEnvelopeId_key" ON "IntakeDraft"("intakeEnvelopeId");
CREATE INDEX "IntakeDraft_householdId_state_idx" ON "IntakeDraft"("householdId", "state");
CREATE INDEX "IntakeDraft_state_expiresAt_idx" ON "IntakeDraft"("state", "expiresAt");

ALTER TABLE "ExtractionJob" ADD CONSTRAINT "ExtractionJob_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExtractionJob" ADD CONSTRAINT "ExtractionJob_intakeEnvelopeId_fkey" FOREIGN KEY ("intakeEnvelopeId") REFERENCES "IntakeEnvelope"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExtractionJob" ADD CONSTRAINT "ExtractionJob_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "SourceAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExtractionJob" ADD CONSTRAINT "ExtractionJob_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "IntakeDraft" ADD CONSTRAINT "IntakeDraft_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntakeDraft" ADD CONSTRAINT "IntakeDraft_intakeEnvelopeId_fkey" FOREIGN KEY ("intakeEnvelopeId") REFERENCES "IntakeEnvelope"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntakeDraft" ADD CONSTRAINT "IntakeDraft_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntakeDraft" ADD CONSTRAINT "IntakeDraft_proposedAssignedMemberId_fkey" FOREIGN KEY ("proposedAssignedMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "IntakeDraft" ADD CONSTRAINT "IntakeDraft_confirmedByMemberId_fkey" FOREIGN KEY ("confirmedByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
