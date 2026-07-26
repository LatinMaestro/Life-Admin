const publicPageRoutes = [
  "/sign-in",
  "/sign-up",
  "/privacy",
  "/support",
  "/account-deletion",
  "/__clerk",
] as const;

const serviceAuthenticatedRoutes = [
  "/api/inbound/email",
  "/api/internal/maintenance/cleanup",
  "/api/internal/notifications/dispatch",
] as const;

function matchesRouteOrChild(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isPublicRequestPath(pathname: string) {
  return (
    publicPageRoutes.some((route) => matchesRouteOrChild(pathname, route)) ||
    serviceAuthenticatedRoutes.some((route) => pathname === route)
  );
}
