import "server-only";

import { createHash } from "node:crypto";
import type { HouseholdAccessContext } from "@/lib/access-control";
import { requireHouseholdPermission } from "@/lib/access-control";
import {
  projectSafeDraft,
  protectDraftField,
  type SafeDraftProjection,
} from "@/lib/intake-draft-policy";
import { getDocumentExtractor } from "@/lib/extraction";
import { getPrismaClient } from "@/lib/server/prisma";
import { getPrivateObjectStorage } from "@/lib/storage";
import { getSpeechTranscriber } from "@/lib/speech";

const draftLifetimeMs = 30 * 24 * 60 * 60 * 1000;

export type ConfirmIntakeDraftInput = {
  proposedType?: SafeDraftProjection["proposedType"];
  title?: string;
  provider?: string | null;
  safeNotes?: string | null;
  dueAt?: Date | null;
  renewalAt?: Date | null;
  assignedMemberId?: string | null;
};

export async function processSourceAsset(
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
      state: "ready",
      sourceReferenceId: { not: null },
    },
    select: {
      id: true,
      objectKey: true,
      originalName: true,
      mediaType: true,
      sourceReferenceId: true,
    },
  });
  if (!asset?.sourceReferenceId) throw new Error("This private source is not ready.");
  const sourceReferenceId = asset.sourceReferenceId;

  const providerEventKeyHash = createHash("sha256")
    .update(`source-asset:${asset.id}`)
    .digest("hex");
  const expiresAt = new Date(Date.now() + draftLifetimeMs);
  const envelope = await prisma.intakeEnvelope.upsert({
    where: { providerEventKeyHash },
    update: {},
    create: {
      householdId: context.householdId,
      channel: asset.mediaType.startsWith("image/") ? "camera" : "upload",
      providerEventKeyHash,
      state: "processing",
      sourceReferenceId: sourceReferenceId,
      attemptCount: 1,
      expiresAt,
    },
    select: { id: true, state: true },
  });
  const existing = await prisma.intakeDraft.findUnique({
    where: { intakeEnvelopeId: envelope.id },
    select: { id: true },
  });
  if (existing) return response(existing.id);

  const claimed = await prisma.intakeEnvelope.updateMany({
    where: {
      id: envelope.id,
      householdId: context.householdId,
      state: { in: ["received", "needs_attention"] },
    },
    data: { state: "processing", attemptCount: { increment: 1 } },
  });
  if (!claimed.count) return processingResponse();

  const job = await prisma.extractionJob.create({
    data: {
      householdId: context.householdId,
      intakeEnvelopeId: envelope.id,
      sourceAssetId: asset.id,
      sourceReferenceId: sourceReferenceId,
      strategy: asset.mediaType.startsWith("image/") ? "document_ocr" : "embedded_text",
      state: "processing",
      expiresAt,
    },
    select: { id: true },
  });

  try {
    const storage = await getPrivateObjectStorage();
    const stored = await storage.readObject(asset.objectKey);
    const extractor = await getDocumentExtractor();
    const extracted = await extractor.extract({
      bytes: stored.bytes,
      mediaType: asset.mediaType,
      fileName: asset.originalName,
    });
    const projection = projectSafeDraft(extracted.text);

    const draft = await prisma.$transaction(async (transaction) => {
      await transaction.extractionJob.update({
        where: { id: job.id },
        data: {
          strategy: extracted.strategy,
          state: "completed",
          pageCount: extracted.pageCount,
          confidence: extracted.confidence,
          redactionSummary: projection.redactionSummary,
          completedAt: new Date(),
        },
      });
      const created = await transaction.intakeDraft.create({
        data: {
          householdId: context.householdId,
          intakeEnvelopeId: envelope.id,
          sourceReferenceId: sourceReferenceId,
          proposedType: projection.proposedType,
          title: projection.title,
          provider: projection.provider,
          safeNotes: projection.safeNotes,
          dueAt: projection.dueAt,
          renewalAt: projection.renewalAt,
          confidence: projection.confidence,
          warnings: projection.warnings,
          redactionSummary: projection.redactionSummary,
          expiresAt,
        },
        select: { id: true },
      });
      await transaction.intakeEnvelope.update({
        where: { id: envelope.id },
        data: { state: "ready" },
      });
      await transaction.inboxItem.create({
        data: {
          householdId: context.householdId,
          title: "Document ready to review",
          description: "Check the suggested details against the original source.",
          status: "needs_review",
          category: "other",
          suggestedDestination: "none",
          sourceReferenceId: sourceReferenceId,
          createdByMemberId: context.memberId,
        },
      });
      return created;
    });
    return response(draft.id);
  } catch (error) {
    await prisma.$transaction([
      prisma.extractionJob.update({
        where: { id: job.id },
        data: { state: "failed", completedAt: new Date() },
      }),
      prisma.intakeEnvelope.update({
        where: { id: envelope.id },
        data: { state: "needs_attention" },
      }),
    ]);
    throw error;
  }
}


export async function processVoiceAsset(
  context: HouseholdAccessContext,
  assetId: string,
) {
  requireHouseholdPermission(context, "manage_shared_items");
  const prisma = getPrismaClient();
  const asset = await prisma.sourceAsset.findFirst({
    where: {
      id: assetId,
      householdId: context.householdId,
      purpose: "voice_audio",
      mediaType: "audio/mp4",
      state: "ready",
      sourceReferenceId: { not: null },
    },
    select: {
      id: true,
      objectKey: true,
      mediaType: true,
      sourceReferenceId: true,
    },
  });
  if (!asset?.sourceReferenceId) throw new Error("This voice note is not ready.");
  const sourceReferenceId = asset.sourceReferenceId;
  const providerEventKeyHash = createHash("sha256")
    .update(`voice-asset:${asset.id}`)
    .digest("hex");
  const expiresAt = new Date(Date.now() + draftLifetimeMs);
  const envelope = await prisma.intakeEnvelope.upsert({
    where: { providerEventKeyHash },
    update: {},
    create: {
      householdId: context.householdId,
      channel: "voice",
      providerEventKeyHash,
      state: "received",
      sourceReferenceId,
      attemptCount: 0,
      expiresAt,
    },
    select: { id: true },
  });
  const existing = await prisma.intakeDraft.findUnique({
    where: { intakeEnvelopeId: envelope.id },
    select: { id: true },
  });
  if (existing) return response(existing.id);

  const claimed = await prisma.intakeEnvelope.updateMany({
    where: {
      id: envelope.id,
      householdId: context.householdId,
      state: { in: ["received", "needs_attention"] },
    },
    data: { state: "processing", attemptCount: { increment: 1 } },
  });
  if (!claimed.count) return processingResponse();

  const job = await prisma.extractionJob.create({
    data: {
      householdId: context.householdId,
      intakeEnvelopeId: envelope.id,
      sourceAssetId: asset.id,
      sourceReferenceId,
      strategy: "speech_transcription",
      state: "processing",
      expiresAt,
    },
    select: { id: true },
  });

  try {
    const storage = await getPrivateObjectStorage();
    const stored = await storage.readObject(asset.objectKey);
    const transcriber = await getSpeechTranscriber();
    const transcription = await transcriber.transcribe({
      bytes: stored.bytes,
      mediaType: asset.mediaType,
    });
    const projection = projectSafeDraft(transcription.text);
    const draft = await prisma.$transaction(async (transaction) => {
      await transaction.extractionJob.update({
        where: { id: job.id },
        data: {
          state: "completed",
          confidence: transcription.confidence,
          redactionSummary: projection.redactionSummary,
          completedAt: new Date(),
        },
      });
      const created = await transaction.intakeDraft.create({
        data: {
          householdId: context.householdId,
          intakeEnvelopeId: envelope.id,
          sourceReferenceId,
          proposedType: projection.proposedType,
          title: projection.title,
          provider: projection.provider,
          safeNotes: projection.safeNotes,
          dueAt: projection.dueAt,
          renewalAt: projection.renewalAt,
          confidence: projection.confidence,
          warnings: projection.warnings,
          redactionSummary: projection.redactionSummary,
          expiresAt,
        },
        select: { id: true },
      });
      await transaction.intakeEnvelope.update({
        where: { id: envelope.id },
        data: { state: "ready" },
      });
      await transaction.inboxItem.create({
        data: {
          householdId: context.householdId,
          title: "Voice note ready to review",
          description: "Check the suggested household item before saving it.",
          status: "needs_review",
          category: "other",
          suggestedDestination: "none",
          sourceReferenceId,
          createdByMemberId: context.memberId,
        },
      });
      return created;
    });

    await storage.deleteObject(asset.objectKey)
      .then(() => prisma.sourceAsset.update({
        where: { id: asset.id },
        data: { state: "deleted", deletedAt: new Date(), retentionUntil: null },
      }))
      .catch(() => undefined);
    return response(draft.id);
  } catch (error) {
    await prisma.$transaction([
      prisma.extractionJob.update({
        where: { id: job.id },
        data: { state: "failed", completedAt: new Date() },
      }),
      prisma.intakeEnvelope.update({
        where: { id: envelope.id },
        data: { state: "needs_attention" },
      }),
    ]);
    throw error;
  }
}

export async function createEmailIntakeDraft(input: {
  householdId: string;
  envelopeId: string;
  sourceReferenceId: string;
  text: string;
  expiresAt: Date;
}) {
  const projection = projectSafeDraft(input.text);
  const prisma = getPrismaClient();
  return prisma.$transaction(async (transaction) => {
    await transaction.extractionJob.create({
      data: {
        householdId: input.householdId,
        intakeEnvelopeId: input.envelopeId,
        sourceReferenceId: input.sourceReferenceId,
        strategy: "embedded_text",
        state: "completed",
        confidence: projection.confidence,
        redactionSummary: projection.redactionSummary,
        expiresAt: input.expiresAt,
        completedAt: new Date(),
      },
    });
    return transaction.intakeDraft.create({
      data: {
        householdId: input.householdId,
        intakeEnvelopeId: input.envelopeId,
        sourceReferenceId: input.sourceReferenceId,
        proposedType: projection.proposedType,
        title: projection.title,
        provider: projection.provider,
        safeNotes: projection.safeNotes,
        dueAt: projection.dueAt,
        renewalAt: projection.renewalAt,
        confidence: projection.confidence,
        warnings: projection.warnings,
        redactionSummary: projection.redactionSummary,
        expiresAt: input.expiresAt,
      },
      select: { id: true },
    });
  });
}

export async function listIntakeDrafts(context: HouseholdAccessContext) {
  requireHouseholdPermission(context, "manage_shared_items");
  const drafts = await getPrismaClient().intakeDraft.findMany({
    where: {
      householdId: context.householdId,
      state: "needs_review",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      proposedType: true,
      title: true,
      provider: true,
      safeNotes: true,
      dueAt: true,
      renewalAt: true,
      proposedAssignedMemberId: true,
      sourcePageReference: true,
      confidence: true,
      warnings: true,
      intakeEnvelope: { select: { channel: true } },
      sourceReference: { select: { title: true } },
    },
  });
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    drafts: drafts.map((draft) => ({
      ...draft,
      channel: draft.intakeEnvelope.channel,
      intakeEnvelope: undefined,
      dueAt: draft.dueAt?.toISOString() ?? null,
      renewalAt: draft.renewalAt?.toISOString() ?? null,
    })),
  };
}

export async function confirmIntakeDraft(
  context: HouseholdAccessContext,
  draftId: string,
  input: ConfirmIntakeDraftInput = {},
) {
  requireHouseholdPermission(context, "manage_shared_items");
  const prisma = getPrismaClient();
  return prisma.$transaction(async (transaction) => {
    const draft = await transaction.intakeDraft.findFirst({
      where: { id: draftId, householdId: context.householdId },
    });
    if (!draft) throw new Error("This review draft is not available.");
    if (draft.state === "confirmed") return response(draft.id);
    if (draft.state !== "needs_review" || draft.expiresAt <= new Date()) {
      throw new Error("This review draft is no longer available.");
    }

    const proposedType = input.proposedType ?? draft.proposedType;
    const title = protectDraftField(input.title ?? draft.title, 120);
    const provider = nullableProtected(input.provider ?? draft.provider, 100);
    const safeNotes = nullableProtected(input.safeNotes ?? draft.safeNotes, 500);
    const dueAt = input.dueAt === undefined ? draft.dueAt : input.dueAt;
    const renewalAt = input.renewalAt === undefined ? draft.renewalAt : input.renewalAt;
    const assignedMemberId = input.assignedMemberId === undefined
      ? draft.proposedAssignedMemberId
      : input.assignedMemberId;
    if (title.length < 2) throw new Error("Enter a safe title.");

    if (assignedMemberId) {
      const member = await transaction.householdMember.findFirst({
        where: { id: assignedMemberId, householdId: context.householdId, status: "active" },
        select: { id: true },
      });
      if (!member) throw new Error("Choose an active household member.");
    }

    const claimed = await transaction.intakeDraft.updateMany({
      where: {
        id: draft.id,
        householdId: context.householdId,
        state: "needs_review",
      },
      data: { state: "confirmed" },
    });
    if (!claimed.count) return response(draft.id);

    if (proposedType === "task") {
      await transaction.task.create({
        data: {
          householdId: context.householdId,
          title,
          notes: safeNotes,
          stage: "action",
          dueAt,
          assignedMemberId,
          createdByMemberId: context.memberId,
          sourceReferenceId: draft.sourceReferenceId,
        },
      });
    } else if (proposedType === "reminder") {
      if (!dueAt) throw new Error("Choose a reminder date.");
      await transaction.reminder.create({
        data: {
          householdId: context.householdId,
          title,
          notes: safeNotes,
          remindAt: dueAt,
          cadence: "once",
          assignedMemberId,
          createdByMemberId: context.memberId,
        },
      });
    } else if (proposedType === "bill" || proposedType === "renewal") {
      const eventDate = proposedType === "bill" ? dueAt : renewalAt;
      if (!eventDate) throw new Error("Choose a date.");
      await transaction.billOrRenewal.create({
        data: {
          householdId: context.householdId,
          title,
          provider,
          type: proposedType,
          dueAt: proposedType === "bill" ? eventDate : null,
          renewalAt: proposedType === "renewal" ? eventDate : null,
          notes: safeNotes,
          assignedMemberId,
          createdByMemberId: context.memberId,
          sourceReferenceId: draft.sourceReferenceId,
        },
      });
    } else if (proposedType === "inbox") {
      await transaction.inboxItem.create({
        data: {
          householdId: context.householdId,
          title,
          description: safeNotes,
          category: "other",
          status: "new",
          assignedMemberId,
          createdByMemberId: context.memberId,
          sourceReferenceId: draft.sourceReferenceId,
        },
      });
    }

    await transaction.intakeDraft.update({
      where: { id: draft.id },
      data: {
        state: "confirmed",
        proposedType,
        title,
        provider,
        safeNotes,
        dueAt,
        renewalAt,
        proposedAssignedMemberId: assignedMemberId,
        confirmedByMemberId: context.memberId,
        confirmedAt: new Date(),
      },
    });
    await transaction.sourceReference.update({
      where: { id: draft.sourceReferenceId },
      data: { reviewStatus: proposedType === "source_reference" ? "confirmed" : "linked" },
    });
    await transaction.inboxItem.updateMany({
      where: {
        householdId: context.householdId,
        sourceReferenceId: draft.sourceReferenceId,
        status: { in: ["new", "needs_review"] },
      },
      data: { status: "linked" },
    });
    await transaction.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType: "source_reference",
        entityId: draft.sourceReferenceId,
        eventType: "created",
        summary: "Confirmed a reviewed household item",
      },
    });
    return response(draft.id);
  });
}

export async function dismissIntakeDraft(
  context: HouseholdAccessContext,
  draftId: string,
) {
  requireHouseholdPermission(context, "manage_shared_items");
  const result = await getPrismaClient().intakeDraft.updateMany({
    where: {
      id: draftId,
      householdId: context.householdId,
      state: "needs_review",
    },
    data: { state: "dismissed" },
  });
  if (!result.count) throw new Error("This review draft is not available.");
  return response(draftId);
}

function nullableProtected(value: string | null | undefined, maxLength: number) {
  if (!value) return null;
  return protectDraftField(value, maxLength) || null;
}

function processingResponse() {
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    success: true as const,
    processing: true as const,
  };
}

function response(draftId: string) {
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    success: true as const,
    draftId,
  };
}
