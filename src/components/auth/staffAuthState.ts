export type StaffAuthState = "loading" | "anonymous" | "authenticated";

export type StaffProfileState = object | null | undefined;

export function getStaffAuthState(
  token: string | null,
  profile: StaffProfileState,
  timedOut = false,
): StaffAuthState {
  if (!token) return "anonymous";
  if (profile === undefined && !timedOut) return "loading";
  if (profile === null || timedOut) return timedOut ? "loading" : "anonymous";
  return "authenticated";
}

export function sanitizeStaffNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (!(value.startsWith("/staff") || value.startsWith("/admin") || value.startsWith("/designer") || value.startsWith("/sales"))) return null;
  return value;
}

export function getDefaultRouteForRole(role?: string | null): string {
  switch (role) {
    case "designer":
      return "/designer";
    case "sales":
      return "/sales";
    case "ceo":
    case "admin":
    default:
      return "/admin";
  }
}
