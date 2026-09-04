import { monthDayToIsoDate, toHalfWidth } from "./normalize-wareki";

/**
 * 町サイトの日程表ページから読み取った会期日程。
 * 例: 令和2年「第1回定例会 日程」（月日/時間/会議事項/内容の表）。
 */
export type ParsedTownSchedule = {
  /** ページ表記そのまま（例: "第1回定例会 日程"） */
  label: string;
  /** 会議がある日（ISO 8601 の配列） */
  dates: string[];
};

/** 休会・変更注意などの行は会議日に数えない */
const SKIP_ROW_PATTERN = /休会|変更されることがあります/;

const TITLE_PATTERN = /<title>(.*?)<\/title>/s;
const ROW_PATTERN = /<tr[^>]*>(.*?)<\/tr>/gs;
const CELL_PATTERN = /<t[dh][^>]*>(.*?)<\/t[dh]>/gs;
const MONTH_DAY_PATTERN = /(\d{1,2})月(\d{1,2})日/;

function toText(html: string): string {
  return toHalfWidth(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/**
 * 町サイトの日程表ページを読み取る。
 * 年はページに無いため元号年から補う（1〜3月も同暦年扱い）。
 */
export function parseTownSchedule(html: string, eraYear: number): ParsedTownSchedule {
  const normalized = toHalfWidth(html);
  const title = normalized.match(TITLE_PATTERN)?.[1] ?? "";
  const label = toText(title).replace(/／葉山町$/, "").trim();
  if (!label) throw new Error("町サイトの日程表から会期名を読み取れなかった");
  const year = 2018 + eraYear;

  const dates: string[] = [];
  const seen = new Set<string>();
  for (const row of normalized.matchAll(ROW_PATTERN)) {
    const cells = [...row[1].matchAll(CELL_PATTERN)].map((c) => toText(c[1]));
    if (cells.length === 0) continue;
    const rowText = cells.join(" ");
    if (SKIP_ROW_PATTERN.test(rowText)) continue;
    const day = rowText.match(MONTH_DAY_PATTERN);
    if (!day) continue;
    const iso = monthDayToIsoDate(`${day[1]}月${day[2]}日`, year);
    if (iso && !seen.has(iso)) {
      seen.add(iso);
      dates.push(iso);
    }
  }
  dates.sort();
  return { label, dates };
}
