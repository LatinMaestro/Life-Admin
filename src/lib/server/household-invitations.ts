import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import type { HouseholdAccessContext, HouseholdRole } from "@/lib/access-control";
import { requireHouseholdPermission } from "@/lib/access-control";
import { getPrismaClient } from "@/lib/server/prisma";

const INVITATION_DAYS = 14;

export type PendingHouseholdInvitation = {
  id: string;
  invitedEmail: string;
  role: HouseholdRole;
  expiresAt: Date | null;
};

export class HouseholdInvitationError extends Error {
  constructor(message = "This invitation could not be completed.") {
    super(message);
    this.name = "HouseholdInvitationError";
  }
}

export async function listPendingHouseholdInvitations(
  context: HouseholdAccessContext,
): Promise<PendingHouseholdInvitation[]> {
  requireHouseholdPermission(context, "manage_household_members");

  return getPrismaClient().invitation.findMany({
    where: {
      householdId: context.householdId,
      status: "pending",
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      invitedEmail: true,
      role: true,
      expiresAt: true,
    },
  });
}

export async function createHouseholdInvitation(
  context: HouseholdAccessContext,
  email: string,
  role: HouseholdRole,
) {
  requireHouseholdPermission(context, "manage_household_members");
  const invitedEmail = normalizeEmail(email);
  const expiresAt = new Date(Date.now() + INVITATION_DAYS * 24 * 60 * 60 * 1000);

  await getPrismaClient().$transaction(async (tx) => {
    const admin = await tx.householdMember.findFirst({
      where: {
        id: context.memberId,
        userId: context.userId,
        householdId: context.householdId,
        role: "household_admin",
        status: "active",
      },
      select: { id: true },
    });

    if (!admin) {
      throw new HouseholdInvitationError();
    }

    const existingMember = await tx.householdMember.findFirst({
      where: {
        householdId: context.householdId,
        status: "active",
        user: { email: { equals: invitedEmail, mode: "insensitive" } },
      },
      select: { id: true },
    });

    if (existingMember) {
      throw new HouseholdInvitationError("That person is already in this household.");
    }

    await tx.invitation.updateMany({
      where: {
        householdId: context.householdId,
        invitedEmail: { equals: invitedEmail, mode: "insensitive" },
        status: "pending",
      },
      data: { status: "revoked" },
    });

    await tx.invitation.create({
      data: {
        householdId: context.householdId,
        invitedEmail,
        role,
        createdByUserId: context.userId,
        expiresAt,
      },
    });

    await tx.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType: "member",
        eventType: "created",
        summary: "A household invitation was created.",
      },
    });
  });
}

export async function acceptCurrentUserHouseholdInvitation() {
  const clerkUser = await currentUser();
  const verifiedEmail = clerkUser?.emailAddresses.find(
    (address) =>
      address.id === clerkUser.primaryEmailAddressId &&
      address.verification?.status === "verified",
  )?.emailAddress;

  if (!clerkUser || !verifiedEmail) {
    throw new HouseholdInvitationError("A verified email address is required.");
  }

  const invitedEmail = normalizeEmail(verifiedEmail);
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    invitedEmail.split("@")[0];
  const initials = getInitials(displayName);

  return getPrismaClient().$transaction(async (tx) => {
    const invitation = await tx.invitation.findFirst({
      where: {
        invitedEmail: { equals: invitedEmail, mode: "insensitive" },
        status: "pending",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "asc" },
    });

    if (!invitation) {
      throw new HouseholdInvitationError();
    }

    const subjectUser = await tx.user.findUnique({
      where: {
        authProvider_authSubject: {
          authProvider: "clerk",
          authSubject: clerkUser.id,
        },
      },
    });

    const emailOwner = await tx.user.findUnique({
      where: { email: invitedEmail },
      select: { id: true, authProvider: true, authSubject: true },
    });

    if (
      emailOwner &&
      (!subjectUser || emailOwner.id !== subjectUser.id)
    ) {
      throw new HouseholdInvitationError();
    }

    const user =
      subjectUser ??
      (await tx.user.create({
        data: {
          email: invitedEmail,
          name: displayName,
          avatarUrl: clerkUser.imageUrl || null,
          authProvider: "clerk",
          authSubject: clerkUser.id,
        },
      }));

    const membership = await tx.householdMember.upsert({
      where: {
        householdId_userId: {
          householdId: invitation.householdId,
          userId: user.id,
        },
      },
      update: {
        status: "active",
        role: invitation.role,
        displayName,
        initials,
      },
      create: {
        householdId: invitation.householdId,
        userId: user.id,
        role: invitation.role,
        displayName,
        initials,
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "accepted",
        acceptedAt: new Date(),
      },
    });

    await tx.activityEvent.create({
      data: {
        householdId: invitation.householdId,
        actorUserId: user.id,
        actorMemberId: membership.id,
        entityType: "member",
        entityId: membership.id,
        eventType: "created",
        summary: `${displayName} joined the household.`,
      },
    });

    return membership;
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
