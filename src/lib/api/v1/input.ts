import "server-only";

import { MobileApiRequestError } from "@/lib/api/v1/response";

export async function readJsonObject(request: Request) {
  const value: unknown = await request.json().catch(() => null);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new MobileApiRequestError("Send a valid JSON request.");
  }
  return value as Record<string, unknown>;
}

export function requireBoolean(input: Record<string, unknown>, field: string) {
  const value = input[field];
  if (typeof value !== "boolean") {
    throw new MobileApiRequestError(`${field} must be true or false.`);
  }
  return value;
}

export function requireEnum<const T extends readonly string[]>(
  input: Record<string, unknown>,
  field: string,
  choices: T,
): T[number] {
  const value = input[field];
  if (typeof value !== "string" || !choices.includes(value)) {
    throw new MobileApiRequestError(`Choose a valid ${field}.`);
  }
  return value as T[number];
}

export function requireId(value: string | undefined) {
  const id = value?.trim();
  if (!id || id.length > 100) {
    throw new MobileApiRequestError("Choose a valid household item.");
  }
  return id;
}
