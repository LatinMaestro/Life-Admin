const publicPagePrefixes = [
  "/sign-in",
  "/sign-up",
  "/privacy",
  "/support",
  "/account-deletion",
  "/__clerk",
] as const;

export function isPublicRequestPath(pathname: string) {
  return (
    publicPagePrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    pathname === "/api/inbound/email" ||
    pathname.startsWith("/api/internal/")
  );
}
