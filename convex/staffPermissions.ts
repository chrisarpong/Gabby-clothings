export type StaffRole = "ceo" | "admin" | "designer" | "sales";

export type StaffPermission =
  | "dashboard"
  | "orders"
  | "sales_portal"
  | "inventory"
  | "appointments"
  | "reviews"
  | "promotions"
  | "content"
  | "clients"
  | "messages"
  | "settings"
  | "audit_logs"
  | "designer_portal"
  | "marketing"
  | "financials"
  | "team_management";

export const STAFF_ROLES: Record<StaffRole, StaffPermission[]> = {
  ceo: [
    "dashboard",
    "orders",
    "sales_portal",
    "inventory",
    "appointments",
    "reviews",
    "promotions",
    "content",
    "clients",
    "messages",
    "settings",
    "audit_logs",
    "designer_portal",
    "marketing",
    "financials",
    "team_management",
  ],
  admin: [
    "dashboard",
    "orders",
    "sales_portal",
    "inventory",
    "appointments",
    "reviews",
    "promotions",
    "content",
    "clients",
    "messages",
    "settings",
    "audit_logs",
  ],
  designer: ["designer_portal"],
  sales: ["sales_portal", "clients"],
};

export function hasPermission(
  role: StaffRole,
  permission: StaffPermission | string,
): boolean {
  return STAFF_ROLES[role]?.includes(permission as StaffPermission) ?? false;
}
