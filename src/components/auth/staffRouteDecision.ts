export type StaffRouteProfile = {
  role: string;
  mustChangePassword?: boolean;
  totpEnabled?: boolean;
};

export type StaffRouteStep = "change-password" | "setup-2fa" | "ok";

/**
 * Returns the next required staff-auth step once the profile query has loaded.
 * A null result means that no redirect should happen yet (loading, signed out,
 * or already on the required page).
 */
export function getStaffRouteStep(
  token: string | null,
  profile: StaffRouteProfile | null | undefined,
  currentPath?: string,
): StaffRouteStep | null {
  if (!token || !profile) return null;

  const step: StaffRouteStep = profile.mustChangePassword
    ? "change-password"
    : (profile.role === "ceo" || profile.role === "admin") && !profile.totpEnabled
      ? "setup-2fa"
      : "ok";

  if (step === "change-password" && currentPath === "/staff/change-password") return null;
  if (step === "setup-2fa" && currentPath === "/staff/setup-2fa") return null;
  return step;
}
