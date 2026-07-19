import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { dispatchDueNotifications } from "@/lib/server/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await dispatchDueNotifications();
  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET ?? "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (expected.length < 32 || expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}
