/**
 * Server-side authorized-admin checks.
 * Phase 5 will attach real session verification; Phase 4 ships the pure helper.
 */

export type AuthIdentity = {
  userId: string | null;
  isAuthenticated: boolean;
};

export function isAuthorizedAdminUser(
  identity: AuthIdentity,
  authorizedUserIds: readonly string[],
): boolean {
  if (!identity.isAuthenticated || !identity.userId) {
    return false;
  }
  return authorizedUserIds.includes(identity.userId);
}

export function canMutateContent(identity: AuthIdentity, authorizedUserIds: readonly string[]) {
  return isAuthorizedAdminUser(identity, authorizedUserIds);
}

export function canReadContactSubmissions(
  identity: AuthIdentity,
  authorizedUserIds: readonly string[],
) {
  return isAuthorizedAdminUser(identity, authorizedUserIds);
}
