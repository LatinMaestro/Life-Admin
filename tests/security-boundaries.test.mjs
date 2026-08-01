import assert from "node:assert/strict";
import test from "node:test";

import {
  createHouseholdScopedWhere,
  createMemberScopedAuditFields,
  hasHouseholdPermission,
  requireHouseholdPermission,
} from "../src/lib/access-control.ts";
import { isAuthorizedInternalRequest } from "../src/lib/internal-api-auth.ts";
import { privateErrorCategory } from "../src/lib/private-error.ts";
import { isPublicRequestPath } from "../src/lib/request-boundary.ts";

const member = {
  userId: "user-1",
  householdId: "household-one",
  memberId: "member-1",
  role: "household_member",
};

test("member permissions never grant household administration", () => {
  assert.equal(hasHouseholdPermission(member, "manage_shared_items"), true);
  assert.equal(hasHouseholdPermission(member, "manage_household_settings"), false);
  assert.throws(
    () => requireHouseholdPermission(member, "manage_household_members"),
    { name: "HouseholdAccessError" },
  );
});

test("server ownership helpers ignore caller-supplied ownership", () => {
  assert.deepEqual(createHouseholdScopedWhere(member), { householdId: "household-one" });
  assert.deepEqual(createMemberScopedAuditFields(member), {
    householdId: "household-one",
    createdByMemberId: "member-1",
  });
});

test("internal jobs require a strong exact bearer secret", () => {
  const secret = "a".repeat(40);
  assert.equal(isAuthorizedInternalRequest(new Request("https://example.test"), secret), false);
  assert.equal(isAuthorizedInternalRequest(new Request("https://example.test", {
    headers: { Authorization: `Bearer ${"a".repeat(39)}` },
  }), secret), false);
  assert.equal(isAuthorizedInternalRequest(new Request("https://example.test", {
    headers: { Authorization: `Bearer ${secret}` },
  }), secret), true);
  assert.equal(isAuthorizedInternalRequest(new Request("https://example.test", {
    headers: { Authorization: "Bearer short" },
  }), "short"), false);
});

test("service-authenticated routes bypass Clerk without widening app access", () => {
  assert.equal(isPublicRequestPath("/api/inbound/email"), true);
  assert.equal(isPublicRequestPath("/api/internal/maintenance/cleanup"), true);
  assert.equal(isPublicRequestPath("/api/internal/notifications/dispatch"), true);
  assert.equal(isPublicRequestPath("/sign-in/sso-callback"), true);
  assert.equal(isPublicRequestPath("/__clerk/handler"), true);
  assert.equal(isPublicRequestPath("/api/inbound/email/other"), false);
  assert.equal(isPublicRequestPath("/api/internal"), false);
  assert.equal(isPublicRequestPath("/api/internal/future-operation"), false);
  assert.equal(isPublicRequestPath("/api/internal/maintenance/cleanup/extra"), false);
  assert.equal(isPublicRequestPath("/api/v1/tasks"), false);
  assert.equal(isPublicRequestPath("/privacy-centre"), false);
  assert.equal(isPublicRequestPath("/support-private"), false);
  assert.equal(isPublicRequestPath("/sign-internal"), false);
});

test("private errors expose categories, never provider or household messages", () => {
  const sensitive = new Error("Document for Smith household contained private text");
  assert.equal(privateErrorCategory(sensitive), "UnexpectedError");
  sensitive.name = "HouseholdAccessError";
  assert.equal(privateErrorCategory(sensitive), "HouseholdAccessError");
  assert.equal(privateErrorCategory(sensitive).includes("Smith"), false);
});
