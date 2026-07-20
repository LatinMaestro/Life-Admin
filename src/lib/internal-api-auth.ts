import { timingSafeEqual } from "node:crypto";

export function isAuthorizedInternalRequest(
  request: Request,
  secret = process.env.CRON_SECRET ?? "",
) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (secret.length < 32 || secret.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(secret), Buffer.from(supplied));
}
