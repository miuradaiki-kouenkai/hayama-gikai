import { HayamaSiteClient } from "./fetchers/hayama-site-client";
import { ingestBills } from "./services/ingest-bills";
import { ingestSessions } from "./services/ingest-sessions";

export { ingestBills } from "./services/ingest-bills";
export type { IngestBillsParams, IngestBillsResult } from "./services/ingest-bills";
export { ingestSessions } from "./services/ingest-sessions";
export type {
  IngestSessionsParams,
  IngestSessionsResult,
} from "./services/ingest-sessions";

export type IngestMode = "sessions" | "bills" | "all";

export type IngestOptions = {
  mode: IngestMode;
  /** 元号年（例: 7 = 令和7年）。sessions / bills に必須 */
  eraYear: number;
  /** bills で取り込む定例会の開催月（例: 6）。省略時はその年の全会期 */
  month?: number;
  client?: HayamaSiteClient;
};

/**
 * 葉山町議会の公開情報からの取込エントリポイント。worker から呼ぶ。
 *
 * - sessions: 年別index＋議会中継の日程から会期を取り込む
 * - bills: 各会期ページの表から議案を取り込む（sessions 済みが前提）
 * - all: sessions → bills の順に実行する
 */
export async function runIngest(options: IngestOptions): Promise<void> {
  const client = options.client ?? new HayamaSiteClient();
  if (options.mode === "sessions" || options.mode === "all") {
    const stats = await ingestSessions({ eraYear: options.eraYear, client });
    console.log(`会期の取込完了:`, JSON.stringify(stats));
  }
  if (options.mode === "bills" || options.mode === "all") {
    const stats = await ingestBills({
      eraYear: options.eraYear,
      month: options.month,
      client,
    });
    console.log(`議案の取込完了:`, JSON.stringify(stats));
  }
}
