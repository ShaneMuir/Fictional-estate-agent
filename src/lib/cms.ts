import { getEmDashCollection, getEmDashEntry } from 'emdash';

// The demo deliberately reads the complete small catalogue before filtering.
// A larger catalogue should move filtering/counts into indexed database queries.
export async function entries(collection: string, references?: Record<string, boolean>): Promise<any[]> {
  const result: any[] = [];
  let cursor: string | undefined;
  do {
    const page = await getEmDashCollection(collection as any, { limit: 100, cursor, ...(references ? { references } : {}) } as any);
    if (page.error) throw new Error(`Unable to load ${collection}`);
    result.push(...page.entries);
    cursor = page.nextCursor;
  } while (cursor);
  return result;
}
export async function entry(collection: string, slug: string, references?: Record<string, boolean>): Promise<any> {
  const result = await getEmDashEntry(collection as any, slug, references ? { references } as any : undefined);
  if (result.error && !result.entry) return null;
  return result.entry;
}
export async function globalContent() {
  const result = await entry('site_content', 'global');
  if (!result) throw new Error('Northfield shared content has not been seeded.');
  return result.data;
}
export const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
export function safeLink(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return value;
  try { const u = new URL(value); return ['https:', 'http:', 'mailto:', 'tel:'].includes(u.protocol) ? value : undefined; } catch { return undefined; }
}
export function fileUrl(value: any): string | undefined {
  return safeLink(value?.url || value?.src || (value?.meta?.storageKey ? `/_emdash/api/media/file/${value.meta.storageKey.split('/').map(encodeURIComponent).join('/')}` : ''));
}
