import type { Database } from "@mirai-gikai/supabase";

/** DBの bill_status_enum。本家の型に合わせる。 */
export type BillStatus = Database["public"]["Enums"]["bill_status_enum"];

/** 可決系の結果 */
const ENACTED_DECISIONS = [
  "可決",
  "同意",
  "承認",
  "認定",
  "採択",
  "趣旨了承",
] as const;

/** 否決系の結果 */
const REJECTED_DECISIONS = ["否決", "不採択"] as const;

/**
 * 町サイトの結果欄から議案ステータスを決める。
 *
 * 結果がまだ出ていない議案は、委員会に付託されていれば `in_originating_house`、
 * そうでなければ `introduced` とする。
 */
export function toBillStatus(
  decision: string | null,
  committee: string | null
): BillStatus {
  const normalized = (decision ?? "").trim();
  if ((ENACTED_DECISIONS as readonly string[]).includes(normalized)) {
    return "enacted";
  }
  if ((REJECTED_DECISIONS as readonly string[]).includes(normalized)) {
    return "rejected";
  }
  if (normalized === "継続審査") return "in_originating_house";
  if (committee) return "in_originating_house";
  return "introduced";
}

/** 町民向けの短いステータス説明。議案詳細の補足に使う。 */
export function toStatusNote(
  decision: string | null,
  committee: string | null
): string | null {
  const normalized = (decision ?? "").trim();
  if (!normalized) {
    if (committee) return `${committee}委員会で審査中`;
    return "葉山町議会で審議中";
  }
  if (committee) return `${committee}委員会を経て、本会議で${normalized}`;
  return `本会議で${normalized}`;
}
