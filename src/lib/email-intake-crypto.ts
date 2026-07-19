import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function deriveAliasLocalPart(aliasId: string, secret: string) {
  requireSecret(secret);
  return createHmac("sha256", secret)
    .update(`alias:${aliasId}`)
    .digest("base64url")
    .slice(0, 32)
    .toLowerCase();
}

export function hashAliasToken(localPart: string) {
  return createHash("sha256").update(localPart.toLowerCase()).digest("hex");
}

export function hashProviderEvent(eventId: string, secret: string) {
  requireSecret(secret);
  return createHmac("sha256", secret).update(`event:${eventId}`).digest("hex");
}

export function signEmailWebhook(
  timestamp: string,
  recipient: string,
  eventId: string,
  secret: string,
) {
  requireSecret(secret);
  return createHmac("sha256", secret)
    .update(`${timestamp}.${recipient.toLowerCase()}.${eventId}`)
    .digest("hex");
}

export function verifyEmailWebhookSignature(
  timestamp: string,
  recipient: string,
  eventId: string,
  signature: string,
  secret: string,
) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(
    signEmailWebhook(timestamp, recipient, eventId, secret),
    "hex",
  );
  const supplied = Buffer.from(signature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function requireSecret(secret: string) {
  if (secret.length < 32) throw new Error("Email intake secret must be at least 32 characters.");
}
