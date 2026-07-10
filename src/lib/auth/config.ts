import "server-only";

export type AuthenticationMode = "demo" | "clerk";

export class AuthenticationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationConfigurationError";
  }
}

export function getAuthenticationMode(): AuthenticationMode {
  const mode = process.env.FAMILY_LIFE_ADMIN_AUTH_MODE ?? "demo";

  if (mode !== "demo" && mode !== "clerk") {
    throw new AuthenticationConfigurationError(
      "FAMILY_LIFE_ADMIN_AUTH_MODE must be either demo or clerk.",
    );
  }

  return mode;
}

export function isClerkAuthenticationEnabled() {
  return getAuthenticationMode() === "clerk";
}
