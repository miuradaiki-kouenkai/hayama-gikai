import type { ParsedSessionSchedule } from "../shared/types";
import {
  monthDayToIsoDate,
  toHalfWidth,
  yearFromSessionLabel,
} from "./normalize-wareki";

/** 日程表タイトル（例: "令和7年第2回定例会招集会議" / "令和7年6月定例会議"） */
const TITLE_TAG_PATTERN = /<title[^>]*>(.*?)<\/title>/s;

function toText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8250;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** titleタグ（例: "令和7年6月定例会議会期日程表｜葉山町議会"）から会期名を取る。 */
function labelFromTitle(html: string): string {
  const matched = toHalfWidth(toText(html.match(TITLE_TAG_PATTERN)?.[1] ?? ""));
  const cut = matched.split(/[｜|]/)[0];
  const label = cut.replace(/会期日程表$/, "").replace(/\s+/g, "");
  if (!/(定例会|臨時会|招集会議|定例会議)$/.test(label)) return "";
  return label;
}

/**
 * 議会中継の日程ページから会期名と会議日の一覧を読み取る。
 * 年またぎの会期は、月が戻ったら年を1つ進める。
 */
export function parseSessionSchedule(html: string): ParsedSessionSchedule {
  const label = labelFromTitle(html);
  const baseYear = yearFromSessionLabel(label);
  if (!label || baseYear === null) {
    throw new Error("日程ページから会期名を読み取れなかった");
  }

  const dates: string[] = [];
  const seen = new Set<string>();
  let year = baseYear;
  let maxMonth = 0;
  const normalized = toHalfWidth(toText(html));
  const datePattern = /(\d{1,2})\s*月\s*(\d{1,2})\s*日/g;
  for (const match of normalized.matchAll(datePattern)) {
    const month = Number(match[1]);
    const day = Number(match[2]);
    if (month < maxMonth) year += 1;
    maxMonth = Math.max(maxMonth, month);
    const iso = monthDayToIsoDate(`${month}月${day}日`, year);
    if (iso && !seen.has(iso)) {
      seen.add(iso);
      dates.push(iso);
    }
  }
  dates.sort();

  return { label, dates };
}
