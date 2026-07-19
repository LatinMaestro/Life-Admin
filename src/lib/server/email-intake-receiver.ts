import "server-only";

import { createHash, randomUUID } from "node:crypto";
import PostalMime from "postal-mime";
import {
  hashAliasToken,
  hashProviderEvent,
} from "@/lib/email-intake-crypto";
import {
  safeOriginalName,
  validateSourceBytes,
  validateSourceDeclaration,
  type AllowedSourceMediaType,
} from "@/lib/source-file-policy";
import { getPrismaClient } from "@/lib/server/prisma";
import { getPrivateObjectStorage } from "@/lib/storage";

export const MAX_INBOUND_EMAIL_BYTES = 20 * 1024 * 1024;
const maxMessagesPerHour = 20;
const unconfirmedLifetimeMs = 30 * 24 * 60 * 60 * 1000;

type StagedAsset = {
  objectKey: string;
  originalName: string;
  mediaType: string;
  bytes: Uint8Array;
  purpose: "email_message" | "email_attachment";
  digest: string;
};

export async function receiveForwardedEmail(input: {
  recipient: string;
  eventId: string;
  raw: Uint8Array;
}) {
  if (input.raw.byteLength < 1 || input.raw.byteLength > MAX_INBOUND_EMAIL_BYTES) {
    throw new Error("Inbound message size is outside the allowed range.");
  }

  const localPart = localPartForRecipient(input.recipient);
  const prisma = getPrismaClient();
  const alias = await prisma.intakeAlias.findUnique({
    where: { aliasTokenHash: hashAliasToken(localPart) },
    select: { householdId: true, state: true },
  });
  if (!alias || alias.state !== "active") {
    throw new Error("Inbound address is unavailable.");
  }

  const providerEventKeyHash = hashProviderEvent(input.eventId, webhookSecret());
  const duplicate = await prisma.intakeEnvelope.findUnique({
    where: { providerEventKeyHash },
    select: { id: true },
  });
  if (duplicate) return { accepted: true as const, duplicate: true as const };

  const recentCount = await prisma.intakeEnvelope.count({
    where: {
      householdId: alias.householdId,
      channel: "email",
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentCount >= maxMessagesPerHour) {
    throw new Error("Inbound message rate limit reached.");
  }

  const parsed = await PostalMime.parse(input.raw, {
    attachmentEncoding: "arraybuffer",
    maxHeadersSize: 256 * 1024,
    maxNestingDepth: 32,
  });
  const staged: StagedAsset[] = [{
    objectKey: `assets/${randomUUID()}`,
    originalName: "forwarded-message.eml",
    mediaType: "message/rfc822",
    bytes: input.raw,
    purpose: "email_message",
    digest: digest(input.raw),
  }];
  let needsAttention = false;

  for (const attachment of parsed.attachments.slice(0, 20)) {
    const bytes = new Uint8Array(attachment.content as ArrayBuffer);
    try {
      validateSourceDeclaration(attachment.mimeType, bytes.byteLength);
      validateSourceBytes(
        bytes,
        attachment.mimeType as AllowedSourceMediaType,
        bytes.byteLength,
      );
      staged.push({
        objectKey: `assets/${randomUUID()}`,
        originalName: safeOriginalName(attachment.filename ?? "attachment"),
        mediaType: attachment.mimeType,
        bytes,
        purpose: "email_attachment",
        digest: digest(bytes),
      });
    } catch {
      needsAttention = true;
    }
  }
  if (parsed.attachments.length > 20) needsAttention = true;

  const storage = await getPrivateObjectStorage();
  const storedKeys: string[] = [];
  try {
    for (const asset of staged) {
      await storage.putObject(asset.objectKey, asset.bytes, asset.mediaType);
      storedKeys.push(asset.objectKey);
    }

    const expiresAt = new Date(Date.now() + unconfirmedLifetimeMs);
    await prisma.$transaction(async (transaction) => {
      const member = await transaction.householdMember.findFirst({
        where: { householdId: alias.householdId, status: "active" },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        select: { id: true },
      });
      if (!member) throw new Error("The household has no active member.");

      const source = await transaction.sourceReference.create({
        data: {
          householdId: alias.householdId,
          title: "Forwarded household email",
          kind: "source_email_reference",
          label: "Private forwarded email",
          sensitivity: "sensitive",
          createdByMemberId: member.id,
        },
        select: { id: true },
      });

      await transaction.sourceAsset.createMany({
        data: staged.map((asset) => ({
          householdId: alias.householdId,
          sourceReferenceId: source.id,
          provider: "r2" as const,
          objectKey: asset.objectKey,
          originalName: asset.originalName,
          mediaType: asset.mediaType,
          byteSize: BigInt(asset.bytes.byteLength),
          sha256Digest: asset.digest,
          state: "ready" as const,
          purpose: asset.purpose,
          retentionUntil: expiresAt,
          createdByMemberId: member.id,
        })),
      });

      await transaction.intakeEnvelope.create({
        data: {
          householdId: alias.householdId,
          channel: "email",
          providerEventKeyHash,
          state: needsAttention ? "needs_attention" : "ready",
          sourceReferenceId: source.id,
          attemptCount: 1,
          expiresAt,
        },
      });

      await transaction.inboxItem.create({
        data: {
          householdId: alias.householdId,
          title: "Forwarded email ready to review",
          description: needsAttention
            ? "The original email is saved. One or more attachments need attention."
            : "The original email and supported attachments are saved privately.",
          category: "other",
          priority: "normal",
          suggestedDestination: "none",
          sourceReferenceId: source.id,
          createdByMemberId: member.id,
        },
      });

      await transaction.activityEvent.create({
        data: {
          householdId: alias.householdId,
          entityType: "inbox_item",
          eventType: "created",
          summary: "Received a forwarded email for review",
        },
      });
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    await Promise.all(storedKeys.map((key) => storage.deleteObject(key).catch(() => undefined)));
    throw error;
  }

  return { accepted: true as const, duplicate: false as const };
}

function localPartForRecipient(recipient: string) {
  const normalized = recipient.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 1 || normalized.slice(at + 1) !== intakeDomain()) {
    throw new Error("Inbound address is unavailable.");
  }
  const localPart = normalized.slice(0, at);
  if (!/^[a-z0-9_-]{20,64}$/.test(localPart)) {
    throw new Error("Inbound address is unavailable.");
  }
  return localPart;
}

function digest(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function webhookSecret() {
  return process.env.EMAIL_WEBHOOK_SECRET ?? "";
}

function intakeDomain() {
  return (process.env.EMAIL_INTAKE_DOMAIN ?? "intake.grovekind.com").toLowerCase();
}
