export function getClerkErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "errors" in error) {
    const errors = (error as {
      errors?: Array<{ longMessage?: string; message?: string }>;
    }).errors;
    return errors?.[0]?.longMessage ?? errors?.[0]?.message;
  }

  return error instanceof Error ? error.message : undefined;
}
