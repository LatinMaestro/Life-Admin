import { NextResponse } from "next/server";

import { isAuthorizedInternalRequest } from "@/lib/internal-api-auth";
import { runPrivateMaintenance } from "@/lib/server/maintenance";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAuthorizedInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runPrivateMaintenance();
  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
