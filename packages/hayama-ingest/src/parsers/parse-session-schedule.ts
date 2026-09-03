import type { ParsedSessionSchedule } from "../shared/types";
import {
  monthDayToIsoDate,
  toHalfWidth,
  yearFromSessionLabel,
} from "./normalize-wareki";

/** 日程表タイトル（例: "令和7年第2回定例会招集会議会期日程表"） */
const SCHEDULE_TITLE_PATTERN =
  /((?:令和|平成|昭和)\d{1,2}年第\d{1,2}回.+?(?:定例会|臨時会|招集会議)).{0,10}会期日程表/;

function toText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 議会中継の日程ページから会期名と会議日の一覧を読み取る。
 * 年またぎの会期は、月が戻ったら年を1つ進める。
 */
export function parseSessionSchedule(html: string): ParsedSessionSchedule {
  const text = toText(html);
  const normalized = toHalfWidth(text);

  const titleMatch = normalized.match(SCHEDULE_TITLE_PATTERN);
  const label = titleMatch ? titleMatch[1].replace(/\s+/g, "") : "";
  const baseYear = yearFromSessionLabel(label);
  if (!label || baseYear === null) {
    throw new Error("日程ページから会期名を読み取れなかった");
  }

  const dates: string[] = [];
  const seen = new Set<string>();
  let year = baseYear;
  let maxMonth = 0;
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
