import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  verifyEmailWebhookSignature,
} from "@/lib/email-intake-crypto";
import {
  MAX_INBOUND_EMAIL_BYTES,
  receiveForwardedEmail,
} from "@/lib/server/email-intake-receiver";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  const timestamp = request.headers.get("x-lifeadmin-timestamp") ?? "";
  const recipient = request.headers.get("x-lifeadmin-recipient") ?? "";
  const eventId = request.headers.get("x-lifeadmin-event") ?? "";
  const signature = request.headers.get("x-lifeadmin-signature") ?? "";
  const secret = process.env.EMAIL_WEBHOOK_SECRET ?? "";
  const sentAt = Number(timestamp);

  let verified = false;
  try {
    verified =
      Number.isSafeInteger(sentAt) &&
      Math.abs(Date.now() - sentAt * 1000) <= 5 * 60 * 1000 &&
      verifyEmailWebhookSignature(timestamp, recipient, eventId, signature, secret);
  } catch {
    verified = false;
  }

  if (!verified) {
    return NextResponse.json({ accepted: false }, { status: 401, headers });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_INBOUND_EMAIL_BYTES) {
    return NextResponse.json({ accepted: false }, { status: 413, headers });
  }

  const raw = new Uint8Array(await request.arrayBuffer());
  const actualEvent = createHash("sha256").update(raw).digest("hex");
  if (actualEvent !== eventId) {
    return NextResponse.json({ accepted: false }, { status: 401, headers });
  }

  try {
    const result = await receiveForwardedEmail({ recipient, eventId, raw });
    return NextResponse.json(result, { status: 202, headers });
  } catch {
    return NextResponse.json({ accepted: false }, { status: 400, headers });
  }
}
