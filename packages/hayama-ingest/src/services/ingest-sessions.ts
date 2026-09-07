import { HayamaSiteClient } from "../fetchers/hayama-site-client";
import { parseSessionIndex } from "../parsers/parse-session-index";
import {
  parseMonthSchedule,
  parseSessionSchedule,
} from "../parsers/parse-session-schedule";
import { parseTownSchedule } from "../parsers/parse-town-schedule";
import {
  parseScheduleYearLinks,
  parseScheduleYearPage,
} from "../parsers/parse-schedule-index";
import { buildSessionSlug, sessionMatchKey } from "../parsers/session-naming";
import { yearFromSessionLabel } from "../parsers/normalize-wareki";
import {
  SCHEDULE_KAIGI_ID_MAX,
  SCHEDULE_KAIGI_ID_MIN,
  HAYAMA_TOWN_BASE_URL,
  buildScheduleUrl,
  buildYearIndexUrl,
} from "../shared/constants";
import { upsertDietSession } from "../repositories/ingest-repository";

export type IngestSessionsParams = {
  /** 元号年（例: 8 = 令和8年） */
  eraYear: number;
  kaigiIdMin?: number;
  kaigiIdMax?: number;
  client?: HayamaSiteClient;
};

export type IngestSessionsResult = {
  sessions: { slug: string; name: string; startDate: string; endDate: string }[];
  skipped: string[];
};

const SCHEDULE_INDEX_URL = `${HAYAMA_TOWN_BASE_URL}/gikai/6/teireirinjinittei/index.html`;

/** 相手サーバーへの配慮として1件ずつ間を空けて取得する。 */
async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** 日程URLから会議日の一覧を取る（会期別・月別・町サイト表の形式に対応）。 */
async function fetchScheduleDates(
  client: HayamaSiteClient,
  url: string,
  eraYear: number
): Promise<string[]> {
  if (url.includes("Nittei_Month")) {
    const html = await client.fetchShiftJisText(url);
    return parseMonthSchedule(html).dates;
  }
  if (!url.includes("gijiroku.com")) {
    const html = await client.fetchText(url);
    return parseTownSchedule(html, eraYear).dates;
  }
  const html = await client.fetchShiftJisText(url);
  return parseSessionSchedule(html).dates;
}

/**
 * 年別index・公式の日程対応・議会中継の日程から会期を取り込む。
 * 日程が見つからない会期は日付が確定できないためスキップする。
 */
export async function ingestSessions(
  params: IngestSessionsParams
): Promise<IngestSessionsResult> {
  const client = params.client ?? new HayamaSiteClient();

  const indexHtml = await client.fetchText(buildYearIndexUrl(params.eraYear));
  const indexSessions = parseSessionIndex(indexHtml);

  // 公式の日程対応表（優先）
  const officialDates = new Map<string, string[]>();
  try {
    const scheduleIndex = await client.fetchText(SCHEDULE_INDEX_URL);
    const yearLink = parseScheduleYearLinks(scheduleIndex).find(
      (year) => year.eraYear === params.eraYear
    );
    if (yearLink) {
      const yearPage = await client.fetchText(yearLink.url);
      for (const entry of parseScheduleYearPage(yearPage)) {
        try {
          const dates = await fetchScheduleDates(client, entry.url, params.eraYear);
          if (dates.length > 0) {
            officialDates.set(sessionMatchKey(entry.label), dates);
          }
        } catch {
          // 個別の失敗は探査フォールバックに任せる
        }
        await sleep(500);
      }
    }
  } catch {
    // 日程index自体が取れなければ探査フォールバックに任せる
  }

  // フォールバック: KaigiID走査
  const kaigiIdMin = params.kaigiIdMin ?? SCHEDULE_KAIGI_ID_MIN;
  const kaigiIdMax = params.kaigiIdMax ?? SCHEDULE_KAIGI_ID_MAX;
  const probedDates = new Map<string, string[]>();
  for (let kaigiId = kaigiIdMin; kaigiId <= kaigiIdMax; kaigiId++) {
    try {
      const html = await client.fetchShiftJisText(buildScheduleUrl(kaigiId));
      const schedule = parseSessionSchedule(html);
      const year = yearFromSessionLabel(schedule.label);
      // 葉山町の取込対象は令和期のため、西暦 = 2018 + 元号年で照合する
      if (year === 2018 + params.eraYear && schedule.dates.length > 0) {
        probedDates.set(sessionMatchKey(schedule.label), schedule.dates);
      }
    } catch {
      // 存在しない番号・廃止ページは読み飛ばす
    }
    await sleep(500);
  }

  const sessions: IngestSessionsResult["sessions"] = [];
  const skipped: string[] = [];
  for (const indexSession of indexSessions) {
    const key = sessionMatchKey(indexSession.label);
    // 町サイト「第2回定例会6月定例会議」に対し日程表は「6月定例会議」のように
    // 回次を省く場合があるため、どちらかが他方を含むかで突合せる
    const findDates = (pool: Map<string, string[]>): string[] | undefined => {
      if (pool.has(key)) return pool.get(key);
      return [...pool.entries()].find(
        ([scheduleKey]) =>
          (scheduleKey.length >= 4 && key.includes(scheduleKey)) ||
          (key.length >= 4 && scheduleKey.includes(key))
      )?.[1];
    };
    const dates = findDates(officialDates) ?? findDates(probedDates);
    if (!dates || dates.length === 0) {
      skipped.push(indexSession.label);
      continue;
    }
    const name = `葉山町議会 ${indexSession.label}`;
    const slug = buildSessionSlug(indexSession.label, params.eraYear);
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    await upsertDietSession({
      name,
      slug,
      startDate,
      endDate,
      sourceUrl: indexSession.url,
    });
    sessions.push({ slug, name, startDate, endDate });
    await sleep(200);
  }

  return { sessions, skipped };
}
