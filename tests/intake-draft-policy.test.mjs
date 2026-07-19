import assert from "node:assert/strict";
import test from "node:test";
import {
  projectSafeDraft,
  protectDraftField,
  protectTextForDraft,
} from "../src/lib/intake-draft-policy.ts";

test("bill extraction keeps admin fields and drops payment data before projection", () => {
  const source = [
    "Electricity bill",
    "Provider: Coast Energy",
    "Due: 24/07/2026",
    "BPAY biller code: 123456",
    "CRN: 987654321",
    "Account number: 1122334455",
    "Amount due: $123.45",
    "Please review the original notice.",
  ].join("\n");
  const draft = projectSafeDraft(source);

  assert.equal(draft.proposedType, "bill");
  assert.equal(draft.title, "Electricity bill");
  assert.equal(draft.provider, "Coast Energy");
  assert.equal(draft.dueAt?.toISOString(), "2026-07-24T09:00:00.000Z");
  assert.equal(draft.safeNotes, "Please review the original notice.");
  assert.deepEqual(draft.redactionSummary, {
    payment_route: 1,
    reference_identifier: 1,
    account_identifier: 1,
    monetary_amount: 1,
  });
  const serialized = JSON.stringify(draft);
  for (const value of ["123456", "987654321", "1122334455", "$123.45"]) {
    assert.equal(serialized.includes(value), false);
  }
});

test("routing and checksum-valid card lines are removed as whole spans", () => {
  const result = protectTextForDraft([
    "Renewal notice",
    "BSB 123-456",
    "Card 4111 1111 1111 1111",
    "Expires: 2026-09-30",
  ].join("\n"));

  assert.equal(result.safeText.includes("123-456"), false);
  assert.equal(result.safeText.includes("4111"), false);
  assert.equal(result.safeText.includes("Expires: 2026-09-30"), true);
  assert.equal(result.redactionSummary.payment_route, 1);
  assert.equal(result.redactionSummary.card_identifier, 1);
});

test("user-edited fields pass through the same protection boundary", () => {
  assert.equal(protectDraftField("Payment reference: 778899", 120), "");
  assert.equal(protectDraftField("Book annual smoke alarm check", 120), "Book annual smoke alarm check");
});

test("invalid dates do not become draft dates", () => {
  const draft = projectSafeDraft("School notice\nDue: 31/02/2026");
  assert.equal(draft.dueAt, null);
});
