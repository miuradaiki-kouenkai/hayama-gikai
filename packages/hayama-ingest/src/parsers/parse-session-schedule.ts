import type { ParsedSessionSchedule } from "../shared/types";
import {
  monthDayToIsoDate,
  toHalfWidth,
  toIsoDate,
  warekiToYear,
  yearFromSessionLabel,
} from "./normalize-wareki";

/** 日程表タイトルは title タグから取る（例: "令和7年6月定例会議会期日程表｜葉山町議会"） */
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

/** titleタグから会期名を取る。取れなければ空文字。 */
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

/** 月別日程ページから読み取った1か月分 */
export type ParsedMonthSchedule = {
  year: number;
  month: number;
  /** 会議がある日（ISO 8601 の配列） */
  dates: string[];
};

const MONTH_TITLE_PATTERN = /(令和|平成|昭和)(\d{1,2})年(\d{1,2})月/;
const DAY_BLOCK_PATTERN =
  /(\d{1,2})\s*日\s*\([日月火水木金土曜]+\)/g;
const MEETING_KEYWORDS = ["本会議", "委員会", "特別委員会", "全員協議会"];

/**
 * 月別日程ページ（Nittei_Month）から会議日を読み取る。
 * 日付に見出しがあり、後続ブロックに会議名がある日だけを拾う。
 */
export function parseMonthSchedule(html: string): ParsedMonthSchedule {
  const normalized = toHalfWidth(toText(html));
  const titleMatch = normalized.match(MONTH_TITLE_PATTERN);
  if (!titleMatch) throw new Error("月別日程ページから年月を読み取れなかった");
  const baseYear = warekiToYear(titleMatch[1], Number(titleMatch[2]));
  const month = Number(titleMatch[3]);
  if (baseYear === null) throw new Error("月別日程ページの元号が不明");

  const dates: string[] = [];
  const seen = new Set<string>();
  const marks = [...normalized.matchAll(DAY_BLOCK_PATTERN)];
  for (let i = 0; i < marks.length; i++) {
    const day = Number(marks[i][1]);
    const blockStart = (marks[i].index ?? 0) + marks[i][0].length;
    const blockEnd = marks[i + 1]?.index ?? normalized.length;
    const block = normalized.slice(blockStart, blockEnd);
    if (!MEETING_KEYWORDS.some((keyword) => block.includes(keyword))) continue;
    const iso = toIsoDate(baseYear, month, day);
    if (iso && !seen.has(iso)) {
      seen.add(iso);
      dates.push(iso);
    }
  }
  dates.sort();
  return { year: baseYear, month, dates };
}
