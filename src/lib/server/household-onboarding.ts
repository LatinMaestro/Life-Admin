import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { getPrismaClient } from "@/lib/server/prisma";

const DEFAULT_TIMEZONE = "Australia/Brisbane";

export type HouseholdOnboardingState = {
  status: "ready" | "invited" | "needs_household";
  displayName: string;
  invitation?: {
    householdName: string;
    role: "household_admin" | "household_member";
  };
};

export class HouseholdOnboardingError extends Error {
  constructor(message = "Household setup could not be completed.") {
    super(message);
    this.name = "HouseholdOnboardingError";
  }
}

export async function getCurrentHouseholdOnboardingState(): Promise<HouseholdOnboardingState> {
  const identity = await requireCurrentClerkIdentity();
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      authProvider_authSubject: {
        authProvider: "clerk",
        authSubject: identity.subject,
      },
    },
    select: {
      memberships: {
        where: { status: "active" },
        take: 1,
        select: { id: true },
      },
    },
  });

  if (user?.memberships.length) {
    return { status: "ready", displayName: identity.displayName };
  }

  const invitation = await prisma.invitation.findFirst({
    where: {
      invitedEmail: { equals: identity.email, mode: "insensitive" },
      status: "pending",
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      household: { select: { name: true } },
    },
  });

  if (invitation) {
    return {
      status: "invited",
      displayName: identity.displayName,
      invitation: {
        householdName: invitation.household.name,
        role: invitation.role,
      },
    };
  }

  return { status: "needs_household", displayName: identity.displayName };
}

export async function createCurrentUserFirstHousehold(
  householdName: string,
  timezone = DEFAULT_TIMEZONE,
) {
  const name = householdName.trim();
  if (name.length < 2 || name.length > 80) {
    throw new HouseholdOnboardingError("Household name must be between 2 and 80 characters.");
  }
  if (!isValidTimezone(timezone)) {
    throw new HouseholdOnboardingError("Choose a valid household timezone.");
  }

  const identity = await requireCurrentClerkIdentity();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await getPrismaClient().$transaction(
        async (tx) => {
          const subjectUser = await tx.user.findUnique({
            where: {
              authProvider_authSubject: {
                authProvider: "clerk",
                authSubject: identity.subject,
              },
            },
            include: {
              memberships: {
                where: { status: "active" },
                orderBy: { joinedAt: "asc" },
                take: 1,
              },
            },
          });

          if (subjectUser?.memberships[0]) {
            return subjectUser.memberships[0];
          }

          const emailOwner = await tx.user.findUnique({
            where: { email: identity.email },
            select: { id: true },
          });

          if (emailOwner && emailOwner.id !== subjectUser?.id) {
            throw new HouseholdOnboardingError(
              "This email is already linked to another account. Please contact support.",
            );
          }

          const user =
            subjectUser ??
            (await tx.user.create({
              data: {
                email: identity.email,
                name: identity.displayName,
                avatarUrl: identity.avatarUrl,
                authProvider: "clerk",
                authSubject: identity.subject,
              },
            }));

          const household = await tx.household.create({
            data: {
              name,
              timezone,
              settings: {
                create: { defaultTimezone: timezone },
              },
              members: {
                create: {
                  userId: user.id,
                  role: "household_admin",
                  displayName: identity.displayName,
                  initials: getInitials(identity.displayName),
                },
              },
            },
            select: {
              id: true,
              members: {
                where: { userId: user.id },
                take: 1,
              },
            },
          });

          const membership = household.members[0];
          if (!membership) {
            throw new HouseholdOnboardingError();
          }

          await tx.activityEvent.create({
            data: {
              householdId: household.id,
              actorUserId: user.id,
              actorMemberId: membership.id,
              entityType: "household",
              entityId: household.id,
              eventType: "created",
              summary: `${name} was created.`,
            },
          });

          return membership;
        },
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      if (isRetryableTransactionError(error) && attempt === 0) continue;
      throw error;
    }
  }

  throw new HouseholdOnboardingError();
}

async function requireCurrentClerkIdentity() {
  const clerkUser = await currentUser();
  const verifiedEmail = clerkUser?.emailAddresses.find(
    (address) =>
      address.id === clerkUser.primaryEmailAddressId &&
      address.verification?.status === "verified",
  )?.emailAddress;

  if (!clerkUser || !verifiedEmail) {
    throw new HouseholdOnboardingError("A verified email address is required.");
  }

  const email = verifiedEmail.trim().toLowerCase();
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    email.split("@")[0];

  return {
    subject: clerkUser.id,
    email,
    displayName,
    avatarUrl: clerkUser.imageUrl || null,
  };
}

function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-AU", { timeZone: timezone }).format();
    return timezone.length <= 100;
  } catch {
    return false;
  }
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function isRetryableTransactionError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}
