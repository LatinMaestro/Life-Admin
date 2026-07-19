-- CreateEnum
CREATE TYPE "IntakeAliasState" AS ENUM ('active', 'revoked');

-- CreateEnum
CREATE TYPE "IntakeChannel" AS ENUM ('upload', 'camera', 'email', 'voice');

-- CreateEnum
CREATE TYPE "IntakeEnvelopeState" AS ENUM ('received', 'processing', 'ready', 'needs_attention', 'rejected', 'expired');

-- CreateTable
CREATE TABLE "IntakeAlias" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "aliasTokenHash" TEXT NOT NULL,
    "state" "IntakeAliasState" NOT NULL DEFAULT 'active',
    "createdByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "IntakeAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeEnvelope" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "channel" "IntakeChannel" NOT NULL,
    "providerEventKeyHash" TEXT NOT NULL,
    "state" "IntakeEnvelopeState" NOT NULL DEFAULT 'received',
    "sourceReferenceId" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeEnvelope_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntakeAlias_aliasTokenHash_key" ON "IntakeAlias"("aliasTokenHash");

-- CreateIndex
CREATE INDEX "IntakeAlias_householdId_state_idx" ON "IntakeAlias"("householdId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeEnvelope_providerEventKeyHash_key" ON "IntakeEnvelope"("providerEventKeyHash");

-- CreateIndex
CREATE INDEX "IntakeEnvelope_householdId_state_idx" ON "IntakeEnvelope"("householdId", "state");

-- CreateIndex
CREATE INDEX "IntakeEnvelope_state_expiresAt_idx" ON "IntakeEnvelope"("state", "expiresAt");

-- AddForeignKey
ALTER TABLE "IntakeAlias" ADD CONSTRAINT "IntakeAlias_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeAlias" ADD CONSTRAINT "IntakeAlias_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeEnvelope" ADD CONSTRAINT "IntakeEnvelope_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeEnvelope" ADD CONSTRAINT "IntakeEnvelope_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
