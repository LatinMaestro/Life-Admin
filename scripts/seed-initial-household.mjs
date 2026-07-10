import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const apply = process.argv.includes("--apply");
const required = [
  "DATABASE_URL",
  "LIFE_ADMIN_INITIAL_CLERK_SUBJECT",
  "LIFE_ADMIN_INITIAL_USER_EMAIL",
  "LIFE_ADMIN_INITIAL_USER_NAME",
  "LIFE_ADMIN_INITIAL_HOUSEHOLD_NAME",
];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.error(`Missing required seed configuration: ${missing.join(", ")}`);
  process.exit(1);
}

const clerkSubject = process.env.LIFE_ADMIN_INITIAL_CLERK_SUBJECT.trim();
const email = process.env.LIFE_ADMIN_INITIAL_USER_EMAIL.trim().toLowerCase();
const userName = process.env.LIFE_ADMIN_INITIAL_USER_NAME.trim();
const householdName = process.env.LIFE_ADMIN_INITIAL_HOUSEHOLD_NAME.trim();
const timezone =
  process.env.LIFE_ADMIN_INITIAL_HOUSEHOLD_TIMEZONE?.trim() || "Australia/Brisbane";
const memberName = process.env.LIFE_ADMIN_INITIAL_MEMBER_NAME?.trim() || userName;

if (!clerkSubject.startsWith("user_")) {
  console.error("LIFE_ADMIN_INITIAL_CLERK_SUBJECT has an unexpected format.");
  process.exit(1);
}

if (!email.includes("@")) {
  console.error("LIFE_ADMIN_INITIAL_USER_EMAIL has an unexpected format.");
  process.exit(1);
}

if (!apply) {
  console.log("Initial household seed configuration is valid. Re-run with --apply to write it.");
  process.exit(0);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

try {
  const result = await prisma.$transaction(async (tx) => {
    const identity = await tx.user.findUnique({
      where: {
        authProvider_authSubject: {
          authProvider: "clerk",
          authSubject: clerkSubject,
        },
      },
    });

    const emailOwner = await tx.user.findUnique({ where: { email } });

    if (identity && identity.email !== email) {
      throw new Error("The Clerk identity is already mapped to a different email.");
    }

    if (emailOwner && emailOwner.id !== identity?.id) {
      throw new Error(
        "The email already belongs to another internal user. Automatic identity linking is refused.",
      );
    }

    const user =
      identity ??
      (await tx.user.create({
        data: {
          authProvider: "clerk",
          authSubject: clerkSubject,
          email,
          name: userName,
        },
      }));

    const existingMembership = await tx.householdMember.findFirst({
      where: { userId: user.id },
      orderBy: { joinedAt: "asc" },
      select: { id: true, status: true },
    });

    if (existingMembership) {
      if (existingMembership.status !== "active") {
        throw new Error("The existing household membership is inactive and requires manual review.");
      }

      return "already-ready";
    }

    await tx.household.create({
      data: {
        name: householdName,
        timezone,
        settings: {
          create: {
            defaultTimezone: timezone,
          },
        },
        members: {
          create: {
            userId: user.id,
            role: "household_admin",
            status: "active",
            displayName: memberName,
            initials: getInitials(memberName),
          },
        },
      },
    });

    return "created";
  });

  console.log(
    result === "created"
      ? "Initial household and administrator membership created."
      : "Initial household administrator membership is already ready.",
  );
} finally {
  await prisma.$disconnect();
}

function getInitials(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
