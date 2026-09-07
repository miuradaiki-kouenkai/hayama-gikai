import { toHalfWidth } from "./normalize-wareki";

/**
 * 会期ラベルから slug を作る（例: "令和7年第2回定例会6月定例会議" → "hayama-r7-2-06"）。
 * 月が無い会期は種別で区別する（招集会議 → "shoshu"、それ以外は "extra"）。
 */
export function buildSessionSlug(label: string, eraYear: number): string {
  const normalized = toHalfWidth(label).replace(/\s+/g, "");
  const round = normalized.match(/第(\d{1,2})回/)?.[1] ?? "0";
  const month = normalized.match(/(\d{1,2})月/)?.[1];
  const kind = normalized.includes("招集会議")
    ? "shoshu"
    : normalized.includes("臨時会")
      ? "extra"
      : null;
  const tail = month
    ? String(month).padStart(2, "0")
    : (kind ?? "main");
  return `hayama-r${eraYear}-${round}-${tail}`;
}

/**
 * 日程突合せ用の core を作る（元号年と空白を除く）。
 * 例: "令和7年第2回定例会6月定例会議" → "第2回定例会6月定例会議"
 */
export function sessionMatchKey(label: string): string {
  return toHalfWidth(label)
    .replace(/\s+/g, "")
    .replace(/^(令和|平成|昭和)\d{1,2}年/, "");
}
