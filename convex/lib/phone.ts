export function normalizeGhanaPhone(input: string): string {
  const raw = String(input ?? "").trim().replace(/[\s-]/g, "");
  let digits = raw;
  if (digits.startsWith("+233")) digits = digits.slice(4);
  else if (digits.startsWith("233")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^\d{9}$/.test(digits) || !/^[235]/.test(digits)) throw new Error("Enter a valid Ghana phone number.");
  return `+233${digits}`;
}

export function maskPhone(phone: string): string {
  const normalized = normalizeGhanaPhone(phone);
  return `+233 ${normalized.slice(4, 6)} *** **${normalized.slice(-2)}`;
}

export function toBmsLocal(phone: string): string {
  return `0${normalizeGhanaPhone(phone).slice(4)}`;
}
