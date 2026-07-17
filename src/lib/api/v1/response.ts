import "server-only";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { HouseholdAccessContext } from "@/lib/access-control";
import type { MobileApiError, MobileApiErrorCode } from "@/lib/api/v1/contracts";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";
import { getCurrentHouseholdAccessContext } from "@/lib/auth/session";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export class MobileApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MobileApiRequestError";
  }
}

export async function withHouseholdApi<T>(
  handler: (context: HouseholdAccessContext) => Promise<T>,
) {
  if (!isClerkAuthenticationEnabled()) {
    return errorResponse(503, "live_mode_required", "The private household API is not active.");
  }

  const { userId } = await auth();
  if (!userId) {
    return errorResponse(401, "authentication_required", "Sign in to continue.");
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
    const data = await handler(context);
    return NextResponse.json(data, { status: 200, headers: privateHeaders });
  } catch (error) {
    if (error instanceof MobileApiRequestError) {
      return errorResponse(400, "invalid_request", error.message);
    }

    console.error("Unable to complete the private household API request.", error);
    return errorResponse(
      500,
      "unexpected_error",
      "The household request could not be completed.",
    );
  }
}

function errorResponse(status: number, code: MobileApiErrorCode, message: string) {
  return NextResponse.json<MobileApiError>(
    { error: { code, message } },
    { status, headers: privateHeaders },
  );
}
