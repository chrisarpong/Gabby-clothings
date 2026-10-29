export function convexSiteUrl(): string {
  const explicit = import.meta.env.VITE_CONVEX_SITE_URL as string | undefined;
  if (explicit) return explicit.replace(/\/$/, '');
  const convex = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!convex) return '';
  return convex.replace(/\.cloud(?=\.|$)/, '.site').replace(/\/$/, '');
}
export function getFileUrl(storageId: string): string {
  if (!storageId) return '';
  if (/^(https?:|\/|data:)/.test(storageId)) return storageId;
  return `${convexSiteUrl()}/getFile?storageId=${encodeURIComponent(storageId)}`;
}
