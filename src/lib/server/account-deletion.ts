import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { requireCurrentAuthSession } from "@/lib/auth/session";
import { privateErrorCategory } from "@/lib/private-error";
import { getPrismaClient } from "@/lib/server/prisma";

export class AccountDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountDeletionError";
  }
}

export async function deleteCurrentAccount() {
  const [{ userId: clerkUserId }, session] = await Promise.all([
    auth(),
    requireCurrentAuthSession(),
  ]);

  if (!clerkUserId) throw new AccountDeletionError("Sign in to delete your account.");

  const request = await prepareDeletion(session.user.id, clerkUserId);

  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);
  } catch (error) {
    await markFailed(request.id, "Identity account deletion failed.");
    console.error("Unable to delete the Clerk account.", privateErrorCategory(error));
    throw new AccountDeletionError("The account could not be deleted. Please try again.");
  }

  try {
    await anonymizeAccount(request.id, session.user.id);
  } catch (error) {
    await markFailed(request.id, "Household data anonymization requires support review.");
    console.error(
      "Clerk account deleted but household anonymization failed.",
      privateErrorCategory(error),
    );
    throw new AccountDeletionError(
      "Your sign-in was removed. Household anonymization requires support review.",
    );
  }
}

async function prepareDeletion(userId: string, authSubject: string) {
  const prisma = getPrismaClient();

  return prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: userId, authSubject },
        select: { id: true },
      });
      if (!user) throw new AccountDeletionError("The account is not available.");

      const existing = await tx.accountDeletionRequest.findFirst({
        where: { userId, status: "pending" },
        orderBy: { requestedAt: "desc" },
      });
      if (existing) return existing;

      const adminMemberships = await tx.householdMember.findMany({
        where: { userId, status: "active", role: "household_admin" },
        select: { householdId: true },
      });

      const pending = await tx.accountDeletionRequest.findMany({
        where: { status: "pending", userId: { not: userId } },
        select: { userId: true },
      });
      const pendingUserIds = pending.map((item) => item.userId);

      for (const membership of adminMemberships) {
        const otherAdmins = await tx.householdMember.count({
          where: {
            householdId: membership.householdId,
            status: "active",
            role: "household_admin",
            userId: { not: userId, notIn: pendingUserIds },
          },
        });
        if (otherAdmins === 0) {
          throw new AccountDeletionError(
            "Choose another household admin before deleting your account.",
          );
        }
      }

      return tx.accountDeletionRequest.create({
        data: { userId, authSubject },
      });
    },
    { isolationLevel: "Serializable" },
  );
}

async function anonymizeAccount(requestId: string, userId: string) {
  const prisma = getPrismaClient();

  await prisma.$transaction(async (tx) => {
    const memberships = await tx.householdMember.findMany({
      where: { userId },
      select: { id: true, householdId: true },
    });
    const memberIds = memberships.map((item) => item.id);
    const householdIds = [...new Set(memberships.map((item) => item.householdId))];

    if (memberIds.length > 0) {
      await Promise.all([
        tx.inboxItem.updateMany({
          where: { assignedMemberId: { in: memberIds } },
          data: { assignedMemberId: null },
        }),
        tx.task.updateMany({
          where: { assignedMemberId: { in: memberIds } },
          data: { assignedMemberId: null },
        }),
        tx.reminder.updateMany({
          where: { assignedMemberId: { in: memberIds } },
          data: { assignedMemberId: null },
        }),
        tx.shoppingListItem.updateMany({
          where: { assignedMemberId: { in: memberIds } },
          data: { assignedMemberId: null },
        }),
        tx.billOrRenewal.updateMany({
          where: { assignedMemberId: { in: memberIds } },
          data: { assignedMemberId: null },
        }),
      ]);

      await tx.householdMember.updateMany({
        where: { id: { in: memberIds } },
        data: {
          status: "inactive",
          displayName: "Former member",
          initials: null,
        },
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        name: null,
        email: `deleted-${userId}@family-life-admin.invalid`,
        avatarUrl: null,
        authProvider: null,
        authSubject: null,
      },
    });

    if (householdIds.length > 0) {
      await tx.activityEvent.createMany({
        data: householdIds.map((householdId) => ({
          householdId,
          entityType: "member" as const,
          eventType: "changed_status" as const,
          summary: "A household member deleted their account",
        })),
      });
    }

    await tx.accountDeletionRequest.update({
      where: { id: requestId },
      data: { status: "completed", completedAt: new Date(), failureReason: null },
    });
  });
}

async function markFailed(requestId: string, failureReason: string) {
  try {
    await getPrismaClient().accountDeletionRequest.update({
      where: { id: requestId },
      data: { status: "failed", failureReason: failureReason.slice(0, 240) },
    });
  } catch (error) {
    console.error(
      "Unable to record account deletion failure.",
      privateErrorCategory(error),
    );
  }
}
