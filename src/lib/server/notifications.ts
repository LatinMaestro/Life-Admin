import "server-only";

import { createHash } from "node:crypto";
import type { HouseholdAccessContext } from "@/lib/access-control";
import { requireHouseholdPermission } from "@/lib/access-control";
import {
  genericNotificationContent,
  isValidQuietTime,
  nextAllowedTime,
  notificationDedupeKey,
  type NotificationKind,
} from "@/lib/notification-policy";
import { getPrismaClient } from "@/lib/server/prisma";

export type PreferenceInput = {
  enabled?: boolean;
  tasksEnabled?: boolean;
  remindersEnabled?: boolean;
  billsEnabled?: boolean;
  renewalsEnabled?: boolean;
  intakeEnabled?: boolean;
  quietStart?: string;
  quietEnd?: string;
  showPreview?: boolean;
};

type Candidate = {
  memberId: string;
  kind: NotificationKind;
  targetId: string;
  scheduledFor: Date;
  safeTitle: string;
};

export async function registerDeviceInstallation(
  context: HouseholdAccessContext,
  input: {
    installationKey: string;
    expoPushToken: string;
    platform: "ios" | "android";
  },
) {
  requireHouseholdPermission(context, "manage_shared_items");
  if (!/^[a-f0-9-]{32,80}$/i.test(input.installationKey)) {
    throw new Error("This app installation could not be verified.");
  }
  if (!/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/.test(input.expoPushToken)) {
    throw new Error("This device could not be registered.");
  }

  const prisma = getPrismaClient();
  const installationKeyHash = hashInstallationKey(input.installationKey);
  await prisma.$transaction(async (transaction) => {
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

    await transaction.deviceInstallation.deleteMany({
      where: {
        expoPushToken: input.expoPushToken,
        installationKeyHash: { not: installationKeyHash },
      },
    });
    await transaction.deviceInstallation.upsert({
      where: { installationKeyHash },
      update: {
        householdId: context.householdId,
        userId: context.userId,
        memberId: context.memberId,
        expoPushToken: input.expoPushToken,
        platform: input.platform,
        state: "active",
        lastSeenAt: new Date(),
      },
      create: {
        householdId: context.householdId,
        userId: context.userId,
        memberId: context.memberId,
        installationKeyHash,
        expoPushToken: input.expoPushToken,
        platform: input.platform,
      },
    });
    await transaction.notificationPreference.upsert({
      where: { memberId: context.memberId },
      update: { enabled: true },
      create: {
        householdId: context.householdId,
        memberId: context.memberId,
        enabled: true,
      },
    });
  });
  return success();
}

export async function unregisterDeviceInstallation(
  context: HouseholdAccessContext,
  installationKey: string,
) {
  await getPrismaClient().deviceInstallation.updateMany({
    where: {
      householdId: context.householdId,
      userId: context.userId,
      memberId: context.memberId,
      installationKeyHash: hashInstallationKey(installationKey),
    },
    data: { state: "revoked" },
  });
  return success();
}

export async function getNotificationPreferences(context: HouseholdAccessContext) {
  const preference = await getPrismaClient().notificationPreference.upsert({
    where: { memberId: context.memberId },
    update: {},
    create: {
      householdId: context.householdId,
      memberId: context.memberId,
    },
  });
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    preference: {
      enabled: preference.enabled,
      tasksEnabled: preference.tasksEnabled,
      remindersEnabled: preference.remindersEnabled,
      billsEnabled: preference.billsEnabled,
      renewalsEnabled: preference.renewalsEnabled,
      intakeEnabled: preference.intakeEnabled,
      quietStart: preference.quietStart,
      quietEnd: preference.quietEnd,
      showPreview: preference.showPreview,
    },
  };
}

export async function updateNotificationPreferences(
  context: HouseholdAccessContext,
  input: PreferenceInput,
) {
  if (input.quietStart !== undefined && !isValidQuietTime(input.quietStart)) {
    throw new Error("Choose a valid quiet-hours start.");
  }
  if (input.quietEnd !== undefined && !isValidQuietTime(input.quietEnd)) {
    throw new Error("Choose a valid quiet-hours end.");
  }
  const data = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );
  await getPrismaClient().notificationPreference.upsert({
    where: { memberId: context.memberId },
    update: data,
    create: {
      householdId: context.householdId,
      memberId: context.memberId,
      ...data,
    },
  });
  return success();
}

export async function dispatchDueNotifications(now = new Date()) {
  const prisma = getPrismaClient();
  const preferences = await prisma.notificationPreference.findMany({
    where: { enabled: true },
    include: {
      member: {
        include: {
          deviceInstallations: {
            where: { state: "active" },
          },
        },
      },
      household: { select: { timezone: true } },
    },
  });
  if (!preferences.length) return { queued: 0, sent: 0 };

  const memberIds = preferences.map((preference) => preference.memberId);
  const from = new Date(now.getTime() - 15 * 60_000);
  const to = new Date(now.getTime() + 2 * 60_000);
  const [tasks, reminders, billReminders, renewals, occurrences, drafts] = await Promise.all([
    prisma.task.findMany({
      where: {
        assignedMemberId: { in: memberIds },
        status: "open",
        dueAt: { gte: from, lte: to },
      },
      select: { id: true, assignedMemberId: true, dueAt: true, title: true },
    }),
    prisma.reminder.findMany({
      where: {
        assignedMemberId: { in: memberIds },
        status: "scheduled",
        remindAt: { gte: from, lte: to },
      },
      select: { id: true, assignedMemberId: true, remindAt: true, title: true },
    }),
    prisma.billReminder.findMany({
      where: {
        status: "scheduled",
        remindAt: { gte: from, lte: to },
        billOrRenewal: { assignedMemberId: { in: memberIds }, type: "bill" },
      },
      select: {
        id: true,
        remindAt: true,
        billOrRenewal: { select: { assignedMemberId: true, title: true } },
      },
    }),
    prisma.billOrRenewal.findMany({
      where: {
        assignedMemberId: { in: memberIds },
        type: "renewal",
        status: { in: ["upcoming", "scheduled"] },
        renewalAt: { gte: from, lte: to },
      },
      select: { id: true, assignedMemberId: true, renewalAt: true, title: true },
    }),
    prisma.recurrenceOccurrence.findMany({
      where: { state: "scheduled", scheduledFor: { gte: from, lte: to } },
      select: {
        id: true,
        scheduledFor: true,
        series: { select: { targetType: true, targetId: true } },
      },
    }),
    prisma.intakeDraft.findMany({
      where: {
        state: "needs_review",
        proposedAssignedMemberId: { in: memberIds },
        createdAt: { gte: from, lte: to },
      },
      select: { id: true, proposedAssignedMemberId: true, createdAt: true, title: true },
    }),
  ]);

  const candidates: Candidate[] = [
    ...tasks.flatMap((item) => item.assignedMemberId && item.dueAt ? [{
      memberId: item.assignedMemberId, kind: "task" as const, targetId: item.id,
      scheduledFor: item.dueAt, safeTitle: item.title,
    }] : []),
    ...reminders.flatMap((item) => item.assignedMemberId && item.remindAt ? [{
      memberId: item.assignedMemberId, kind: "reminder" as const, targetId: item.id,
      scheduledFor: item.remindAt, safeTitle: item.title,
    }] : []),
    ...billReminders.flatMap((item) => item.billOrRenewal.assignedMemberId ? [{
      memberId: item.billOrRenewal.assignedMemberId, kind: "bill" as const, targetId: item.id,
      scheduledFor: item.remindAt, safeTitle: item.billOrRenewal.title,
    }] : []),
    ...renewals.flatMap((item) => item.assignedMemberId && item.renewalAt ? [{
      memberId: item.assignedMemberId, kind: "renewal" as const, targetId: item.id,
      scheduledFor: item.renewalAt, safeTitle: item.title,
    }] : []),
    ...drafts.flatMap((item) => item.proposedAssignedMemberId ? [{
      memberId: item.proposedAssignedMemberId, kind: "intake_ready" as const, targetId: item.id,
      scheduledFor: item.createdAt, safeTitle: item.title,
    }] : []),
  ];

  const recurrenceTargets = await resolveRecurrenceMembers(occurrences);
  candidates.push(...recurrenceTargets);

  const preferenceByMember = new Map(preferences.map((preference) => [preference.memberId, preference]));
  const rows = [];
  for (const candidate of candidates) {
    const preference = preferenceByMember.get(candidate.memberId);
    if (!preference || !kindEnabled(preference, candidate.kind)) continue;
    for (const installation of preference.member.deviceInstallations) {
      rows.push({
        householdId: installation.householdId,
        memberId: candidate.memberId,
        installationId: installation.id,
        kind: candidate.kind,
        targetId: candidate.targetId,
        scheduledFor: candidate.scheduledFor,
        dedupeKey: notificationDedupeKey({
          installationId: installation.id,
          kind: candidate.kind,
          targetId: candidate.targetId,
          scheduledFor: candidate.scheduledFor,
        }),
        nextAttemptAt: nextAllowedTime(
          now,
          preference.household.timezone,
          preference.quietStart,
          preference.quietEnd,
        ),
      });
    }
  }
  if (rows.length) {
    await prisma.notificationDelivery.createMany({ data: rows, skipDuplicates: true });
  }

  const deliveries = await prisma.notificationDelivery.findMany({
    where: {
      state: "queued",
      nextAttemptAt: { lte: now },
      attemptCount: { lt: 3 },
      installation: { state: "active" },
    },
    take: 100,
    orderBy: { nextAttemptAt: "asc" },
    include: {
      installation: { select: { expoPushToken: true } },
      member: { include: { notificationPreference: true } },
    },
  });
  if (!deliveries.length) return { queued: rows.length, sent: 0 };

  const messages = deliveries.map((delivery) => ({
    to: delivery.installation.expoPushToken,
    sound: "default",
    ...genericNotificationContent(
      delivery.kind,
      delivery.member.notificationPreference?.showPreview ?? false,
      candidates.find((candidate) =>
        candidate.kind === delivery.kind && candidate.targetId === delivery.targetId
      )?.safeTitle ?? "",
    ),
  }));

  let tickets: Array<{ status?: string; id?: string; details?: { error?: string } }>;
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("provider_unavailable");
    const payload = await response.json() as { data?: typeof tickets };
    tickets = payload.data ?? [];
  } catch {
    await Promise.all(deliveries.map((delivery) =>
      prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          state: delivery.attemptCount >= 2 ? "failed" : "queued",
          attemptCount: { increment: 1 },
          nextAttemptAt: new Date(now.getTime() + 5 * 60_000),
          lastErrorCode: "provider_unavailable",
        },
      }),
    ));
    return { queued: rows.length, sent: 0 };
  }

  let sent = 0;
  for (const [index, delivery] of deliveries.entries()) {
    const ticket = tickets[index];
    if (ticket?.status === "ok") {
      sent += 1;
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          state: "sent",
          attemptCount: { increment: 1 },
          providerReceiptId: ticket.id?.slice(0, 200) ?? null,
          sentAt: now,
          lastErrorCode: null,
        },
      });
    } else {
      const code = ticket?.details?.error === "DeviceNotRegistered"
        ? "device_invalid"
        : "provider_rejected";
      await prisma.$transaction([
        prisma.notificationDelivery.update({
          where: { id: delivery.id },
          data: {
            state: "failed",
            attemptCount: { increment: 1 },
            lastErrorCode: code,
          },
        }),
        ...(code === "device_invalid" ? [
          prisma.deviceInstallation.update({
            where: { id: delivery.installationId },
            data: { state: "invalid" as const },
          }),
        ] : []),
      ]);
    }
  }
  return { queued: rows.length, sent };
}

async function resolveRecurrenceMembers(
  occurrences: Array<{
    id: string;
    scheduledFor: Date;
    series: { targetType: string; targetId: string };
  }>,
): Promise<Candidate[]> {
  if (!occurrences.length) return [];
  const prisma = getPrismaClient();
  const taskIds = occurrences.filter((item) => item.series.targetType === "task").map((item) => item.series.targetId);
  const reminderIds = occurrences.filter((item) => item.series.targetType === "reminder").map((item) => item.series.targetId);
  const [tasks, reminders] = await Promise.all([
    prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: { id: true, assignedMemberId: true, title: true },
    }),
    prisma.reminder.findMany({
      where: { id: { in: reminderIds } },
      select: { id: true, assignedMemberId: true, title: true },
    }),
  ]);
  const targets = new Map([
    ...tasks.map((item) => [`task:${item.id}`, item] as const),
    ...reminders.map((item) => [`reminder:${item.id}`, item] as const),
  ]);
  return occurrences.flatMap((occurrence) => {
    const target = targets.get(`${occurrence.series.targetType}:${occurrence.series.targetId}`);
    return target?.assignedMemberId ? [{
      memberId: target.assignedMemberId,
      kind: "recurrence" as const,
      targetId: occurrence.id,
      scheduledFor: occurrence.scheduledFor,
      safeTitle: target.title,
    }] : [];
  });
}

function kindEnabled(preference: {
  tasksEnabled: boolean;
  remindersEnabled: boolean;
  billsEnabled: boolean;
  renewalsEnabled: boolean;
  intakeEnabled: boolean;
}, kind: NotificationKind) {
  if (kind === "task") return preference.tasksEnabled;
  if (kind === "reminder" || kind === "recurrence") return preference.remindersEnabled;
  if (kind === "bill") return preference.billsEnabled;
  if (kind === "renewal") return preference.renewalsEnabled;
  return preference.intakeEnabled;
}

function hashInstallationKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function success() {
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    success: true as const,
  };
}
