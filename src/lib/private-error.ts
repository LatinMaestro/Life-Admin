const approvedCategories = new Set([
  "AccountDeletionError",
  "HouseholdAccessError",
  "MobileApiRequestError",
]);

export function privateErrorCategory(error: unknown) {
  if (error instanceof Error && approvedCategories.has(error.name)) {
    return error.name;
  }
  return "UnexpectedError";
}
