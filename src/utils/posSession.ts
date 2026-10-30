export function posSessionKey(staffId: string, field: 'cart' | 'customerName' | 'customerEmail' | 'customerPhone') { return `pos_${field}_${staffId}`; }
export function prefillPosCustomer(staffId: string, value: { name: string; email: string; phone?: string }) {
  sessionStorage.setItem(posSessionKey(staffId, 'customerName'), value.name);
  sessionStorage.setItem(posSessionKey(staffId, 'customerEmail'), value.email);
  sessionStorage.setItem(posSessionKey(staffId, 'customerPhone'), value.phone || '');
}
export function loadPosCustomer(staffId: string) {
  return { name: sessionStorage.getItem(posSessionKey(staffId, 'customerName')) || '', email: sessionStorage.getItem(posSessionKey(staffId, 'customerEmail')) || '', phone: sessionStorage.getItem(posSessionKey(staffId, 'customerPhone')) || '' };
}
