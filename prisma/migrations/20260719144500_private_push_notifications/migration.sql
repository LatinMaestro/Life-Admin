CREATE TYPE "DevicePlatform" AS ENUM ('ios', 'android');
CREATE TYPE "PushInstallationState" AS ENUM ('active', 'revoked', 'invalid');
CREATE TYPE "NotificationDeliveryState" AS ENUM ('queued', 'sent', 'failed', 'suppressed');
CREATE TYPE "NotificationKind" AS ENUM ('task', 'reminder', 'bill', 'renewal', 'recurrence', 'intake_ready');

CREATE TABLE "DeviceInstallation" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "installationKeyHash" TEXT NOT NULL,
  "expoPushToken" TEXT NOT NULL,
  "platform" "DevicePlatform" NOT NULL,
  "state" "PushInstallationState" NOT NULL DEFAULT 'active',
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DeviceInstallation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationPreference" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "tasksEnabled" BOOLEAN NOT NULL DEFAULT true,
  "remindersEnabled" BOOLEAN NOT NULL DEFAULT true,
  "billsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "renewalsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "intakeEnabled" BOOLEAN NOT NULL DEFAULT true,
  "quietStart" TEXT NOT NULL DEFAULT '21:00',
  "quietEnd" TEXT NOT NULL DEFAULT '07:00',
  "showPreview" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationDelivery" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "installationId" TEXT NOT NULL,
  "kind" "NotificationKind" NOT NULL,
  "targetId" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "state" "NotificationDeliveryState" NOT NULL DEFAULT 'queued',
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL,
  "providerReceiptId" TEXT,
  "lastErrorCode" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeviceInstallation_installationKeyHash_key" ON "DeviceInstallation"("installationKeyHash");
CREATE UNIQUE INDEX "DeviceInstallation_expoPushToken_key" ON "DeviceInstallation"("expoPushToken");
CREATE INDEX "DeviceInstallation_householdId_state_idx" ON "DeviceInstallation"("householdId", "state");
CREATE INDEX "DeviceInstallation_userId_state_idx" ON "DeviceInstallation"("userId", "state");
CREATE INDEX "DeviceInstallation_memberId_state_idx" ON "DeviceInstallation"("memberId", "state");
CREATE UNIQUE INDEX "NotificationPreference_memberId_key" ON "NotificationPreference"("memberId");
CREATE INDEX "NotificationPreference_householdId_enabled_idx" ON "NotificationPreference"("householdId", "enabled");
CREATE UNIQUE INDEX "NotificationDelivery_dedupeKey_key" ON "NotificationDelivery"("dedupeKey");
CREATE INDEX "NotificationDelivery_state_nextAttemptAt_idx" ON "NotificationDelivery"("state", "nextAttemptAt");
CREATE INDEX "NotificationDelivery_householdId_memberId_scheduledFor_idx" ON "NotificationDelivery"("householdId", "memberId", "scheduledFor");
CREATE INDEX "NotificationDelivery_installationId_state_idx" ON "NotificationDelivery"("installationId", "state");

ALTER TABLE "DeviceInstallation" ADD CONSTRAINT "DeviceInstallation_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceInstallation" ADD CONSTRAINT "DeviceInstallation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceInstallation" ADD CONSTRAINT "DeviceInstallation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "HouseholdMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "HouseholdMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "HouseholdMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "DeviceInstallation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
