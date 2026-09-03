import { HAYAMA_TOWN_BASE_URL } from "../shared/constants";
import { toHalfWidth } from "./normalize-wareki";

/** 日程indexから読み取った年別ページ */
export type ParsedScheduleYear = {
  /** 元号年（例: 7 = 令和7年。令和以外は null） */
  eraYear: number | null;
  /** 表記そのまま（例: "令和7年 定例会・臨時会日程"） */
  label: string;
  /** 年別ページの絶対URL */
  url: string;
};

/** 年別ページから読み取った会期の日程リンク */
export type ParsedScheduleEntry = {
  /** 表記そのまま（例: "第2回定例会 6月定例会議 日程"） */
  label: string;
  /** 日程ページの絶対URL（会期別 Kaigi / 月別 Month のいずれか） */
  url: string;
};

const LINK_PATTERN = /<a\s[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gs;

function cleanLabel(html: string): string {
  return toHalfWidth(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/**
 * 日程index（gikai/6/teireirinjinittei/）から年別ページの一覧を読み取る。
 */
export function parseScheduleYearLinks(
  html: string,
  baseUrl: string = HAYAMA_TOWN_BASE_URL
): ParsedScheduleYear[] {
  const found = new Map<string, ParsedScheduleYear>();
  for (const match of html.matchAll(LINK_PATTERN)) {
    const label = cleanLabel(match[2]);
    if (!label.includes("定例会・臨時会日程")) continue;
    const url = new URL(match[1], baseUrl).toString();
    if (found.has(url)) continue;
    const eraYear = label.match(/令和(\d{1,2})年/)?.[1];
    found.set(url, {
      eraYear: eraYear ? Number(eraYear) : null,
      label,
      url,
    });
  }
  return [...found.values()];
}

/**
 * 年別ページ（例: 令和7年）から会期の日程リンクを読み取る。
 */
export function parseScheduleYearPage(
  html: string,
  baseUrl: string = HAYAMA_TOWN_BASE_URL
): ParsedScheduleEntry[] {
  const found = new Map<string, ParsedScheduleEntry>();
  for (const match of html.matchAll(LINK_PATTERN)) {
    const label = cleanLabel(match[2]);
    if (!label.includes("日程")) continue;
    if (!/(定例|臨時|招集)/.test(label)) continue;
    const url = new URL(match[1], baseUrl).toString();
    if (!url.includes("gijiroku.com")) continue;
    if (found.has(url)) continue;
    found.set(url, { label, url });
  }
  return [...found.values()];
}
