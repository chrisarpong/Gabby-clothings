export type StaffRole = 'ceo' | 'admin' | 'designer' | 'sales';
export type StaffPermission = 'dashboard' | 'marketing' | 'orders' | 'inventory' | 'appointments' | 'reviews' | 'promotions' | 'content' | 'designer_portal' | 'financials';

export const STAFF_ROLES: Record<StaffRole, StaffPermission[]> = {
  ceo: ['dashboard', 'marketing', 'orders', 'inventory', 'appointments', 'reviews', 'promotions', 'content', 'designer_portal', 'financials'],
  admin: ['dashboard', 'orders', 'inventory', 'appointments', 'reviews', 'promotions', 'content'],
  designer: ['designer_portal'],
  sales: ['dashboard', 'orders'], // or whatever is appropriate
};

export function hasPermission(role: StaffRole, permission: string): boolean {
  return STAFF_ROLES[role]?.includes(permission as StaffPermission) ?? false;
}
