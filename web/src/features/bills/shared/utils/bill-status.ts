import type { BillStatusEnum } from "../types";

/** status_note から拾う結果語。議決の種類をそのまま出す。 */
const NOTE_LABELS = [
  "趣旨了承",
  "不認定",
  "否決",
  "採択",
  "認定",
  "承認",
  "同意",
  "可決",
  "報告",
  "継続",
] as const;

/**
 * カード用のステータスラベルを取得。
 * status_note に結果語があればそれを出し、無ければステータスから畳む。
 */
export function getCardStatusLabel(
  status: BillStatusEnum,
  statusNote?: string | null
): string {
  if (statusNote) {
    const found = NOTE_LABELS.find((label) => statusNote.includes(label));
    if (found) return found === "継続" ? "継続審査" : found;
  }
  switch (status) {
    case "introduced":
    case "in_originating_house":
    case "in_receiving_house":
      return "審議中";
    case "enacted":
      return "可決";
    case "rejected":
      return "否決";
    default:
      return "提出前";
  }
}

/** ステータスに対応するBadgeのvariantを取得 */
export function getStatusVariant(
  status: BillStatusEnum
): "light" | "default" | "dark" | "muted" {
  switch (status) {
    case "introduced":
    case "in_originating_house":
    case "in_receiving_house":
      return "light";
    case "enacted":
      return "default";
    case "rejected":
      return "dark";
    default:
      return "muted";
  }
}
