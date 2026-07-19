import "server-only";

import { randomUUID } from "node:crypto";
import { requireHouseholdPermission } from "@/lib/access-control";
import type { HouseholdAccessContext } from "@/lib/access-control";
import {
  deriveAliasLocalPart,
  hashAliasToken,
} from "@/lib/email-intake-crypto";
import { getPrismaClient } from "@/lib/server/prisma";

export async function getHouseholdEmailAlias(context: HouseholdAccessContext) {
  requireHouseholdPermission(context, "view_household");
  const alias = await getPrismaClient().intakeAlias.findFirst({
    where: { householdId: context.householdId, state: "active" },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });
  return response(alias ? addressFor(alias.id) : null, alias?.createdAt ?? null);
}

export async function createOrRotateHouseholdEmailAlias(
  context: HouseholdAccessContext,
) {
  requireHouseholdPermission(context, "manage_household_settings");
  const id = randomUUID();
  const localPart = deriveAliasLocalPart(id, aliasSecret());

  await getPrismaClient().$transaction(async (transaction) => {
    const admin = await transaction.householdMember.findFirst({
      where: {
        id: context.memberId,
        userId: context.userId,
        householdId: context.householdId,
        role: "household_admin",
        status: "active",
      },
      select: { id: true },
    });
    if (!admin) throw new Error("Only a household admin can manage forwarding.");

    await transaction.intakeAlias.updateMany({
      where: { householdId: context.householdId, state: "active" },
      data: { state: "revoked", revokedAt: new Date() },
    });
    await transaction.intakeAlias.create({
      data: {
        id,
        householdId: context.householdId,
        aliasTokenHash: hashAliasToken(localPart),
        createdByMemberId: context.memberId,
      },
    });
    await transaction.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType: "household",
        entityId: context.householdId,
        eventType: "updated",
        summary: "Updated the household forwarding address",
      },
    });
  });

  return response(addressFor(id), new Date());
}

function response(address: string | null, createdAt: Date | null) {
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
    address,
    createdAt: createdAt?.toISOString() ?? null,
  };
}

function addressFor(aliasId: string) {
  return `${deriveAliasLocalPart(aliasId, aliasSecret())}@${intakeDomain()}`;
}

function aliasSecret() {
  return process.env.EMAIL_ALIAS_SECRET ?? "";
}

function intakeDomain() {
  const domain = process.env.EMAIL_INTAKE_DOMAIN ?? "intake.grovekind.com";
  if (!/^[a-z0-9.-]+$/i.test(domain)) throw new Error("Email intake domain is invalid.");
  return domain.toLowerCase();
}
