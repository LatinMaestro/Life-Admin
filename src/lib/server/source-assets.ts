import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { requireHouseholdPermission } from "@/lib/access-control";
import type { HouseholdAccessContext } from "@/lib/access-control";
import {
  allowedSourceMediaTypes,
  MAX_VOICE_SOURCE_BYTES,
  safeOriginalName,
  validateSourceBytes,
  validateSourceDeclaration,
  type AllowedSourceMediaType,
} from "@/lib/source-file-policy";
import { getPrismaClient } from "@/lib/server/prisma";
import { getPrivateObjectStorage } from "@/lib/storage";

const uploadUrlLifetimeSeconds = 10 * 60;
const readUrlLifetimeSeconds = 5 * 60;
const unconfirmedRetentionDays = 30;

export type SourceAssetPurpose =
  | "direct_upload"
  | "camera_original"
  | "camera_crop"
  | "voice_audio";

export async function createSourceAssetUpload(
  context: HouseholdAccessContext,
  input: {
    title: string;
    originalName: string;
    mediaType: string;
    byteSize: number;
    purpose: SourceAssetPurpose;
  },
) {
  requireHouseholdPermission(context, "manage_shared_items");
  requireHouseholdPermission(context, "view_source_references");
  validateSourceDeclaration(input.mediaType, input.byteSize);
  if (input.purpose === "voice_audio") {
    if (input.mediaType !== "audio/mp4" || input.byteSize > MAX_VOICE_SOURCE_BYTES) {
      throw new Error("Record a voice note shorter than three minutes.");
    }
  } else if (input.mediaType.startsWith("audio/")) {
    throw new Error("Choose a PDF or image for this source.");
  }

  const prisma = getPrismaClient();
  const objectKey = `assets/${randomUUID()}`;
  const originalName = safeOriginalName(input.originalName);
  const retentionUntil = new Date(
    Date.now() + (input.purpose === "voice_audio" ? 1 : unconfirmedRetentionDays) * 24 * 60 * 60 * 1000,
  );

  const asset = await prisma.$transaction(async (transaction) => {
    const member = await transaction.householdMember.findFirst({
      where: {
        id: context.memberId,
        householdId: context.householdId,
        userId: context.userId,
        status: "active",
      },
      select: { id: true },
    });
    if (!member) throw new Error("Active household membership is required.");

    const source = await transaction.sourceReference.create({
      data: {
        householdId: context.householdId,
        title: input.title,
        kind: sourceKind(input.mediaType, input.purpose),
        label: input.purpose === "direct_upload"
          ? "Private uploaded file"
          : input.purpose === "voice_audio"
            ? "Temporary private voice note"
            : "Private camera capture",
        sensitivity: "sensitive",
        createdByMemberId: context.memberId,
      },
      select: { id: true },
    });

    const created = await transaction.sourceAsset.create({
      data: {
        householdId: context.householdId,
        sourceReferenceId: source.id,
        provider: "r2",
        objectKey,
        originalName,
        mediaType: input.mediaType,
        byteSize: BigInt(input.byteSize),
        state: "pending",
        purpose: input.purpose,
        retentionUntil,
        createdByMemberId: context.memberId,
      },
      select: {
        id: true,
        sourceReferenceId: true,
        mediaType: true,
        byteSize: true,
      },
    });

    await transaction.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType: "source_reference",
        entityId: source.id,
        eventType: "created",
        summary: "Started a private source upload",
      },
    });
    return created;
  });

  try {
    const storage = await getPrivateObjectStorage();
    const uploadUrl = await storage.createUploadUrl(objectKey, uploadUrlLifetimeSeconds);
    return {
      apiVersion: "1" as const,
      generatedAt: new Date().toISOString(),
      assetId: asset.id,
      sourceReferenceId: asset.sourceReferenceId,
      uploadUrl,
      expiresInSeconds: uploadUrlLifetimeSeconds,
      mediaType: asset.mediaType,
      byteSize: Number(asset.byteSize),
    };
  } catch (error) {
    await prisma.sourceAsset.update({
      where: { id: asset.id },
      data: {
        state: "rejected",
        retentionUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    throw error;
  }
}

export async function finalizeSourceAsset(
  context: HouseholdAccessContext,
  assetId: string,
) {
  requireHouseholdPermission(context, "manage_shared_items");
  requireHouseholdPermission(context, "view_source_references");

  const prisma = getPrismaClient();
  const asset = await prisma.sourceAsset.findFirst({
    where: {
      id: assetId,
      householdId: context.householdId,
      state: { in: ["pending", "quarantined"] },
    },
  });
  if (!asset) throw new Error("This source upload is no longer available.");

  await prisma.sourceAsset.update({
    where: { id: asset.id },
    data: { state: "quarantined" },
  });

  const storage = await getPrivateObjectStorage();
  try {
    const stored = await storage.readObject(asset.objectKey);
    validateSourceBytes(
      stored.bytes,
      asset.mediaType as AllowedSourceMediaType,
      Number(asset.byteSize),
    );
    const digest = createHash("sha256").update(stored.bytes).digest("hex");

    await prisma.$transaction(async (transaction) => {
      const current = await transaction.sourceAsset.findFirst({
        where: {
          id: asset.id,
          householdId: context.householdId,
          state: "quarantined",
        },
        select: { id: true, sourceReferenceId: true },
      });
      if (!current) throw new Error("This source upload changed while it was checked.");

      await transaction.sourceAsset.update({
        where: { id: current.id },
        data: {
          state: "ready",
          sha256Digest: digest,
          retentionUntil: asset.purpose === "voice_audio"
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : asset.retentionUntil,
        },
      });
      if (current.sourceReferenceId) {
        await transaction.sourceReference.updateMany({
          where: {
            id: current.sourceReferenceId,
            householdId: context.householdId,
          },
          data: { reviewStatus: "needs_review" },
        });
      }
      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "source_reference",
          entityId: current.sourceReferenceId,
          eventType: "linked_source",
          summary: "Added a verified private source file",
        },
      });
    });

    return {
      apiVersion: "1" as const,
      generatedAt: new Date().toISOString(),
      success: true as const,
      assetId: asset.id,
      sourceReferenceId: asset.sourceReferenceId,
      state: "ready" as const,
    };
  } catch {
    await rejectAndDeleteAsset(asset.id, asset.objectKey);
    throw new Error("The file could not be verified and was removed.");
  }
}

export async function listSourceAssets(context: HouseholdAccessContext) {
  requireHouseholdPermission(context, "view_source_references");
  const assets = await getPrismaClient().sourceAsset.findMany({
    where: {
      householdId: context.householdId,
      state: { not: "deleted" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      sourceReferenceId: true,
      originalName: true,
      mediaType: true,
      byteSize: true,
      state: true,
      purpose: true,
      createdAt: true,
    },
  });
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    assets: assets.map((asset) => ({
      ...asset,
      byteSize: Number(asset.byteSize),
      createdAt: asset.createdAt.toISOString(),
    })),
  };
}

export async function createSourceAssetReadUrl(
  context: HouseholdAccessContext,
  assetId: string,
) {
  requireHouseholdPermission(context, "view_source_references");
  const asset = await getPrismaClient().sourceAsset.findFirst({
    where: {
      id: assetId,
      householdId: context.householdId,
      state: "ready",
    },
    select: { objectKey: true },
  });
  if (!asset) throw new Error("This private source is not available.");
  const storage = await getPrivateObjectStorage();
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    url: await storage.createReadUrl(asset.objectKey, readUrlLifetimeSeconds),
    expiresInSeconds: readUrlLifetimeSeconds,
  };
}

export async function deleteSourceAsset(
  context: HouseholdAccessContext,
  assetId: string,
) {
  requireHouseholdPermission(context, "manage_shared_items");
  requireHouseholdPermission(context, "view_source_references");
  const prisma = getPrismaClient();
  const asset = await prisma.sourceAsset.findFirst({
    where: {
      id: assetId,
      householdId: context.householdId,
      state: { not: "deleted" },
    },
    select: { id: true, objectKey: true, sourceReferenceId: true },
  });
  if (!asset) throw new Error("This private source is not available.");

  await prisma.sourceAsset.update({
    where: { id: asset.id },
    data: { state: "deleting" },
  });
  const removed = await rejectAndDeleteAsset(asset.id, asset.objectKey);
  if (!removed) {
    throw new Error("Removal is queued and will be retried.");
  }
  await prisma.$transaction(async (transaction) => {
    await transaction.sourceAsset.update({
      where: { id: asset.id },
      data: { state: "deleted", deletedAt: new Date(), retentionUntil: null },
    });
    if (asset.sourceReferenceId) {
      const remaining = await transaction.sourceAsset.count({
        where: {
          sourceReferenceId: asset.sourceReferenceId,
          householdId: context.householdId,
          state: { not: "deleted" },
        },
      });
      if (remaining === 0) {
        await transaction.sourceReference.updateMany({
          where: { id: asset.sourceReferenceId, householdId: context.householdId },
          data: { reviewStatus: "archived" },
        });
      }
    }
    await transaction.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType: "source_reference",
        entityId: asset.sourceReferenceId,
        eventType: "archived",
        summary: "Removed a private source file",
      },
    });
  });
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    success: true as const,
  };
}

export async function cleanupExpiredSourceAssets(now = new Date()) {
  const prisma = getPrismaClient();
  const stale = await prisma.sourceAsset.findMany({
    where: {
      state: { in: ["pending", "quarantined", "ready", "rejected", "deleting"] },
      retentionUntil: { lte: now },
    },
    select: { id: true, objectKey: true },
    take: 100,
  });
  for (const asset of stale) {
    await rejectAndDeleteAsset(asset.id, asset.objectKey);
  }
  return stale.length;
}

async function rejectAndDeleteAsset(assetId: string, objectKey: string) {
  const prisma = getPrismaClient();
  const storage = await getPrivateObjectStorage();
  try {
    await storage.deleteObject(objectKey);
  } catch {
    await prisma.sourceAsset.update({
      where: { id: assetId },
      data: {
        state: "deleting",
        retentionUntil: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    return false;
  }
  const deleted = await prisma.sourceAsset.update({
    where: { id: assetId },
    data: {
      state: "deleted",
      deletedAt: new Date(),
      retentionUntil: null,
    },
    select: {
      householdId: true,
      sourceReferenceId: true,
    },
  });
  if (deleted.sourceReferenceId) {
    await prisma.sourceReference.updateMany({
      where: {
        id: deleted.sourceReferenceId,
        householdId: deleted.householdId,
        assets: { none: { state: { not: "deleted" } } },
      },
      data: { reviewStatus: "archived" },
    });
  }
  return true;
}

function sourceKind(mediaType: string, purpose: SourceAssetPurpose) {
  if (purpose === "voice_audio") return "source_document_reference" as const;
  if (purpose === "camera_crop") return "source_crop_reference" as const;
  return mediaType === "application/pdf"
    ? "source_document_reference" as const
    : "source_image_reference" as const;
}

export function isAllowedSourceMediaType(value: string): value is AllowedSourceMediaType {
  return allowedSourceMediaTypes.includes(value as AllowedSourceMediaType);
}
