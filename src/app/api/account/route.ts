import { NextResponse } from "next/server";
import { AccountDeletionError, deleteCurrentAccount } from "@/lib/server/account-deletion";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function DELETE(request: Request) {
  const input: unknown = await request.json().catch(() => null);
  const confirmation =
    input && typeof input === "object" && "confirmation" in input
      ? (input as { confirmation?: unknown }).confirmation
      : null;

  if (confirmation !== "DELETE") {
    return NextResponse.json(
      { error: { message: "Type DELETE to confirm account deletion." } },
      { status: 400, headers },
    );
  }

  try {
    await deleteCurrentAccount();
    return NextResponse.json({ success: true }, { status: 200, headers });
  } catch (error) {
    const message =
      error instanceof AccountDeletionError
        ? error.message
        : "The account could not be deleted.";
    return NextResponse.json(
      { error: { message } },
      { status: error instanceof AccountDeletionError ? 409 : 500, headers },
    );
  }
}
