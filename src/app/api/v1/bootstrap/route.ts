import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { MobileApiError } from "@/lib/api/v1/contracts";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";
import { getCurrentHouseholdAccessContext } from "@/lib/auth/session";
import { getMobileBootstrap } from "@/lib/server/mobile-bootstrap";

export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET() {
  if (!isClerkAuthenticationEnabled()) {
    return errorResponse(
      503,
      "live_mode_required",
      "The private household API is not active.",
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return errorResponse(
      401,
      "authentication_required",
      "Sign in to continue.",
    );
  }

  const context = await getCurrentHouseholdAccessContext();

  if (!context) {
    return errorResponse(
      403,
      "household_access_required",
      "An active household membership is required.",
    );
  }

  try {
    const bootstrap = await getMobileBootstrap(context);

    return NextResponse.json(bootstrap, {
      status: 200,
      headers: privateHeaders,
    });
  } catch (error) {
    console.error("Unable to build the mobile API bootstrap.", error);

    return errorResponse(
      500,
      "unexpected_error",
      "The household workspace could not be loaded.",
    );
  }
}

function errorResponse(
  status: number,
  code: MobileApiError["error"]["code"],
  message: string,
) {
  return NextResponse.json<MobileApiError>(
    { error: { code, message } },
    {
      status,
      headers: privateHeaders,
    },
  );
}
