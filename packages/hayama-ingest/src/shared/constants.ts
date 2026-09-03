/** 葉山町サイトの起点URL */
export const HAYAMA_TOWN_BASE_URL = "https://www.town.hayama.lg.jp";

/**
 * 審議議案等の一覧と審議結果の年別ページ。
 * 令和2年は `r2`、令和3年以降は `r2_{元号年-2}`（令和7年 → `r2_5`）。
 */
export function buildYearIndexUrl(eraYear: number): string {
  const suffix = eraYear <= 2 ? "r2" : `r2_${eraYear - 2}`;
  return `${HAYAMA_TOWN_BASE_URL}/gikai/2_1/${suffix}/index.html`;
}

/** 議会中継システムの日程ページ */
export function buildScheduleUrl(kaigiId: number): string {
  return `https://hayama-gikai.gijiroku.com/g07_Nittei_Kaigi.asp?KaigiID=${kaigiId}`;
}

/** 日程ページの走査範囲（必要に応じて広げる） */
export const SCHEDULE_KAIGI_ID_MIN = 30;
export const SCHEDULE_KAIGI_ID_MAX = 70;
