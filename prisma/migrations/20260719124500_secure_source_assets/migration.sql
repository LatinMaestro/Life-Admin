-- CreateEnum
CREATE TYPE "SourceAssetProvider" AS ENUM ('r2');

-- CreateEnum
CREATE TYPE "SourceAssetState" AS ENUM ('pending', 'quarantined', 'ready', 'rejected', 'deleting', 'deleted');

-- CreateEnum
CREATE TYPE "SourceAssetPurpose" AS ENUM ('direct_upload', 'camera_original', 'camera_crop', 'email_message', 'email_attachment', 'voice_audio');

-- CreateTable
CREATE TABLE "SourceAsset" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "sourceReferenceId" TEXT,
    "provider" "SourceAssetProvider" NOT NULL,
    "objectKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "byteSize" BIGINT NOT NULL,
    "sha256Digest" TEXT,
    "state" "SourceAssetState" NOT NULL DEFAULT 'pending',
    "purpose" "SourceAssetPurpose" NOT NULL,
    "retentionUntil" TIMESTAMP(3),
    "createdByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SourceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceAsset_objectKey_key" ON "SourceAsset"("objectKey");

-- CreateIndex
CREATE INDEX "SourceAsset_householdId_state_idx" ON "SourceAsset"("householdId", "state");

-- CreateIndex
CREATE INDEX "SourceAsset_householdId_sourceReferenceId_idx" ON "SourceAsset"("householdId", "sourceReferenceId");

-- CreateIndex
CREATE INDEX "SourceAsset_state_retentionUntil_idx" ON "SourceAsset"("state", "retentionUntil");

-- AddForeignKey
ALTER TABLE "SourceAsset" ADD CONSTRAINT "SourceAsset_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceAsset" ADD CONSTRAINT "SourceAsset_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceAsset" ADD CONSTRAINT "SourceAsset_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
