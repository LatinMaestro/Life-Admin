import "server-only";

import { cleanupExpiredSourceAssets } from "@/lib/server/source-assets";
import { getPrismaClient } from "@/lib/server/prisma";

const deliveryRetentionMs = 90 * 24 * 60 * 60 * 1000;
const installationRetentionMs = 30 * 24 * 60 * 60 * 1000;

export async function runPrivateMaintenance(now = new Date()) {
  const prisma = getPrismaClient();
  const expiredAssets = await cleanupExpiredSourceAssets(now);
  const [drafts, jobs, envelopes, deliveries, installations] = await prisma.$transaction([
    prisma.intakeDraft.updateMany({
      where: { state: "needs_review", expiresAt: { lte: now } },
      data: { state: "expired" },
    }),
    prisma.extractionJob.updateMany({
      where: {
        state: { in: ["queued", "processing", "needs_attention", "failed"] },
        expiresAt: { lte: now },
      },
      data: { state: "expired" },
    }),
    prisma.intakeEnvelope.updateMany({
      where: {
        state: { in: ["received", "processing", "ready", "needs_attention"] },
        expiresAt: { lte: now },
      },
      data: { state: "expired" },
    }),
    prisma.notificationDelivery.deleteMany({
      where: {
        state: { in: ["sent", "failed", "suppressed"] },
        createdAt: { lt: new Date(now.getTime() - deliveryRetentionMs) },
      },
    }),
    prisma.deviceInstallation.deleteMany({
      where: {
        state: { in: ["revoked", "invalid"] },
        updatedAt: { lt: new Date(now.getTime() - installationRetentionMs) },
      },
    }),
  ]);

  return {
    expiredAssets,
    expiredDrafts: drafts.count,
    expiredJobs: jobs.count,
    expiredEnvelopes: envelopes.count,
    removedDeliveries: deliveries.count,
    removedInstallations: installations.count,
  };
}
