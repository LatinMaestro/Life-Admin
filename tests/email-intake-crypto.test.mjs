import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveAliasLocalPart,
  hashAliasToken,
  hashProviderEvent,
  signEmailWebhook,
  verifyEmailWebhookSignature,
} from "../src/lib/email-intake-crypto.ts";

const secret = "test-secret-with-at-least-thirty-two-characters";

test("household aliases are deterministic and do not expose ids", () => {
  const first = deriveAliasLocalPart("household-alias-id", secret);
  assert.equal(first, deriveAliasLocalPart("household-alias-id", secret));
  assert.notEqual(first, deriveAliasLocalPart("another-alias-id", secret));
  assert.equal(first.length, 32);
  assert.equal(first.includes("household"), false);
});

test("alias and provider event hashes are stable opaque values", () => {
  assert.equal(hashAliasToken("ABC"), hashAliasToken("abc"));
  assert.equal(hashProviderEvent("event-1", secret).length, 64);
  assert.notEqual(hashProviderEvent("event-1", secret), hashProviderEvent("event-2", secret));
});

test("webhook signatures reject recipient, event, and signature changes", () => {
  const timestamp = "1784440000";
  const recipient = "token@intake.grovekind.com";
  const eventId = "a".repeat(64);
  const signature = signEmailWebhook(timestamp, recipient, eventId, secret);
  assert.equal(verifyEmailWebhookSignature(timestamp, recipient, eventId, signature, secret), true);
  assert.equal(verifyEmailWebhookSignature(timestamp, "other@intake.grovekind.com", eventId, signature, secret), false);
  assert.equal(verifyEmailWebhookSignature(timestamp, recipient, "b".repeat(64), signature, secret), false);
  assert.equal(verifyEmailWebhookSignature(timestamp, recipient, eventId, "0".repeat(64), secret), false);
});
