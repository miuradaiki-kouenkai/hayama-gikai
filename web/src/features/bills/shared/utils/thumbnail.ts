/**
 * サムネイルURLの正規化。
 * seedに仮画像として入っている外部プレースホルダ（placehold.co）は
 * 画像なしとして扱い null を返す。
 */
const PLACEHOLDER_HOSTS = ["placehold.co", "www.placehold.co"];

export function normalizeThumbnailUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (PLACEHOLDER_HOSTS.includes(host)) return null;
  } catch {
    return null;
  }
  return url;
}
