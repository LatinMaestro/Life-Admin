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

export function requireText(
  input: Record<string, unknown>,
  field: string,
  minimum: number,
  maximum: number,
) {
  const value = input[field];
  if (typeof value !== "string") {
    throw new MobileApiRequestError(`${field} is required.`);
  }
  const text = value.trim();
  if (text.length < minimum || text.length > maximum) {
    throw new MobileApiRequestError(
      `${field} must be between ${minimum} and ${maximum} characters.`,
    );
  }
  return text;
}

export function optionalText(
  input: Record<string, unknown>,
  field: string,
  maximum: number,
) {
  const value = input[field];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.trim().length > maximum) {
    throw new MobileApiRequestError(`${field} must be ${maximum} characters or fewer.`);
  }
  return value.trim() || null;
}

export function requireDate(input: Record<string, unknown>, field: string) {
  const value = input[field];
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new MobileApiRequestError(`${field} must be a valid date.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new MobileApiRequestError(`${field} must be a valid date.`);
  }
  return date;
}

export function optionalId(input: Record<string, unknown>, field: string) {
  const value = input[field];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new MobileApiRequestError(`${field} must be a valid household item.`);
  }
  return requireId(value);
}

export function optionalHttpsUrl(input: Record<string, unknown>, field: string) {
  const value = input[field];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 2_000) {
    throw new MobileApiRequestError(`${field} must be a valid HTTPS link.`);
  }
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") throw new Error("HTTPS required");
    return url.toString();
  } catch {
    throw new MobileApiRequestError(`${field} must be a valid HTTPS link.`);
  }
}
